import { useState } from 'react';
import filterIcon from '@/assets/icons/filter.svg';
import plusIcon from '@/assets/icons/plus.svg';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { DEFAULT_USER_FILTERS } from '@/lib/user';
import type { AdminUser, UserFilters } from '@/types/user';
import { UsersFilters } from './UsersFilters';
import { UsersTable } from './UsersTable';
import './UsersScreen.css';

type UsersScreenProps = {
  users: AdminUser[];
  totalUsers: number;
  search: string;
  filters: UserFilters;
  page: number;
  totalPages: number;
  pageSize: number;
  isLoading?: boolean;
  error?: string | null;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: UserFilters) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDeactivate: (id: string) => void;
  onCreate: () => void;
  onRetry?: () => void;
};

function countActiveFilters(filters: UserFilters) {
  return Object.values(filters).filter((value) => value !== 'all').length;
}

function getEmptyMessage(search: string, totalUsers: number) {
  if (search.trim()) {
    return `Nenhum usuário encontrado para "${search.trim()}".`;
  }
  if (totalUsers === 0) {
    return 'Nenhum usuário cadastrado.';
  }
  return 'Nenhum usuário corresponde aos filtros selecionados.';
}

export function UsersScreen({
  users,
  totalUsers,
  search,
  filters,
  page,
  totalPages,
  pageSize,
  isLoading = false,
  error = null,
  onSearchChange,
  onFiltersChange,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDeactivate,
  onCreate,
  onRetry,
}: UsersScreenProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const activeFiltersCount = countActiveFilters(filters);

  function renderContent() {
    if (isLoading) {
      return (
        <p className="users__feedback" role="status">
          Carregando usuários…
        </p>
      );
    }

    if (error) {
      return (
        <div className="users__feedback" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="button button--primary" onClick={onRetry}>
              Tentar novamente
            </button>
          )}
        </div>
      );
    }

    if (users.length === 0) {
      return <p className="users__feedback">{getEmptyMessage(search, totalUsers)}</p>;
    }

    return (
      <>
        <div className="users__table-wrapper">
          <UsersTable users={users} onView={onView} onEdit={onEdit} onDeactivate={onDeactivate} />
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </>
    );
  }

  return (
    <section className="users" aria-labelledby="users-heading">
      <header className="users__header">
        <div>
          <h1 id="users-heading" className="users__title">
            Usuários
          </h1>
          <p className="users__subtitle">Cadastro, edição e remoção de contas do aplicativo.</p>
        </div>
        <button type="button" className="button button--primary users__create" onClick={onCreate}>
          <img src={plusIcon} alt="" width={18} height={18} />
          Novo usuário
        </button>
      </header>

      <div className="users__toolbar">
        <SearchInput
          id="users-search"
          label="Buscar por nome ou e-mail"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={onSearchChange}
        />
        <button
          type="button"
          className="users__filters-toggle"
          aria-expanded={isFiltersOpen}
          aria-controls="users-filters"
          aria-label={activeFiltersCount > 0 ? `Filtros, ${activeFiltersCount} ativos` : undefined}
          onClick={() => setIsFiltersOpen((isOpen) => !isOpen)}
        >
          <img src={filterIcon} alt="" width={18} height={18} />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="users__filters-count">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {isFiltersOpen && (
        <UsersFilters
          filters={filters}
          onChange={onFiltersChange}
          onClear={() => onFiltersChange(DEFAULT_USER_FILTERS)}
        />
      )}

      <div className="users__card">{renderContent()}</div>
    </section>
  );
}
