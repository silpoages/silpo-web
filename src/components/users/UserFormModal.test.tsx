import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AdminUser } from '@/types/user';
import { UserFormModal } from './UserFormModal';

const user: AdminUser = {
  id: '1',
  name: 'Marina Alves',
  email: 'marina.alves@email.com',
  birthDate: '1997-03-12',
  gender: 'FEMALE',
  isActive: true,
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
    fireEvent.change(screen.getByLabelText('Data de nascimento'), {
      target: { value: '1979-04-02' },
    });
    fireEvent.change(screen.getByLabelText('Gênero'), { target: { value: 'NON_BINARY' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Iris Nogueira',
      email: 'iris.n@email.com',
      birthDate: '1979-04-02',
      gender: 'NON_BINARY',
      isActive: true,
    });
  });

  it('sends a null birth date when it is left empty', () => {
    const onSubmit = vi.fn();
    render(<UserFormModal onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Sem Data' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'sem@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar usuário' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ birthDate: null }));
  });

  it('rejects birth dates outside the allowed age range', () => {
    const onSubmit = vi.fn();
    render(<UserFormModal user={user} onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Data de nascimento'), {
      target: { value: '1850-01-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(screen.getByText('A idade deve ficar entre 13 e 120 anos.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the API error and the saving state', () => {
    render(
      <UserFormModal
        user={user}
        isSaving
        error="Já existe uma conta com este e-mail."
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Já existe uma conta com este e-mail.');
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });

  it('prefills the form when editing', () => {
    const onSubmit = vi.fn();
    render(<UserFormModal user={user} onSubmit={onSubmit} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Editar usuário' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Marina Alves');
    expect(screen.getByLabelText('Data de nascimento')).toHaveValue('1997-03-12');
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
