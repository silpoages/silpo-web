import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { createDailyMessage, getDailyMessages, updateDailyMessage } from '@/services/dailyMessages';
import type { DailyMessage } from '@/types/dailyMessage';
import { DailyMessages } from './DailyMessages';

vi.mock('@/services/dailyMessages', () => ({
  getDailyMessages: vi.fn(),
  createDailyMessage: vi.fn(),
  updateDailyMessage: vi.fn(),
}));

const rest: DailyMessage = {
  id: '1',
  message: 'Descanso também é parte do caminho.',
  enabled: true,
  lastShown: null,
  createdAt: '2026-07-01T12:00:00Z',
};
const help: DailyMessage = {
  id: '2',
  message: 'Pedir ajuda encurta caminho.',
  enabled: false,
  lastShown: null,
  createdAt: '2026-07-02T12:00:00Z',
};

function page(messages: DailyMessage[], total = messages.length) {
  const enabled = messages.filter((dailyMessage) => dailyMessage.enabled).length;
  return {
    messages,
    counts: { total: messages.length, enabled, disabled: messages.length - enabled },
    total,
  };
}

async function renderLoaded() {
  render(<DailyMessages />);
  await screen.findByText(rest.message);
}

describe('DailyMessages', () => {
  beforeEach(() => {
    vi.mocked(getDailyMessages)
      .mockReset()
      .mockResolvedValue(page([rest, help]));
    vi.mocked(createDailyMessage).mockReset();
    vi.mocked(updateDailyMessage).mockReset();
  });

  it('loads the first page with the status counters', async () => {
    render(<DailyMessages />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando mensagens');
    expect(await screen.findByText(rest.message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ativas 1' })).toBeInTheDocument();
    expect(getDailyMessages).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      search: '',
      status: 'all',
    });
  });

  it('sends the status tab, the search and the page size to the API', async () => {
    vi.mocked(getDailyMessages).mockResolvedValue(page([rest, help], 25));
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Página 2' }));
    await waitFor(() =>
      expect(getDailyMessages).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Inativas 1' }));
    await waitFor(() =>
      expect(getDailyMessages).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, status: 'disabled' }),
      ),
    );

    fireEvent.change(screen.getByLabelText('Buscar no texto da mensagem'), {
      target: { value: 'ajuda' },
    });
    await waitFor(() =>
      expect(getDailyMessages).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'ajuda' }),
      ),
    );

    fireEvent.change(screen.getByLabelText('Itens por página'), { target: { value: '20' } });
    await waitFor(() =>
      expect(getDailyMessages).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, pageSize: 20 }),
      ),
    );
  });

  it('goes back one page when the current page comes back empty', async () => {
    vi.mocked(getDailyMessages)
      .mockResolvedValueOnce(page([rest, help], 11))
      .mockResolvedValueOnce(page([], 10))
      .mockResolvedValue(page([rest], 10));
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Página 2' }));

    await waitFor(() =>
      expect(getDailyMessages).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })),
    );
    expect(await screen.findByText(rest.message)).toBeInTheDocument();
  });

  it('shows the error state and retries', async () => {
    vi.mocked(getDailyMessages).mockRejectedValueOnce(new ApiError(500, 'Erro'));
    render(<DailyMessages />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as mensagens.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText(rest.message)).toBeInTheDocument();
  });

  it('stays quiet on 401 while the session handler takes over', async () => {
    vi.mocked(getDailyMessages).mockRejectedValueOnce(new ApiError(401, 'expired'));
    render(<DailyMessages />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('ignores responses that arrive after the page is closed', async () => {
    let resolve: (value: ReturnType<typeof page>) => void = () => {};
    let reject: (error: unknown) => void = () => {};
    vi.mocked(getDailyMessages)
      .mockReturnValueOnce(new Promise((resolvePromise) => (resolve = resolvePromise)))
      .mockReturnValueOnce(new Promise((_, rejectPromise) => (reject = rejectPromise)));

    render(<DailyMessages />).unmount();
    render(<DailyMessages />).unmount();
    resolve(page([rest]));
    reject(new Error('offline'));
    await new Promise((resolveTick) => setTimeout(resolveTick, 0));

    expect(screen.queryByText(rest.message)).toBeNull();
  });

  it('toggles a message right away and keeps it after the API confirms', async () => {
    vi.mocked(updateDailyMessage).mockResolvedValue({ ...help, enabled: true });
    await renderLoaded();

    fireEvent.click(screen.getByRole('switch', { name: /pedir ajuda encurta caminho/i }));

    expect(screen.getByRole('button', { name: 'Ativas 2' })).toBeInTheDocument();
    expect(updateDailyMessage).toHaveBeenCalledWith('2', { enabled: true });
    await waitFor(() =>
      expect(screen.getAllByText('Ativa', { selector: '.status-badge' })).toHaveLength(2),
    );
  });

  it('removes a message from the tab it no longer belongs to', async () => {
    vi.mocked(getDailyMessages).mockResolvedValue(page([rest]));
    vi.mocked(updateDailyMessage).mockResolvedValue({ ...rest, enabled: false });
    render(<DailyMessages />);
    await screen.findByText(rest.message);
    fireEvent.click(screen.getByRole('button', { name: 'Ativas 1' }));
    await waitFor(() =>
      expect(getDailyMessages).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'enabled' }),
      ),
    );
    await screen.findByText(rest.message);

    fireEvent.click(screen.getByRole('switch', { name: /descanso também/i }));

    await waitFor(() => expect(screen.queryByText(rest.message)).toBeNull());
    expect(screen.getByText('Nenhuma mensagem com este status.')).toBeInTheDocument();
  });

  it('removes a message from the "Inativas" tab when it is turned on', async () => {
    vi.mocked(getDailyMessages).mockResolvedValue(page([help]));
    vi.mocked(updateDailyMessage).mockResolvedValue({ ...help, enabled: true });
    render(<DailyMessages />);
    await screen.findByText(help.message);
    fireEvent.click(screen.getByRole('button', { name: 'Inativas 1' }));
    await waitFor(() =>
      expect(getDailyMessages).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'disabled' }),
      ),
    );
    await screen.findByText(help.message);

    fireEvent.click(screen.getByRole('switch', { name: /pedir ajuda/i }));

    await waitFor(() => expect(screen.queryByText(help.message)).toBeNull());
  });

  it('undoes the toggle and explains when the API fails', async () => {
    vi.mocked(updateDailyMessage).mockRejectedValue(new ApiError(500, 'Erro'));
    await renderLoaded();

    fireEvent.click(screen.getByRole('switch', { name: /descanso também/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível atualizar o status da mensagem.',
    );
    expect(screen.getByRole('button', { name: 'Ativas 1' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /descanso também/i })).toBeChecked();
  });

  it('creates a message and reloads the list', async () => {
    vi.mocked(createDailyMessage).mockResolvedValue({ ...rest, id: '3', message: 'Nova.' });
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Nova mensagem' }));
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: ' Nova. ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar mensagem' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(createDailyMessage).toHaveBeenCalledWith({ message: 'Nova.', enabled: true });
    expect(getDailyMessages).toHaveBeenCalledTimes(2);
  });

  it('edits a message and reloads the list', async () => {
    vi.mocked(updateDailyMessage).mockResolvedValue({ ...rest, message: 'Revisada.' });
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: /editar mensagem: descanso/i }));
    expect(screen.getByLabelText('Mensagem')).toHaveValue(rest.message);
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Revisada.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(updateDailyMessage).toHaveBeenCalledWith('1', { message: 'Revisada.', enabled: true });
    expect(getDailyMessages).toHaveBeenCalledTimes(2);
  });

  it.each([
    [
      new ApiError(422, 'message: String should have at most 140 characters'),
      'message: String should have at most 140 characters',
    ],
    [new TypeError('Failed to fetch'), 'Não foi possível salvar a mensagem.'],
  ])('keeps the form open with the error when saving fails (%s)', async (error, message) => {
    vi.mocked(createDailyMessage).mockRejectedValue(error);
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Nova mensagem' }));
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Nova.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar mensagem' }));

    const dialog = screen.getByRole('dialog', { name: 'Nova mensagem' });
    expect(await within(dialog).findByText(message)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Criar mensagem' })).toBeEnabled();
  });

  it('closes the form without saving', async () => {
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Nova mensagem' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(createDailyMessage).not.toHaveBeenCalled();
  });
});
