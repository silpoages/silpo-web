import { useEffect, useState } from 'react';
import { DailyMessageFormModal } from '@/components/dailyMessages/DailyMessageFormModal';
import { DailyMessagesScreen } from '@/components/dailyMessages/DailyMessagesScreen';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ApiError } from '@/services/api';
import { createDailyMessage, getDailyMessages, updateDailyMessage } from '@/services/dailyMessages';
import type {
  DailyMessage,
  DailyMessageCounts,
  DailyMessageFormValues,
  DailyMessageStatusFilter,
} from '@/types/dailyMessage';

const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_COUNTS: DailyMessageCounts = { total: 0, enabled: 0, disabled: 0 };

type FormState = { mode: 'create' } | { mode: 'edit'; messageId: string } | null;
type LoadResult = {
  key: string;
  messages: DailyMessage[];
  counts: DailyMessageCounts;
  total: number;
  error: string | null;
};

export function DailyMessages() {
  const [messages, setMessages] = useState<DailyMessage[]>([]);
  const [counts, setCounts] = useState<DailyMessageCounts>(EMPTY_COUNTS);
  const [statusFilter, setStatusFilter] = useState<DailyMessageStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadResult, setLoadResult] = useState<LoadResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const requestKey = [page, pageSize, debouncedSearch, statusFilter, reloadKey].join('|');

  useEffect(() => {
    let isCurrent = true;

    getDailyMessages({ page, pageSize, search: debouncedSearch, status: statusFilter })
      .then((result) => {
        if (!isCurrent) return;
        if (result.messages.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setMessages(result.messages);
        setCounts(result.counts);
        setLoadResult({ key: requestKey, ...result, error: null });
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (error instanceof ApiError && error.status === 401) return;
        setLoadResult({
          key: requestKey,
          messages: [],
          counts: EMPTY_COUNTS,
          total: 0,
          error: 'Não foi possível carregar as mensagens.',
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [requestKey, page, pageSize, debouncedSearch, statusFilter]);

  const isLoading = loadResult?.key !== requestKey;
  const total = loadResult?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const editingMessage =
    formState?.mode === 'edit'
      ? messages.find((dailyMessage) => dailyMessage.id === formState.messageId)
      : undefined;

  function reload() {
    setReloadKey((key) => key + 1);
  }

  function handleStatusFilterChange(nextStatusFilter: DailyMessageStatusFilter) {
    setStatusFilter(nextStatusFilter);
    setPage(1);
  }

  function handleSearchChange(nextSearch: string) {
    setSearch(nextSearch);
    setPage(1);
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  async function handleToggle(id: string, isEnabled: boolean) {
    const previous = messages;
    const previousCounts = counts;
    setNotice(null);
    setMessages((current) =>
      current.map((dailyMessage) =>
        dailyMessage.id === id ? { ...dailyMessage, enabled: isEnabled } : dailyMessage,
      ),
    );
    setCounts((current) => ({
      ...current,
      enabled: current.enabled + (isEnabled ? 1 : -1),
      disabled: current.disabled + (isEnabled ? -1 : 1),
    }));

    try {
      await updateDailyMessage(id, { enabled: isEnabled });
      const leavesTab =
        (statusFilter === 'enabled' && !isEnabled) || (statusFilter === 'disabled' && isEnabled);
      if (leavesTab) {
        setMessages((current) => current.filter((dailyMessage) => dailyMessage.id !== id));
      }
    } catch {
      setMessages(previous);
      setCounts(previousCounts);
      setNotice('Não foi possível atualizar o status da mensagem.');
    }
  }

  async function handleFormSubmit(values: DailyMessageFormValues) {
    if (formState?.mode === 'edit') {
      await updateDailyMessage(formState.messageId, values);
    } else {
      await createDailyMessage(values);
    }
    setFormState(null);
    setNotice(null);
    reload();
  }

  return (
    <>
      <DailyMessagesScreen
        messages={isLoading ? [] : messages}
        counts={counts}
        statusFilter={statusFilter}
        search={search}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        isLoading={isLoading}
        error={loadResult?.key === requestKey ? loadResult.error : null}
        notice={notice}
        onStatusFilterChange={handleStatusFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onToggle={(id, isEnabled) => void handleToggle(id, isEnabled)}
        onEdit={(id) => setFormState({ mode: 'edit', messageId: id })}
        onCreate={() => setFormState({ mode: 'create' })}
        onRetry={reload}
      />

      {formState && (
        <DailyMessageFormModal
          key={editingMessage?.id ?? 'new'}
          dailyMessage={editingMessage}
          onSubmit={handleFormSubmit}
          onClose={() => setFormState(null)}
        />
      )}
    </>
  );
}
