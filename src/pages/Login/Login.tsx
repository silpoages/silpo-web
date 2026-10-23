import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandPanel } from '@/components/login/BrandPanel';
import { LoginButton } from '@/components/login/LoginButton';
import { LoginInput } from '@/components/login/LoginInput';
import { LoginTitle } from '@/components/login/LoginTitle';
import { ApiError } from '@/services/api';
import { login } from '@/services/auth';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setFeedback('');
    setHasError(false);

    try {
      await login(String(formData.get('email')), String(formData.get('password')));
      navigate('/good-practices', { replace: true });
    } catch (error: unknown) {
      setHasError(true);
      if (error instanceof ApiError && error.status === 401) {
        setFeedback('E-mail ou senha inválidos.');
      } else if (error instanceof ApiError && error.status === 403) {
        setFeedback('Esta conta não tem permissão para entrar no painel.');
      } else {
        setFeedback('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    setHasError(false);
    setFeedback('A recuperação de senha estará disponível em breve.');
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
              <LoginButton
                type="button"
                variant="text"
                disabled={isSubmitting}
                onClick={handleForgotPassword}
              >
                Esqueci minha senha
              </LoginButton>
            </div>
            <LoginButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </LoginButton>
            <p
              className="login-form__feedback"
              role={hasError ? 'alert' : 'status'}
              aria-live="polite"
            >
              {feedback}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
