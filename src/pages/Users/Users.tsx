import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { UserFormModal } from '@/components/users/UserFormModal';
import { UsersScreen } from '@/components/users/UsersScreen';
import { DEFAULT_USER_FILTERS } from '@/lib/user';
import type { AdminUser, UserFilters, UserFormValues } from '@/types/user';
import { USERS_MOCK } from './usersMock';

type FormState = { mode: 'create' } | { mode: 'edit'; userId: string } | null;

function matchesSearch(user: AdminUser, normalizedSearch: string) {
  return (
    user.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
    user.email.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
  );
}

function matchesFilters(user: AdminUser, filters: UserFilters) {
  if (filters.status === 'active' && !user.isActive) return false;
  if (filters.status === 'inactive' && user.isActive) return false;
  if (filters.gender !== 'all' && user.gender !== filters.gender) return false;
  return true;
}

export function Users() {
  const [users, setUsers] = useState(USERS_MOCK);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formState, setFormState] = useState<FormState>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);

  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filteredUsers = users.filter(
    (user) => matchesSearch(user, normalizedSearch) && matchesFilters(user, filters),
  );
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const findUser = (id: string | null) => users.find((user) => user.id === id);
  const detailUser = findUser(detailUserId);
  const editingUser = formState?.mode === 'edit' ? findUser(formState.userId) : undefined;
  const deactivatingUser = findUser(deactivatingUserId);

  function handleSearchChange(nextSearch: string) {
    setSearch(nextSearch);
    setPage(1);
  }

  function handleFiltersChange(nextFilters: UserFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  function handleEdit(id: string) {
    setDetailUserId(null);
    setFormState({ mode: 'edit', userId: id });
  }

  function handleFormSubmit(values: UserFormValues) {
    if (formState?.mode === 'edit') {
      const { userId } = formState;
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === userId ? { ...user, ...values } : user)),
      );
    } else {
      const newUser: AdminUser = {
        ...values,
        id: crypto.randomUUID(),
        lastAccess: null,
        createdAt: new Date().toISOString(),
      };
      setUsers((currentUsers) => [newUser, ...currentUsers]);
    }
    setFormState(null);
  }

  function handleConfirmDeactivate() {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === deactivatingUserId ? { ...user, isActive: false } : user,
      ),
    );
    setDeactivatingUserId(null);
  }

  return (
    <>
      <UsersScreen
        users={pageUsers}
        totalUsers={users.length}
        search={search}
        filters={filters}
        page={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onSearchChange={handleSearchChange}
        onFiltersChange={handleFiltersChange}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onView={setDetailUserId}
        onEdit={handleEdit}
        onDeactivate={setDeactivatingUserId}
        onCreate={() => setFormState({ mode: 'create' })}
      />

      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onEdit={handleEdit}
          onClose={() => setDetailUserId(null)}
        />
      )}

      {formState && (
        <UserFormModal
          key={editingUser?.id ?? 'new'}
          user={editingUser}
          onSubmit={handleFormSubmit}
          onClose={() => setFormState(null)}
        />
      )}

      {deactivatingUser && (
        <ConfirmDialog
          title="Desativar usuário?"
          message={`${deactivatingUser.name} perderá o acesso ao aplicativo até ser reativado. Os dados da conta são mantidos.`}
          confirmLabel="Desativar"
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setDeactivatingUserId(null)}
        />
      )}
    </>
  );
}
