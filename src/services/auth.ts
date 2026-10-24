import type { AuthUser } from '@/types/auth';
import { apiFetch } from './api';

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser() {
  return apiFetch<AuthUser>('/auth/me');
}
