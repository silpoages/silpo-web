import { apiFetch } from './api';
import { clearAccessToken, setAccessToken } from './session';

type LoginResponse = {
  access_token: string;
  token_type: string;
};

export async function login(email: string, password: string) {
  clearAccessToken();
  const response = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  setAccessToken(response.access_token);
}
