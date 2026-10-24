import { GENDER_OPTIONS } from '@/lib/user';
import type { UserFilters, UserGenderFilter, UserStatusFilter } from '@/types/user';

type UsersFiltersProps = {
  filters: UserFilters;
  onChange: (filters: UserFilters) => void;
  onClear: () => void;
};

export function UsersFilters({ filters, onChange, onClear }: UsersFiltersProps) {
  return (
    <div id="users-filters" className="users-filters" role="group" aria-label="Filtros">
      <label className="users-field">
        <span className="users-field__label">Status</span>
        <select
          className="users-field__control"
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: event.target.value as UserStatusFilter })
          }
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </label>
      <label className="users-field">
        <span className="users-field__label">Gênero</span>
        <select
          className="users-field__control"
          value={filters.gender}
          onChange={(event) =>
            onChange({ ...filters, gender: event.target.value as UserGenderFilter })
          }
        >
          <option value="all">Todos</option>
          {GENDER_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="button button--secondary" onClick={onClear}>
        Limpar filtros
      </button>
    </div>
  );
}
