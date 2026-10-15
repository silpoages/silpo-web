import { useState, type FormEvent } from 'react';
import { BrandPanel } from '@/components/brand/BrandPanel';
import { ForgotPasswordButton } from '@/components/forgot-password/ForgotPasswordButton';
import { ForgotPasswordInput } from '@/components/forgot-password/ForgotPasswordInput';
import { ForgotPasswordTitle } from '@/components/forgot-password/ForgotPasswordTitle';
import './ForgotPassword.css';

export function ForgotPassword() {
  const [feedback, setFeedback] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('Teste.');
  }

  return (
    <main className="forgot-password-page">
      <BrandPanel />
      <section className="forgot-password-content" aria-labelledby="forgot-password-heading">
        <div className="forgot-password-content__inner">
          <ForgotPasswordTitle />
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <ForgotPasswordInput
              id="email"
              label="E-mail"
              type="email"
              name="email"
              autoComplete="username"
              defaultValue=""
              required
            />
            <ForgotPasswordButton type="submit">Enviar</ForgotPasswordButton>
            <p className="forgot-password-form__feedback" role="status" aria-live="polite">
              {feedback}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
