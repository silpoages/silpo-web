import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BrandPanel } from '@/components/brand/BrandPanel';
import { LoginButton } from '@/components/login/LoginButton';
import { LoginInput } from '@/components/login/LoginInput';
import { LoginTitle } from '@/components/login/LoginTitle';
import { useAuth } from '@/hooks/useAuth';
import { AdminRequiredError } from '@/lib/authContext';
import { ApiError } from '@/services/api';
import './Login.css';

function getLoginErrorMessage(error: unknown) {
  if (error instanceof AdminRequiredError) {
    return 'Esta conta não tem acesso ao painel administrativo.';
  }
  if (error instanceof ApiError && error.status === 401) {
    return 'E-mail ou senha inválidos.';
  }
  if (error instanceof ApiError && error.status === 403) {
    return 'Confirme seu e-mail antes de entrar.';
  }
  if (error instanceof ApiError && error.status === 422) {
    return 'Informe um e-mail e uma senha válidos.';
  }
  return 'Não foi possível entrar. Tente novamente.';
}

export function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFeedback('');
    setIsSubmitting(true);

    try {
      await login(
        String(formData.get('email') ?? '').trim(),
        String(formData.get('password') ?? ''),
        formData.get('remember') === 'on',
      );
    } catch (error: unknown) {
      setFeedback(getLoginErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />;
  }

  function handleForgotPassword() {
    navigate('/forgot-password');
  }

  return (
    <main className="login-page">
      <BrandPanel />
      <section className="login-content" aria-labelledby="login-heading">
        <div className="login-content__inner">
          <LoginTitle />
          <form className="login-form" onSubmit={handleSubmit}>
            <LoginInput
              id="email"
              label="E-mail"
              type="email"
              name="email"
              autoComplete="username"
              defaultValue=""
              required
              disabled={isSubmitting}
            />
            <LoginInput
              id="password"
              label="Senha"
              isPassword
              name="password"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
            />
            <div className="login-form__options">
              <label className="remember-me">
                <input type="checkbox" name="remember" defaultChecked />
                <span>Manter conectado</span>
              </label>
              <LoginButton type="button" variant="text" onClick={handleForgotPassword}>
                Esqueci minha senha
              </LoginButton>
            </div>
            <LoginButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </LoginButton>
            <p className="login-form__feedback" role="alert" aria-live="polite">
              {feedback}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
