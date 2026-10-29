import { useState } from 'react';
import { DailyMessageFormModal } from '@/components/dailyMessages/DailyMessageFormModal';
import { DailyMessagesScreen } from '@/components/dailyMessages/DailyMessagesScreen';
import type {
  DailyMessage,
  DailyMessageFormValues,
  DailyMessageStatusFilter,
} from '@/types/dailyMessage';
import { DAILY_MESSAGES_MOCK } from './dailyMessagesMock';

type FormState = { mode: 'create' } | { mode: 'edit'; messageId: string } | null;

function matchesStatus(dailyMessage: DailyMessage, statusFilter: DailyMessageStatusFilter) {
  if (statusFilter === 'enabled') return dailyMessage.enabled;
  if (statusFilter === 'disabled') return !dailyMessage.enabled;
  return true;
}

export function DailyMessages() {
  const [messages, setMessages] = useState(DAILY_MESSAGES_MOCK);
  const [statusFilter, setStatusFilter] = useState<DailyMessageStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formState, setFormState] = useState<FormState>(null);

  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const searchedMessages = messages.filter((dailyMessage) =>
    dailyMessage.message.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
  );
  const filteredMessages = searchedMessages.filter((dailyMessage) =>
    matchesStatus(dailyMessage, statusFilter),
  );
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageMessages = filteredMessages.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const enabledCount = searchedMessages.filter((dailyMessage) => dailyMessage.enabled).length;
  const editingMessage =
    formState?.mode === 'edit'
      ? messages.find((dailyMessage) => dailyMessage.id === formState.messageId)
      : undefined;

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

  function handleToggle(id: string, isEnabled: boolean) {
    setMessages((currentMessages) =>
      currentMessages.map((dailyMessage) =>
        dailyMessage.id === id ? { ...dailyMessage, enabled: isEnabled } : dailyMessage,
      ),
    );
  }

  function handleFormSubmit(values: DailyMessageFormValues) {
    if (formState?.mode === 'edit') {
      const { messageId } = formState;
      setMessages((currentMessages) =>
        currentMessages.map((dailyMessage) =>
          dailyMessage.id === messageId ? { ...dailyMessage, ...values } : dailyMessage,
        ),
      );
    } else {
      const newMessage: DailyMessage = {
        ...values,
        id: crypto.randomUUID(),
        lastShown: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((currentMessages) => [newMessage, ...currentMessages]);
    }
    setFormState(null);
  }

  return (
    <>
      <DailyMessagesScreen
        messages={pageMessages}
        counts={{
          total: searchedMessages.length,
          enabled: enabledCount,
          disabled: searchedMessages.length - enabledCount,
        }}
        statusFilter={statusFilter}
        search={search}
        page={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onStatusFilterChange={handleStatusFilterChange}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onToggle={handleToggle}
        onEdit={(id) => setFormState({ mode: 'edit', messageId: id })}
        onCreate={() => setFormState({ mode: 'create' })}
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
