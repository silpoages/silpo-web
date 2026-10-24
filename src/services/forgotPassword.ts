import { apiFetch } from './api';

type ForgotPasswordResponse = {
  message: string;
};

export function requestPasswordReset(email: string) {
  return apiFetch<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
