import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DailyMessage } from '@/types/dailyMessage';
import { DailyMessageFormModal } from './DailyMessageFormModal';

const dailyMessage: DailyMessage = {
  id: '1',
  message: 'Você não precisa dar conta de tudo hoje. Só do próximo passo.',
  enabled: true,
  lastShown: '2026-08-19T12:00:00Z',
  createdAt: '2026-07-01T12:00:00Z',
};

describe('DailyMessageFormModal', () => {
  it('validates the message before creating', () => {
    const onSubmit = vi.fn();
    render(<DailyMessageFormModal onSubmit={onSubmit} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Nova mensagem' })).toBeInTheDocument();
    expect(screen.getByText('0/140 caracteres')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar mensagem' }));

    expect(screen.getByText('Informe o texto da mensagem.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('creates a message with the filled values', () => {
    const onSubmit = vi.fn();
    render(<DailyMessageFormModal onSubmit={onSubmit} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Mensagem'), {
      target: { value: ' Respire fundo. ' },
    });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'disabled' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar mensagem' }));

    expect(onSubmit).toHaveBeenCalledWith({ message: 'Respire fundo.', enabled: false });
  });

  it('prefills the form when editing', () => {
    const onSubmit = vi.fn();
    render(
      <DailyMessageFormModal dailyMessage={dailyMessage} onSubmit={onSubmit} onClose={vi.fn()} />,
    );

    expect(screen.getByRole('dialog', { name: 'Editar mensagem' })).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toHaveValue(dailyMessage.message);
    expect(screen.getByText('61/140 caracteres')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSubmit).toHaveBeenCalledWith({ message: dailyMessage.message, enabled: true });
  });

  it('closes on cancel', () => {
    const onClose = vi.fn();
    render(<DailyMessageFormModal onSubmit={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
