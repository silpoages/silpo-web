import plusIcon from '@/assets/icons/plus.svg';
import type { Meditation } from '@/types/meditation';
import { MeditationCard } from './MeditationCard';
import './MeditationsScreen.css';

type MeditationsScreenProps = {
  meditations: Meditation[];
  isLoading?: boolean;
  error?: string | null;
  onToggle: (id: string, isEnabled: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onRetry?: () => void;
};

export function MeditationsScreen({
  meditations,
  isLoading = false,
  error = null,
  onToggle,
  onEdit,
  onDelete,
  onCreate,
  onRetry,
}: MeditationsScreenProps) {
  function renderContent() {
    if (isLoading) {
      return (
        <p className="meditations__feedback" role="status">
          Carregando meditações…
        </p>
      );
    }

    if (error) {
      return (
        <div className="meditations__feedback" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="meditations__retry" onClick={onRetry}>
              Tentar novamente
            </button>
          )}
        </div>
      );
    }

    if (meditations.length === 0) {
      return <p className="meditations__feedback">Nenhuma meditação cadastrada.</p>;
    }

    return (
      <ul className="meditations__grid">
        {meditations.map((meditation) => (
          <li key={meditation.id}>
            <MeditationCard
              meditation={meditation}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="meditations" aria-labelledby="meditations-heading">
      <header className="meditations__header">
        <div>
          <h1 id="meditations-heading" className="meditations__title">
            Meditações guiadas
          </h1>
          <p className="meditations__subtitle">
            Áudios disponíveis dentro das práticas. Imagem em PNG ou JPEG, até 2 MB.
          </p>
        </div>
        <button type="button" className="meditations__create" onClick={onCreate}>
          <img src={plusIcon} alt="" width={18} height={18} />
          Nova meditação
        </button>
      </header>

      {renderContent()}
    </section>
  );
}
