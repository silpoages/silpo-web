import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AdminUser } from '@/types/user';
import { UserFormModal } from './UserFormModal';

const user: AdminUser = {
  id: '1',
  name: 'Marina Alves',
  email: 'marina.alves@email.com',
  age: 29,
  gender: 'FEMALE',
  isActive: true,
  lastAccess: null,
  createdAt: '2026-03-12T12:00:00Z',
};

describe('UserFormModal', () => {
  it('validates required fields before creating', () => {
    const onSubmit = vi.fn();
    render(<UserFormModal onSubmit={onSubmit} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Novo usuário' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));

    expect(screen.getByText('Informe o nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('creates a user with the filled values', () => {
    const onSubmit = vi.fn();
    render(<UserFormModal onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: ' Iris Nogueira ' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'iris.n@email.com' } });
    fireEvent.change(screen.getByLabelText('Idade'), { target: { value: '47' } });
    fireEvent.change(screen.getByLabelText('Gênero'), { target: { value: 'NON_BINARY' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Iris Nogueira',
      email: 'iris.n@email.com',
      age: 47,
      gender: 'NON_BINARY',
      isActive: true,
    });
  });

  it('prefills the form when editing', () => {
    const onSubmit = vi.fn();
    render(<UserFormModal user={user} onSubmit={onSubmit} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Editar usuário' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Marina Alves');
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'inactive' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
  });

  it('closes on cancel and escape', () => {
    const onClose = vi.fn();
    render(<UserFormModal onSubmit={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
