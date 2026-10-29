import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AdminRequiredError, AuthContext } from '@/lib/authContext';
import { ApiError, setUnauthorizedHandler } from '@/services/api';
import { getCurrentUser, login as requestLogin } from '@/services/auth';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/services/session';
import type { AuthStatus, AuthUser } from '@/types/auth';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getAccessToken() ? 'loading' : 'unauthenticated',
  );

  const endSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(endSession);
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  // Revalida a sessão salva (ex.: "Manter conectado") antes de liberar o painel.
  useEffect(() => {
    if (!getAccessToken()) return;
    let isCurrent = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!isCurrent) return;
        if (currentUser.role !== 'ADMIN') {
          endSession();
          return;
        }
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        // Sem resposta da API o token pode ainda ser válido; só descartamos se a API recusar.
        if (error instanceof ApiError) {
          endSession();
          return;
        }
        setStatus('unauthenticated');
      });

    return () => {
      isCurrent = false;
    };
  }, [endSession]);

  const login = useCallback(async (email: string, password: string, isPersistent: boolean) => {
    clearAccessToken();
    const response = await requestLogin(email, password);
    if (response.user.role !== 'ADMIN') {
      throw new AdminRequiredError();
    }
    setAccessToken(response.access_token, isPersistent);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout: endSession }),
    [user, status, login, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
