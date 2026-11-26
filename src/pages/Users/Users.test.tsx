import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { createUser, getUsers, updateUser } from '@/services/users';
import type { AdminUser } from '@/types/user';
import { Users } from './Users';

vi.mock('@/services/users', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
}));

const marina: AdminUser = {
  id: '1',
  name: 'Marina Alves',
  email: 'marina.alves@email.com',
  birthDate: '1997-03-12',
  gender: 'FEMALE',
  isActive: true,
  createdAt: '2026-03-12T12:00:00Z',
};

const helena: AdminUser = {
  id: '2',
  name: 'Helena Prado',
  email: 'helena.p@email.com',
  birthDate: null,
  gender: 'FEMALE',
  isActive: true,
  createdAt: '2026-04-02T12:00:00Z',
};

describe('Users', () => {
  beforeEach(() => {
    vi.mocked(getUsers).mockReset();
    vi.mocked(createUser).mockReset();
    vi.mocked(updateUser).mockReset();
    vi.mocked(getUsers).mockResolvedValue({ users: [marina, helena], total: 2 });
  });

  it('loads the first page of app accounts', async () => {
    render(<Users />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando usuários');
    expect(await screen.findByText('Marina Alves')).toBeInTheDocument();
    expect(getUsers).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      search: '',
      filters: { status: 'all', gender: 'all' },
    });
  });

  it('sends the search and filters to the API', async () => {
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.change(screen.getByLabelText('Buscar por nome ou e-mail'), {
      target: { value: 'helena' },
    });
    await waitFor(() =>
      expect(getUsers).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'helena' })),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'inactive' } });

    await waitFor(() =>
      expect(getUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ filters: { status: 'inactive', gender: 'all' } }),
      ),
    );
  });

  it('shows the error state and retries', async () => {
    vi.mocked(getUsers).mockRejectedValueOnce(new ApiError(500, 'Erro interno'));
    render(<Users />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro interno');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Marina Alves')).toBeInTheDocument();
  });

  it('only deactivates a user after confirmation and reloads the list', async () => {
    vi.mocked(updateUser).mockResolvedValue({ ...marina, isActive: false });
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário: Marina Alves' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Desativar usuário?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(updateUser).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário: Marina Alves' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(updateUser).toHaveBeenCalledWith('1', { isActive: false });
    expect(getUsers).toHaveBeenCalledTimes(2);
  });

  it('keeps the confirmation open when deactivation fails', async () => {
    vi.mocked(updateUser).mockRejectedValue(
      new ApiError(400, 'Você não pode desativar a própria conta'),
    );
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário: Marina Alves' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Você não pode desativar a própria conta',
    );
  });

  it('edits a user from the details modal', async () => {
    vi.mocked(updateUser).mockResolvedValue({ ...marina, name: 'Marina A. Alves' });
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Marina Alves' }));
    const dialog = screen.getByRole('dialog', { name: 'Marina Alves' });
    expect(within(dialog).getByText('marina.alves@email.com')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Marina A. Alves' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(updateUser).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ name: 'Marina A. Alves', email: 'marina.alves@email.com' }),
    );
  });

  it('shows a friendly message when the e-mail is already in use', async () => {
    vi.mocked(createUser).mockRejectedValue(new ApiError(409, 'Email já cadastrado'));
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Novo usuário' }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Outra Marina' } });
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'marina.alves@email.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe uma conta com este e-mail.',
    );
    expect(screen.getByRole('dialog', { name: 'Novo usuário' })).toBeInTheDocument();
  });

  it('creates a user and reloads the list', async () => {
    vi.mocked(createUser).mockResolvedValue({ ...helena, id: '3', name: 'Nova Pessoa' });
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Novo usuário' }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Nova Pessoa' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'nova@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nova Pessoa', email: 'nova@email.com' }),
    );
    expect(getUsers).toHaveBeenCalledTimes(2);
  });

  it('edits a user straight from the table and closes the form on cancel', async () => {
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Editar usuário: Helena Prado' }));
    expect(screen.getByLabelText('Nome')).toHaveValue('Helena Prado');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('closes the details modal', async () => {
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Helena Prado' }));
    const dialog = screen.getByRole('dialog', { name: 'Helena Prado' });
    expect(within(dialog).getByText('—')).toBeInTheDocument();
    // O "X" do cabeçalho e o botão do rodapé fecham do mesmo jeito.
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Fechar' })[1]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Helena Prado' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' })[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks for the page size and goes back to the first page', async () => {
    vi.mocked(getUsers).mockResolvedValue({ users: [marina, helena], total: 25 });
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Página 2' }));
    await waitFor(() =>
      expect(getUsers).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })),
    );
    fireEvent.change(screen.getByLabelText('Itens por página'), { target: { value: '20' } });

    await waitFor(() =>
      expect(getUsers).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, pageSize: 20 })),
    );
  });

  it('goes back one page when the current page comes back empty', async () => {
    vi.mocked(getUsers)
      .mockResolvedValueOnce({ users: [marina, helena], total: 12 })
      .mockResolvedValueOnce({ users: [], total: 10 })
      .mockResolvedValue({ users: [marina], total: 10 });
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Página 2' }));

    await waitFor(() =>
      expect(getUsers).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })),
    );
    expect(await screen.findByText('Marina Alves')).toBeInTheDocument();
    expect(getUsers).toHaveBeenCalledTimes(3);
  });

  it('filters by gender and clears the filters', async () => {
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    fireEvent.change(screen.getByLabelText('Gênero'), { target: { value: 'MALE' } });
    await waitFor(() =>
      expect(getUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ filters: { status: 'all', gender: 'MALE' } }),
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    await waitFor(() =>
      expect(getUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ filters: { status: 'all', gender: 'all' } }),
      ),
    );
  });

  it.each([
    [new ApiError(403, 'Forbidden'), 'Você não tem permissão para gerenciar usuários.'],
    [new Error('offline'), 'Não foi possível carregar os usuários.'],
  ])('explains load failures (%s)', async (error, message) => {
    vi.mocked(getUsers).mockRejectedValueOnce(error);
    render(<Users />);

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });

  it('stays quiet on 401 while the session handler takes over', async () => {
    vi.mocked(getUsers).mockRejectedValueOnce(new ApiError(401, 'expired'));
    render(<Users />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ignores responses that arrive after the page is closed', async () => {
    let resolve: (value: { users: AdminUser[]; total: number }) => void = () => {};
    let reject: (error: unknown) => void = () => {};
    vi.mocked(getUsers)
      .mockReturnValueOnce(new Promise((resolvePromise) => (resolve = resolvePromise)))
      .mockReturnValueOnce(new Promise((_, rejectPromise) => (reject = rejectPromise)));

    render(<Users />).unmount();
    render(<Users />).unmount();
    resolve({ users: [marina], total: 1 });
    reject(new Error('offline'));
    await new Promise((resolveTick) => setTimeout(resolveTick, 0));

    expect(screen.queryByText('Marina Alves')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the form open without an error message when saving gets 401', async () => {
    vi.mocked(createUser).mockRejectedValue(new ApiError(401, 'expired'));
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Novo usuário' }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Nova Pessoa' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'nova@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));

    await waitFor(() => expect(createUser).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Criar usuário' })).toBeEnabled(),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the confirmation open without an error message when deactivating gets 401', async () => {
    vi.mocked(updateUser).mockRejectedValue(new ApiError(401, 'expired'));
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário: Marina Alves' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Desativar' })).toBeEnabled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('uses the generic message when saving fails without an API answer', async () => {
    vi.mocked(updateUser).mockRejectedValue(new Error('offline'));
    render(<Users />);
    await screen.findByText('Marina Alves');

    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário: Marina Alves' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível desativar o usuário.',
    );
  });
});
