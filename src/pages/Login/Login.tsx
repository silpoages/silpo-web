import { useState, type FormEvent } from 'react';
import { BrandPanel } from '@/components/login/BrandPanel';
import { LoginButton } from '@/components/login/LoginButton';
import { LoginInput } from '@/components/login/LoginInput';
import { LoginTitle } from '@/components/login/LoginTitle';
import './Login.css';

export function Login() {
  const [feedback, setFeedback] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('Teste.');
  }

  function handleForgotPassword() {
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
            />
            <LoginInput
              id="password"
              label="Senha"
              isPassword
              name="password"
              autoComplete="current-password"
              required
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
            <LoginButton type="submit">Entrar</LoginButton>
            <p className="login-form__feedback" role="status" aria-live="polite">
              {feedback}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
