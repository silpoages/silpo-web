import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { ApiError } from '@/services/api';
import { getCurrentUser, login } from '@/services/auth';
import { getAccessToken, setAccessToken } from '@/services/session';
import type { AuthUser } from '@/types/auth';
import { AuthProvider } from './AuthProvider';

vi.mock('@/services/auth', () => ({ login: vi.fn(), getCurrentUser: vi.fn() }));

const admin: AuthUser = {
  id: '1',
  email: 'admin@silpo.org',
  full_name: 'Henrique Lima',
  role: 'ADMIN',
  onboarding_completed: true,
};

function renderApp(path: string) {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  );
}

function submitLogin({ isPersistent = true } = {}) {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'admin@silpo.org' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-segura' } });
  if (!isPersistent) fireEvent.click(screen.getByLabelText('Manter conectado'));
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('admin authentication', () => {
  afterEach(() => {
    vi.mocked(login).mockReset();
    vi.mocked(getCurrentUser).mockReset();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('redirects to the login when there is no session', () => {
    renderApp('/users');

    expect(screen.getByRole('heading', { name: 'Entrar no painel' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Navegação principal' })).toBeNull();
  });

  it('logs an admin in, persists the session and opens the requested page', async () => {
    vi.mocked(login).mockResolvedValue({
      access_token: 'jwt',
      token_type: 'bearer',
      user: admin,
    });
    renderApp('/users');

    submitLogin();

    expect(await screen.findByRole('heading', { name: 'Usuários' })).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith('admin@silpo.org', 'senha-segura');
    expect(localStorage.getItem('silpo.accessToken')).toBe('jwt');
    expect(screen.getByText('Henrique Lima')).toBeInTheDocument();
  });

  it('keeps the session only in the tab without "Manter conectado"', async () => {
    vi.mocked(login).mockResolvedValue({ access_token: 'jwt', token_type: 'bearer', user: admin });
    renderApp('/');

    submitLogin({ isPersistent: false });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(sessionStorage.getItem('silpo.accessToken')).toBe('jwt');
    expect(localStorage.getItem('silpo.accessToken')).toBeNull();
  });

  it('refuses accounts without the ADMIN role', async () => {
    vi.mocked(login).mockResolvedValue({
      access_token: 'jwt',
      token_type: 'bearer',
      user: { ...admin, role: 'USER' },
    });
    renderApp('/');

    submitLogin();

    expect(
      await screen.findByText('Esta conta não tem acesso ao painel administrativo.'),
    ).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });

  it('shows invalid credentials', async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(401, 'Invalid credentials'));
    renderApp('/');

    submitLogin();

    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeInTheDocument();
  });

  it('restores a saved admin session through /auth/me', async () => {
    setAccessToken('jwt', true);
    vi.mocked(getCurrentUser).mockResolvedValue(admin);
    renderApp('/dashboard');

    expect(screen.getByRole('status')).toHaveTextContent('Verificando sessão');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('drops a saved session whose user is no longer an admin', async () => {
    setAccessToken('jwt', true);
    vi.mocked(getCurrentUser).mockResolvedValue({ ...admin, role: 'USER' });
    renderApp('/dashboard');

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });

  it('drops an expired session', async () => {
    setAccessToken('expired', true);
    vi.mocked(getCurrentUser).mockRejectedValue(new ApiError(401, 'Credentials not validated'));
    renderApp('/dashboard');

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });

  it('logs out and returns to the login', async () => {
    setAccessToken('jwt', true);
    vi.mocked(getCurrentUser).mockResolvedValue(admin);
    renderApp('/dashboard');

    fireEvent.click((await screen.findAllByRole('button', { name: 'Sair' }))[0]);

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });
});
