import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Meditation } from '@/types/meditation';
import { MeditationsScreen } from './MeditationsScreen';

const meditations: Meditation[] = [
  {
    id: '1',
    title: 'Respiração para dormir',
    description: 'Doze minutos de respiração lenta.',
    durationSeconds: 724,
    audioUrl: null,
    enabled: true,
    createdAt: '2026-07-01T12:00:00Z',
  },
  {
    id: '2',
    title: 'Manhã sem pressa',
    description: 'Para ouvir ainda na cama.',
    durationSeconds: 405,
    audioUrl: null,
    enabled: false,
    createdAt: '2026-07-04T12:00:00Z',
  },
];

function renderScreen(props: Partial<Parameters<typeof MeditationsScreen>[0]> = {}) {
  const handlers = {
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onCreate: vi.fn(),
    onRetry: vi.fn(),
  };

  render(<MeditationsScreen meditations={meditations} {...handlers} {...props} />);

  return handlers;
}

describe('MeditationsScreen', () => {
  it('renders a card per meditation with status and duration', () => {
    renderScreen();

    expect(screen.getByRole('heading', { name: 'Meditações guiadas' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('Disponível')).toBeInTheDocument();
    expect(screen.getByText('Oculta')).toBeInTheDocument();
    expect(screen.getByText('12:04')).toBeInTheDocument();
    expect(screen.getByText('06:45')).toBeInTheDocument();
  });

  it('notifies toggle, edit, delete and create actions', () => {
    const { onToggle, onEdit, onDelete, onCreate } = renderScreen();

    fireEvent.click(screen.getByRole('switch', { name: 'Manhã sem pressa no aplicativo' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Editar meditação: Respiração para dormir' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Excluir meditação: Manhã sem pressa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nova meditação' }));

    expect(onToggle).toHaveBeenCalledWith('2', true);
    expect(onEdit).toHaveBeenCalledWith('1');
    expect(onDelete).toHaveBeenCalledWith('2');
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('disables playback when the meditation has no audio', () => {
    renderScreen();

    expect(screen.getByRole('button', { name: 'Ouvir Respiração para dormir' })).toBeDisabled();
  });

  it('shows the loading, error and empty states', () => {
    const { unmount } = render(
      <MeditationsScreen
        meditations={[]}
        isLoading
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCreate={vi.fn()}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Carregando meditações');
    unmount();

    const { onRetry } = renderScreen({ error: 'Não foi possível carregar as meditações.' });
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the empty state when there are no meditations', () => {
    renderScreen({ meditations: [] });

    expect(screen.getByText('Nenhuma meditação cadastrada.')).toBeInTheDocument();
  });
});
