import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Meditation } from '@/types/meditation';
import { MeditationCard } from './MeditationCard';

const meditation: Meditation = {
  id: '1',
  title: 'Respiração para dormir',
  description: 'Doze minutos.',
  durationSeconds: 724,
  audioUrl: 'https://cdn.example.com/dormir.mp3',
  enabled: false,
  createdAt: '2026-07-01T12:00:00Z',
};

function renderCard() {
  const { container } = render(
    <MeditationCard
      meditation={meditation}
      onToggle={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
    />,
  );
  return container.querySelector('audio') as HTMLAudioElement;
}

describe('MeditationCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows hidden meditations as "Oculta"', () => {
    renderCard();

    expect(screen.getByText('Oculta')).toBeInTheDocument();
    expect(screen.getByText('12:04')).toBeInTheDocument();
  });

  it('plays and pauses the audio and follows the player state', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const audio = renderCard();
    const paused = vi.spyOn(audio, 'paused', 'get').mockReturnValue(true);

    fireEvent.click(screen.getByRole('button', { name: `Ouvir ${meditation.title}` }));
    expect(play).toHaveBeenCalledOnce();
    fireEvent.play(audio);

    paused.mockReturnValue(false);
    fireEvent.click(screen.getByRole('button', { name: `Pausar ${meditation.title}` }));
    expect(pause).toHaveBeenCalledOnce();
    fireEvent.pause(audio);
    expect(screen.getByRole('button', { name: `Ouvir ${meditation.title}` })).toBeInTheDocument();

    fireEvent.play(audio);
    fireEvent.ended(audio);
    expect(screen.getByRole('button', { name: `Ouvir ${meditation.title}` })).toBeInTheDocument();
  });
});
