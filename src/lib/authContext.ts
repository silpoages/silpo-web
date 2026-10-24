import { createContext } from 'react';
import type { AuthStatus, AuthUser } from '@/types/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string, isPersistent: boolean) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

// Lançado quando a conta existe e a senha confere, mas não tem papel ADMIN.
export class AdminRequiredError extends Error {
  constructor() {
    super('Admin role required');
    this.name = 'AdminRequiredError';
  }
}
