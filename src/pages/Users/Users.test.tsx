import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Users } from './Users';

function getRow(name: string) {
  const row = screen.getByRole('button', { name: `Ver detalhes de ${name}` }).closest('tr');
  if (!row) throw new Error(`Row for ${name} not found`);
  return row;
}

describe('Users', () => {
  it('filters the list by name or e-mail', () => {
    render(<Users />);

    fireEvent.change(screen.getByLabelText('Buscar por nome ou e-mail'), {
      target: { value: 'helena.p@' },
    });

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('Helena Prado')).toBeInTheDocument();
  });

  it('filters the list by status', () => {
    render(<Users />);

    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'inactive' } });

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => expect(within(row).getByText('Inativa')).toBeInTheDocument());
  });

  it('only deactivates a user after confirmation', () => {
    render(<Users />);

    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário: Marina Alves' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Desativar usuário?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(within(getRow('Marina Alves')).getByText('Ativa')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário: Marina Alves' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(within(getRow('Marina Alves')).getByText('Inativa')).toBeInTheDocument();
  });

  it('shows administrative details and opens edit from them', () => {
    render(<Users />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Marina Alves' }));
    const dialog = screen.getByRole('dialog', { name: 'Marina Alves' });
    expect(within(dialog).getByText('marina.alves@email.com')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Marina A. Alves' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(screen.getByText('Marina A. Alves')).toBeInTheDocument();
  });
});
