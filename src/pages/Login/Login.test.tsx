import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminRequiredError, AuthContext, type AuthContextValue } from '@/lib/authContext';
import { ApiError } from '@/services/api';
import { Login } from './Login';

function renderLogin(overrides: Partial<AuthContextValue> = {}, initialEntry: unknown = '/') {
  const value: AuthContextValue = {
    user: null,
    status: 'unauthenticated',
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  };
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[initialEntry as string]}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<p>Dashboard</p>} />
          <Route path="/users" element={<p>Usuários</p>} />
          <Route path="/forgot-password" element={<p>Esqueci a senha</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return value;
}

function submit(email = ' admin@silpo.org ', password = 'senha-segura') {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('Login', () => {
  it('sends the trimmed e-mail and disables the form while signing in', async () => {
    const { login } = renderLogin({ login: vi.fn(() => new Promise<void>(() => {})) });

    submit();

    expect(login).toHaveBeenCalledWith('admin@silpo.org', 'senha-segura', true);
    expect(await screen.findByRole('button', { name: 'Entrando…' })).toBeDisabled();
    expect(screen.getByLabelText('E-mail')).toBeDisabled();
  });

  it.each([
    [new AdminRequiredError(), 'Esta conta não tem acesso ao painel administrativo.'],
    [new ApiError(401, 'Invalid'), 'E-mail ou senha inválidos.'],
    [new ApiError(403, 'Email not confirmed'), 'Confirme seu e-mail antes de entrar.'],
    [new ApiError(422, 'Unprocessable'), 'Informe um e-mail e uma senha válidos.'],
    [new ApiError(500, 'Erro'), 'Não foi possível entrar. Tente novamente.'],
    [new TypeError('Failed to fetch'), 'Não foi possível entrar. Tente novamente.'],
  ])('explains the failure %s', async (error, message) => {
    renderLogin({ login: vi.fn().mockRejectedValue(error) });

    submit();

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });

  it('opens the forgot password page', () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Esqueci minha senha' }));

    expect(screen.getByText('Esqueci a senha')).toBeInTheDocument();
  });

  it('sends a signed-in admin to the page they asked for, or to the dashboard', () => {
    renderLogin({ status: 'authenticated' }, { pathname: '/', state: { from: '/users' } });
    expect(screen.getByText('Usuários')).toBeInTheDocument();
  });

  it('sends a signed-in admin to the dashboard by default', () => {
    renderLogin({ status: 'authenticated' });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
