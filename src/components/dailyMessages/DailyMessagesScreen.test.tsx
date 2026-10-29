import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DailyMessage } from '@/types/dailyMessage';
import { DailyMessagesScreen } from './DailyMessagesScreen';

const messages: DailyMessage[] = [
  {
    id: '1',
    message: 'Descanso também é parte do caminho.',
    enabled: true,
    lastShown: '2026-08-19T12:00:00Z',
    createdAt: '2026-07-01T12:00:00Z',
  },
  {
    id: '2',
    message: 'Pedir ajuda encurta caminho.',
    enabled: false,
    lastShown: null,
    createdAt: '2026-07-02T12:00:00Z',
  },
];

function renderScreen(props: Partial<Parameters<typeof DailyMessagesScreen>[0]> = {}) {
  const handlers = {
    onStatusFilterChange: vi.fn(),
    onSearchChange: vi.fn(),
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onCreate: vi.fn(),
    onRetry: vi.fn(),
  };

  render(
    <DailyMessagesScreen
      messages={messages}
      counts={{ total: 64, enabled: 51, disabled: 13 }}
      statusFilter="all"
      search=""
      page={1}
      totalPages={2}
      pageSize={10}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
}

describe('DailyMessagesScreen', () => {
  it('renders the messages table without an authorship column', () => {
    renderScreen();

    expect(screen.getByRole('heading', { name: 'Mensagens diárias' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Mensagem',
      'Última exibição',
      'Status',
      'Ativa',
      'Ações',
    ]);
    expect(screen.getByText('Descanso também é parte do caminho.')).toBeInTheDocument();
    expect(screen.getByText('19/08/2026')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Ativa', { selector: '.status-badge' })).toBeInTheDocument();
    expect(screen.getByText('Inativa', { selector: '.status-badge' })).toBeInTheDocument();
  });

  it('shows status counters and notifies the selected filter', () => {
    const { onStatusFilterChange } = renderScreen();

    expect(screen.getByRole('button', { name: 'Todas 64' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Inativas 13' }));

    expect(onStatusFilterChange).toHaveBeenCalledWith('disabled');
  });

  it('notifies search, toggle, edit and create actions', () => {
    const { onSearchChange, onToggle, onEdit, onCreate } = renderScreen();

    fireEvent.change(screen.getByLabelText('Buscar no texto da mensagem'), {
      target: { value: 'ajuda' },
    });
    fireEvent.click(screen.getByRole('switch', { name: /pedir ajuda encurta caminho/i }));
    fireEvent.click(screen.getByRole('button', { name: /editar mensagem: descanso/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Nova mensagem' }));

    expect(onSearchChange).toHaveBeenCalledWith('ajuda');
    expect(onToggle).toHaveBeenCalledWith('2', true);
    expect(onEdit).toHaveBeenCalledWith('1');
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('shows the loading state', () => {
    renderScreen({ isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando mensagens');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the error state with retry', () => {
    const { onRetry } = renderScreen({ error: 'Não foi possível carregar as mensagens.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar as mensagens.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the empty state when there are no messages', () => {
    renderScreen({ messages: [], counts: { total: 0, enabled: 0, disabled: 0 } });

    expect(screen.getByText('Nenhuma mensagem cadastrada.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the no results state when the search matches nothing', () => {
    renderScreen({ messages: [], search: 'xyz' });

    expect(screen.getByText('Nenhuma mensagem encontrada para "xyz".')).toBeInTheDocument();
  });
});
