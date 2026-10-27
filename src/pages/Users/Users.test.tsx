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
});
