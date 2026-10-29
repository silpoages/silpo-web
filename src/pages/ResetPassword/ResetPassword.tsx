import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BrandPanel } from '@/components/brand/BrandPanel';
import { ForgotPasswordButton } from '@/components/forgot-password/ForgotPasswordButton';
import { ForgotPasswordInput } from '@/components/forgot-password/ForgotPasswordInput';
import { ApiError } from '@/services/api';
import { resetPassword, verifyResetCode } from '@/services/forgotPassword';
import '../ForgotPassword/ForgotPassword.css';

const MIN_PASSWORD_LENGTH = 8;

type CodeStatus = 'checking' | 'valid' | 'invalid' | 'error' | 'done';

function validatePassword(password: string, confirmation: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (password !== confirmation) {
    return 'As senhas não coincidem.';
  }
  return null;
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? '';
  const navigate = useNavigate();
  const [codeStatus, setCodeStatus] = useState<CodeStatus>(code ? 'checking' : 'invalid');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!code) return;
    let isCurrent = true;

    verifyResetCode(code)
      .then(() => {
        if (isCurrent) setCodeStatus('valid');
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setCodeStatus(error instanceof ApiError && error.status === 400 ? 'invalid' : 'error');
      });

    return () => {
      isCurrent = false;
    };
  }, [code, reloadKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    const validationError = validatePassword(
      password,
      String(formData.get('passwordConfirmation') ?? ''),
    );
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    setFeedback('');
    setIsSubmitting(true);
    try {
      await resetPassword(code, password);
      setCodeStatus('done');
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 400) {
        setCodeStatus('invalid');
      } else {
        setFeedback('Não foi possível redefinir a senha. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderContent() {
    if (codeStatus === 'checking') {
      return (
        <p className="forgot-password-form__feedback" role="status">
          Verificando link…
        </p>
      );
    }

    if (codeStatus === 'invalid') {
      return (
        <div className="forgot-password-form" role="alert">
          <p className="forgot-password-form__feedback">
            Este link é inválido, expirou ou já foi utilizado.
          </p>
          <Link
            to="/forgot-password"
            className="forgot-password-button forgot-password-button--primary"
          >
            Solicitar novo link
          </Link>
        </div>
      );
    }

    if (codeStatus === 'error') {
      return (
        <div className="forgot-password-form" role="alert">
          <p className="forgot-password-form__feedback">Não foi possível verificar o link.</p>
          <ForgotPasswordButton
            type="button"
            onClick={() => {
              setCodeStatus('checking');
              setReloadKey((current) => current + 1);
            }}
          >
            Tentar novamente
          </ForgotPasswordButton>
        </div>
      );
    }

    if (codeStatus === 'done') {
      return (
        <div className="forgot-password-form" role="status">
          <p className="forgot-password-form__feedback">
            Senha redefinida com sucesso. Você já pode entrar com a nova senha.
          </p>
          <ForgotPasswordButton type="button" onClick={() => navigate('/')}>
            Ir para o login
          </ForgotPasswordButton>
        </div>
      );
    }

    return (
      <form className="forgot-password-form" noValidate onSubmit={handleSubmit}>
        <ForgotPasswordInput
          id="password"
          label="NOVA SENHA"
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
          disabled={isSubmitting}
        />
        <ForgotPasswordInput
          id="password-confirmation"
          label="CONFIRMAR NOVA SENHA"
          type="password"
          name="passwordConfirmation"
          autoComplete="new-password"
          required
          disabled={isSubmitting}
        />
        <ForgotPasswordButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
        </ForgotPasswordButton>
        <p className="forgot-password-form__feedback" role="alert" aria-live="polite">
          {feedback}
        </p>
      </form>
    );
  }

  return (
    <main className="forgot-password-page">
      <BrandPanel />
      <section className="forgot-password-content" aria-labelledby="reset-password-heading">
        <div className="forgot-password-content__inner">
          <ForgotPasswordButton type="button" variant="text" onClick={() => navigate('/')}>
            <svg className="forgot-password-button__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Voltar ao login
          </ForgotPasswordButton>
          <header className="forgot-password-title">
            <h1 id="reset-password-heading">Redefinir senha</h1>
            <p>Escolha uma nova senha com pelo menos {MIN_PASSWORD_LENGTH} caracteres.</p>
          </header>
          {renderContent()}
        </div>
      </section>
    </main>
  );
}
