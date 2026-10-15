import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandPanel } from '@/components/brand/BrandPanel';
import { ForgotPasswordButton } from '@/components/forgot-password/ForgotPasswordButton';
import { ForgotPasswordInput } from '@/components/forgot-password/ForgotPasswordInput';
import { ForgotPasswordTitle } from '@/components/forgot-password/ForgotPasswordTitle';
import './ForgotPassword.css';

export function ForgotPassword() {
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('Teste.');
  }

  function handleGoBack() {
    navigate('/');
  }

  return (
    <main className="forgot-password-page">
      <BrandPanel />
      <section className="forgot-password-content" aria-labelledby="forgot-password-heading">
        <div className="forgot-password-content__inner">
          <ForgotPasswordButton type="button" variant="text" onClick={handleGoBack}>
            <svg className="forgot-password-button__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Voltar ao login
          </ForgotPasswordButton>
          <ForgotPasswordTitle />
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <ForgotPasswordInput
              id="email"
              label="E-MAIL"
              type="email"
              name="email"
              autoComplete="username"
              defaultValue=""
              required
            />
            <ForgotPasswordButton type="submit">Enviar link de redefinição</ForgotPasswordButton>
            <p className="forgot-password-form__feedback" role="status" aria-live="polite">
              {feedback}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
