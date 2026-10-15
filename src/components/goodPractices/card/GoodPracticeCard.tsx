import './styles.css';

export interface GoodPractice {
  id: string;
  title: string;
  description: string;
  usageCount: number;
  status: 'published' | 'draft';
}

interface GoodPracticeCardProps {
  practice: GoodPractice;
  onEdit: (practice: GoodPractice) => void;
  onDelete: (practice: GoodPractice) => void;
}

export function GoodPracticeCard({ practice, onEdit, onDelete }: GoodPracticeCardProps) {
  return (
    <article className="good-practice-card">
      <div className="good-practice-card__visual">
        <span
          className={`good-practice-card__status good-practice-card__status--${practice.status}`}
        >
          {practice.status === 'published' ? 'Publicada' : 'Rascunho'}
        </span>
        <svg
          className="good-practice-card__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="good-practice-card__content">
        <h2 className="good-practice-card__title">{practice.title}</h2>
        <p className="good-practice-card__description">{practice.description}</p>
        <div className="good-practice-card__footer">
          <span className="good-practice-card__usage">{practice.usageCount} usos</span>
          <div className="good-practice-card__actions">
            <button
              className="good-practice-card__action"
              type="button"
              aria-label={`Editar ${practice.title}`}
              onClick={() => onEdit(practice)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <path
                  d="m14.2 5.2 4.6 4.6M4 20l4.1-.9L19.3 7.9a2.3 2.3 0 0 0-3.2-3.2L4.9 16 4 20Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="good-practice-card__action"
              type="button"
              aria-label={`Excluir ${practice.title}`}
              onClick={() => onDelete(practice)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <path
                  d="M4 7h16M10 11v6m4-6v6M5.5 7l.8 13h11.4l.8-13M9 7V4h6v3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
