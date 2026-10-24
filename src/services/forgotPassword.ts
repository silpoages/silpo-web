import { apiFetch } from './api';

type MessageResponse = {
  message: string;
};

export function requestPasswordReset(email: string) {
  return apiFetch<MessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function verifyResetCode(code: string) {
  return apiFetch<MessageResponse>(`/auth/reset-password/${encodeURIComponent(code)}`);
}

export function resetPassword(code: string, newPassword: string) {
  return apiFetch<MessageResponse>(`/auth/reset-password/${encodeURIComponent(code)}`, {
    method: 'POST',
    body: JSON.stringify({ new_password: newPassword }),
  });
}
