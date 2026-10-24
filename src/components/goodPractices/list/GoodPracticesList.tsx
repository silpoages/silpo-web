import { useState } from 'react';
import { GoodPracticeCard, type GoodPractice } from '../card/GoodPracticeCard';
import './styles.css';

interface GoodPracticesListProps {
  practices: GoodPractice[];
  onEdit: (practice: GoodPractice) => void;
  onDelete: (practice: GoodPractice) => void;
}

export function GoodPracticesList({ practices, onEdit, onDelete }: GoodPracticesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase('pt-BR');
  const filteredPractices = practices.filter(
    (practice) =>
      practice.title.toLocaleLowerCase('pt-BR').includes(normalizedSearchTerm) &&
      (statusFilter === 'all' || practice.status === statusFilter),
  );

  return (
    <section className="good-practices">
      <div className="good-practices__toolbar">
        <label className="good-practices__search">
          <svg
            className="good-practices__search-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="m16 16 4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar prática..."
            aria-label="Buscar prática pelo nome"
          />
        </label>
        <div className="good-practices__filters" role="group" aria-label="Filtrar práticas">
          <button
            className={`good-practices__filter${statusFilter === 'all' ? ' is-active' : ''}`}
            type="button"
            aria-pressed={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            Todas
          </button>
          <button
            className={`good-practices__filter${statusFilter === 'published' ? ' is-active' : ''}`}
            type="button"
            aria-pressed={statusFilter === 'published'}
            onClick={() => setStatusFilter('published')}
          >
            Publicadas
          </button>
          <button
            className={`good-practices__filter${statusFilter === 'draft' ? ' is-active' : ''}`}
            type="button"
            aria-pressed={statusFilter === 'draft'}
            onClick={() => setStatusFilter('draft')}
          >
            Rascunhos
          </button>
        </div>
      </div>
      <div className="good-practices__grid">
        {filteredPractices.map((practice) => (
          <GoodPracticeCard
            key={practice.id}
            practice={practice}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      {filteredPractices.length === 0 && (
        <p className="good-practices__empty">Nenhuma prática encontrada.</p>
      )}
    </section>
  );
}
