import type { AdminUser, Gender, UserFilters, UserFormValues } from '@/types/user';
import { apiFetch } from './api';

type AdminUserResponse = {
  id: string;
  full_name: string | null;
  email: string;
  birth_date: string | null;
  gender: Gender;
  role: string;
  enabled: boolean;
  onboarding_completed: boolean;
  created_at: string;
};

type AdminUserListResponse = {
  items: AdminUserResponse[];
  total: number;
  page: number;
  page_size: number;
};

export type UserListParams = {
  page: number;
  pageSize: number;
  search: string;
  filters: UserFilters;
};

function toAdminUser(response: AdminUserResponse): AdminUser {
  return {
    id: response.id,
    name: response.full_name,
    email: response.email,
    birthDate: response.birth_date,
    gender: response.gender,
    isActive: response.enabled,
    createdAt: response.created_at,
  };
}

function toRequestBody(values: Partial<UserFormValues>) {
  return {
    ...(values.name !== undefined && { full_name: values.name }),
    ...(values.email !== undefined && { email: values.email }),
    ...(values.birthDate !== undefined && { birth_date: values.birthDate }),
    ...(values.gender !== undefined && { gender: values.gender }),
    ...(values.isActive !== undefined && { enabled: values.isActive }),
  };
}

// A tela gerencia só as contas do aplicativo; admins e profissionais ficam de fora.
export async function getUsers({ page, pageSize, search, filters }: UserListParams) {
  const query = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    role: 'USER',
  });
  if (search.trim()) query.set('search', search.trim());
  if (filters.status !== 'all') query.set('enabled', String(filters.status === 'active'));
  if (filters.gender !== 'all') query.set('gender', filters.gender);

  const response = await apiFetch<AdminUserListResponse>(`/admin/users?${query.toString()}`);
  return { users: response.items.map(toAdminUser), total: response.total };
}

export async function createUser(values: UserFormValues) {
  const response = await apiFetch<AdminUserResponse>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(toRequestBody(values)),
  });
  return toAdminUser(response);
}

export async function updateUser(id: string, values: Partial<UserFormValues>) {
  const response = await apiFetch<AdminUserResponse>(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(toRequestBody(values)),
  });
  return toAdminUser(response);
}
