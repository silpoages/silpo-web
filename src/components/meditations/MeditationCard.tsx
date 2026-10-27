import { useRef, useState } from 'react';
import editIcon from '@/assets/icons/edit.svg';
import headphonesIcon from '@/assets/icons/headphones.svg';
import pauseIcon from '@/assets/icons/pause.svg';
import playIcon from '@/assets/icons/play.svg';
import trashIcon from '@/assets/icons/trash.svg';
import { Toggle } from '@/components/ui/Toggle';
import { formatDuration } from '@/lib/duration';
import type { Meditation } from '@/types/meditation';

// Alturas (px) das barras decorativas da forma de onda, conforme o Figma.
const WAVEFORM_BARS = [
  6.4, 15.7, 25, 8.6, 17.9, 27.2, 10.9, 20.2, 29.4, 13.1, 22.4, 31.7, 15.4, 24.6, 8.3, 17.6, 26.9,
  10.6, 19.8, 29.1, 12.8, 22.1, 31.4, 15, 24.3, 8, 17.3, 26.6, 10.2, 19.5, 28.8, 12.5, 21.8, 31,
  14.7, 24, 7.7, 17, 26.2, 9.9,
];

type MeditationCardProps = {
  meditation: Meditation;
  onToggle: (id: string, isEnabled: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function MeditationCard({ meditation, onToggle, onEdit, onDelete }: MeditationCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const statusModifier = meditation.enabled ? 'available' : 'hidden';

  function handlePlayToggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  return (
    <article className="meditation-card">
      <div className={`meditation-card__cover meditation-card__cover--${statusModifier}`}>
        <span className="meditation-card__status">
          <span className="meditation-card__status-dot" aria-hidden="true" />
          {meditation.enabled ? 'Disponível' : 'Oculta'}
        </span>
        <img src={headphonesIcon} alt="" width={32} height={32} />
      </div>

      <div className="meditation-card__content">
        <h2 className="meditation-card__title">{meditation.title}</h2>
        <p className="meditation-card__description">{meditation.description}</p>

        <div className="meditation-card__player">
          <button
            type="button"
            className="meditation-card__play"
            aria-label={`${isPlaying ? 'Pausar' : 'Ouvir'} ${meditation.title}`}
            disabled={!meditation.audioUrl}
            onClick={handlePlayToggle}
          >
            <img src={isPlaying ? pauseIcon : playIcon} alt="" width={15} height={15} />
          </button>
          <span className="meditation-card__waveform" aria-hidden="true">
            {WAVEFORM_BARS.map((height, index) => (
              <span key={index} style={{ height }} />
            ))}
          </span>
          <span className="meditation-card__duration">
            {formatDuration(meditation.durationSeconds)}
          </span>
          {meditation.audioUrl && (
            <audio
              ref={audioRef}
              src={meditation.audioUrl}
              preload="none"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>

        <div className="meditation-card__footer">
          <span className="meditation-card__visibility">
            <Toggle
              size="small"
              isChecked={meditation.enabled}
              label={`${meditation.title} no aplicativo`}
              onChange={(isChecked) => onToggle(meditation.id, isChecked)}
            />
            No aplicativo
          </span>
          <span className="meditation-card__actions">
            <button
              type="button"
              className="meditation-card__action"
              aria-label={`Editar meditação: ${meditation.title}`}
              onClick={() => onEdit(meditation.id)}
            >
              <img src={editIcon} alt="" width={16} height={16} />
            </button>
            <button
              type="button"
              className="meditation-card__action"
              aria-label={`Excluir meditação: ${meditation.title}`}
              onClick={() => onDelete(meditation.id)}
            >
              <img src={trashIcon} alt="" width={16} height={16} />
            </button>
          </span>
        </div>
      </div>
    </article>
  );
}
