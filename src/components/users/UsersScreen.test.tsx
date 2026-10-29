import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_USER_FILTERS, formatAge, getAge } from '@/lib/user';
import type { AdminUser } from '@/types/user';
import { UsersScreen } from './UsersScreen';

const users: AdminUser[] = [
  {
    id: '1',
    name: 'Marina Alves',
    email: 'marina.alves@email.com',
    birthDate: '1997-03-12',
    gender: 'FEMALE',
    isActive: true,
    createdAt: '2026-03-12T12:00:00Z',
  },
  {
    id: '2',
    name: 'Lucas Ferreira',
    email: 'lucas.f@email.com',
    birthDate: null,
    gender: 'MALE',
    isActive: false,
    createdAt: '2026-01-15T12:00:00Z',
  },
];

function renderScreen(props: Partial<Parameters<typeof UsersScreen>[0]> = {}) {
  const handlers = {
    onSearchChange: vi.fn(),
    onFiltersChange: vi.fn(),
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDeactivate: vi.fn(),
    onCreate: vi.fn(),
    onRetry: vi.fn(),
  };

  render(
    <UsersScreen
      users={users}
      search=""
      filters={DEFAULT_USER_FILTERS}
      page={1}
      totalPages={1}
      pageSize={10}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
}

describe('UsersScreen', () => {
  it('renders only administrative columns', () => {
    renderScreen();

    expect(screen.getByRole('heading', { name: 'Usuários' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Usuário',
      'Idade',
      'Gênero',
      'Status',
      'Ações',
    ]);
    expect(screen.getByText('MA')).toBeInTheDocument();
    expect(screen.getByText('marina.alves@email.com')).toBeInTheDocument();
    expect(screen.getByText(formatAge(getAge('1997-03-12')))).toBeInTheDocument();
    expect(screen.getByText('Feminino')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/diário|emoções|contatos|sessões/i)).not.toBeInTheDocument();
  });

  it('notifies search, view, edit, deactivate and create actions', () => {
    const { onSearchChange, onView, onEdit, onDeactivate, onCreate } = renderScreen();

    fireEvent.change(screen.getByLabelText('Buscar por nome ou e-mail'), {
      target: { value: 'marina' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Marina Alves' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar usuário: Marina Alves' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário: Marina Alves' }));
    fireEvent.click(screen.getByRole('button', { name: 'Novo usuário' }));

    expect(onSearchChange).toHaveBeenCalledWith('marina');
    expect(onView).toHaveBeenCalledWith('1');
    expect(onEdit).toHaveBeenCalledWith('1');
    expect(onDeactivate).toHaveBeenCalledWith('1');
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('disables deactivation for inactive users', () => {
    renderScreen();

    expect(
      screen.getByRole('button', { name: 'Desativar usuário: Lucas Ferreira' }),
    ).toBeDisabled();
  });

  it('opens the filters panel and notifies filter changes', () => {
    const { onFiltersChange } = renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'inactive' } });

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'inactive', gender: 'all' });
  });

  it('shows how many filters are active', () => {
    renderScreen({ filters: { status: 'active', gender: 'MALE' } });

    expect(screen.getByRole('button', { name: 'Filtros, 2 ativos' })).toBeInTheDocument();
  });

  it('shows the loading state', () => {
    renderScreen({ isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando usuários');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the error state with retry', () => {
    const { onRetry } = renderScreen({ error: 'Não foi possível carregar os usuários.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os usuários.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the empty state when there are no users', () => {
    renderScreen({ users: [] });

    expect(screen.getByText('Nenhum usuário cadastrado.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the no results state when the filters match nothing', () => {
    renderScreen({ users: [], filters: { status: 'inactive', gender: 'all' } });

    expect(
      screen.getByText('Nenhum usuário corresponde aos filtros selecionados.'),
    ).toBeInTheDocument();
  });

  it('shows the no results state when the search matches nothing', () => {
    renderScreen({ users: [], search: 'xyz' });

    expect(screen.getByText('Nenhum usuário encontrado para "xyz".')).toBeInTheDocument();
  });
});
