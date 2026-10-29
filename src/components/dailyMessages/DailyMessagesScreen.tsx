import plusIcon from '@/assets/icons/plus.svg';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusTabs } from '@/components/ui/StatusTabs';
import type {
  DailyMessage,
  DailyMessageCounts,
  DailyMessageStatusFilter,
} from '@/types/dailyMessage';
import { DailyMessagesTable } from './DailyMessagesTable';
import './DailyMessagesScreen.css';

type DailyMessagesScreenProps = {
  messages: DailyMessage[];
  counts: DailyMessageCounts;
  statusFilter: DailyMessageStatusFilter;
  search: string;
  page: number;
  totalPages: number;
  pageSize: number;
  isLoading?: boolean;
  error?: string | null;
  onStatusFilterChange: (statusFilter: DailyMessageStatusFilter) => void;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onToggle: (id: string, isEnabled: boolean) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
  onRetry?: () => void;
};

function getEmptyMessage(search: string, counts: DailyMessageCounts) {
  if (search.trim()) {
    return `Nenhuma mensagem encontrada para "${search.trim()}".`;
  }
  if (counts.total === 0) {
    return 'Nenhuma mensagem cadastrada.';
  }
  return 'Nenhuma mensagem com este status.';
}

export function DailyMessagesScreen({
  messages,
  counts,
  statusFilter,
  search,
  page,
  totalPages,
  pageSize,
  isLoading = false,
  error = null,
  onStatusFilterChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onToggle,
  onEdit,
  onCreate,
  onRetry,
}: DailyMessagesScreenProps) {
  const statusTabs = [
    { value: 'all' as const, label: 'Todas', count: counts.total },
    { value: 'enabled' as const, label: 'Ativas', count: counts.enabled },
    { value: 'disabled' as const, label: 'Inativas', count: counts.disabled },
  ];

  function renderContent() {
    if (isLoading) {
      return (
        <p className="daily-messages__feedback" role="status">
          Carregando mensagens…
        </p>
      );
    }

    if (error) {
      return (
        <div className="daily-messages__feedback" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="daily-messages__retry" onClick={onRetry}>
              Tentar novamente
            </button>
          )}
        </div>
      );
    }

    if (messages.length === 0) {
      return <p className="daily-messages__feedback">{getEmptyMessage(search, counts)}</p>;
    }

    return (
      <>
        <DailyMessagesTable messages={messages} onToggle={onToggle} onEdit={onEdit} />
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </>
    );
  }

  return (
    <section className="daily-messages" aria-labelledby="daily-messages-heading">
      <header className="daily-messages__header">
        <div>
          <h1 id="daily-messages-heading" className="daily-messages__title">
            Mensagens diárias
          </h1>
          <p className="daily-messages__subtitle">
            Só mensagens ativas entram no rodízio exibido aos usuários.
          </p>
        </div>
        <button type="button" className="daily-messages__create" onClick={onCreate}>
          <img src={plusIcon} alt="" width={18} height={18} />
          Nova mensagem
        </button>
      </header>

      <div className="daily-messages__filters">
        <StatusTabs
          tabs={statusTabs}
          value={statusFilter}
          label="Filtrar por status"
          onChange={onStatusFilterChange}
        />
        <SearchInput
          id="daily-messages-search"
          label="Buscar no texto da mensagem"
          placeholder="Buscar no texto da mensagem..."
          value={search}
          onChange={onSearchChange}
        />
      </div>

      <div className="daily-messages__card">{renderContent()}</div>
    </section>
  );
}
