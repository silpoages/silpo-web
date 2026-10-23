const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ForgotPasswordResponse = {
  message?: string;
};

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Não foi possível solicitar a redefinição de senha.');
  }

  return response.json() as Promise<ForgotPasswordResponse>;
}
