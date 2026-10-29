export type Role = 'ADMIN' | 'PROFESSIONAL' | 'USER';

// Mesmo formato do `user` do POST /auth/login e do GET /auth/me.
export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  onboarding_completed: boolean;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
