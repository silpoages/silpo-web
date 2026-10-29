import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { UserFormModal } from '@/components/users/UserFormModal';
import { UsersScreen } from '@/components/users/UsersScreen';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DEFAULT_USER_FILTERS, getDisplayName } from '@/lib/user';
import { ApiError } from '@/services/api';
import { createUser, getUsers, updateUser } from '@/services/users';
import type { AdminUser, UserFilters, UserFormValues } from '@/types/user';

const SEARCH_DEBOUNCE_MS = 300;

type FormState = { mode: 'create' } | { mode: 'edit'; userId: string } | null;

type LoadResult = { key: string; users: AdminUser[]; total: number; error: string | null };

export function Users() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadResult, setLoadResult] = useState<LoadResult | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  // Identifica a consulta atual; enquanto a resposta dela não chega, a tela fica carregando.
  const requestKey = [page, pageSize, debouncedSearch, filters.status, filters.gender, reloadKey]
    .map(String)
    .join('|');

  useEffect(() => {
    let isCurrent = true;

    getUsers({ page, pageSize, search: debouncedSearch, filters })
      .then((result) => {
        if (!isCurrent) return;
        // Se a última página ficou vazia (ex.: após desativar com filtro), volta uma.
        if (result.users.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setLoadResult({ key: requestKey, ...result, error: null });
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        // 401: o AuthProvider já encerra a sessão e volta para o login.
        if (isUnauthorized(error)) return;
        setLoadResult({
          key: requestKey,
          users: [],
          total: 0,
          error: getErrorMessage(error, 'Não foi possível carregar os usuários.'),
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [requestKey, page, pageSize, debouncedSearch, filters]);

  const isLoading = loadResult?.key !== requestKey;
  const users = loadResult?.users ?? [];
  const total = loadResult?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const findUser = (id: string | null) => users.find((user) => user.id === id);
  const detailUser = findUser(detailUserId);
  const editingUser = formState?.mode === 'edit' ? findUser(formState.userId) : undefined;
  const deactivatingUser = findUser(deactivatingUserId);

  function reload() {
    setReloadKey((key) => key + 1);
  }

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

  function openForm(nextFormState: FormState) {
    setMutationError(null);
    setDetailUserId(null);
    setFormState(nextFormState);
  }

  function openDeactivate(id: string) {
    setMutationError(null);
    setDeactivatingUserId(id);
  }

  async function handleFormSubmit(values: UserFormValues) {
    setIsSaving(true);
    setMutationError(null);
    try {
      if (formState?.mode === 'edit') {
        await updateUser(formState.userId, values);
      } else {
        await createUser(values);
      }
      setFormState(null);
      reload();
    } catch (error) {
      if (isUnauthorized(error)) return;
      setMutationError(getErrorMessage(error, 'Não foi possível salvar o usuário.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (!deactivatingUserId) return;
    setIsSaving(true);
    setMutationError(null);
    try {
      await updateUser(deactivatingUserId, { isActive: false });
      setDeactivatingUserId(null);
      reload();
    } catch (error) {
      if (isUnauthorized(error)) return;
      setMutationError(getErrorMessage(error, 'Não foi possível desativar o usuário.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <UsersScreen
        users={users}
        search={search}
        filters={filters}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        isLoading={isLoading}
        error={isLoading ? null : loadResult.error}
        onSearchChange={handleSearchChange}
        onFiltersChange={handleFiltersChange}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onView={setDetailUserId}
        onEdit={(id) => openForm({ mode: 'edit', userId: id })}
        onDeactivate={openDeactivate}
        onCreate={() => openForm({ mode: 'create' })}
        onRetry={reload}
      />

      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onEdit={(id) => openForm({ mode: 'edit', userId: id })}
          onClose={() => setDetailUserId(null)}
        />
      )}

      {formState && (
        <UserFormModal
          key={editingUser?.id ?? 'new'}
          user={editingUser}
          isSaving={isSaving}
          error={mutationError}
          onSubmit={handleFormSubmit}
          onClose={() => setFormState(null)}
        />
      )}

      {deactivatingUser && (
        <ConfirmDialog
          title="Desativar usuário?"
          message={`${getDisplayName(deactivatingUser)} perderá o acesso ao aplicativo até ser reativado. Os dados da conta são mantidos.`}
          confirmLabel="Desativar"
          isConfirming={isSaving}
          error={mutationError}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setDeactivatingUserId(null)}
        />
      )}
    </>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Você não tem permissão para gerenciar usuários.';
  }
  if (error instanceof ApiError && error.status === 409) {
    return 'Já existe uma conta com este e-mail.';
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
