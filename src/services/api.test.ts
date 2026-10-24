import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, setUnauthorizedHandler } from './api';
import { getAccessToken, setAccessToken } from './session';

function mockFetch(status: number, body: unknown = {}) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setUnauthorizedHandler(null);
    sessionStorage.clear();
    localStorage.clear();
  });

  it('sends the stored token as a Bearer header', async () => {
    setAccessToken('token-123');
    const fetchMock = mockFetch(200, { ok: true });

    await apiFetch('/auth/me');

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('does not send Authorization without a token', async () => {
    const fetchMock = mockFetch(200, { ok: true });

    await apiFetch('/auth/login', { method: 'POST' });

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.has('Authorization')).toBe(false);
  });

  it('ends the session when an authenticated request returns 401', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    setAccessToken('expired-token', true);
    mockFetch(401, { detail: 'Credentials not validated' });

    await expect(apiFetch('/admin/users')).rejects.toMatchObject({ status: 401 });

    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(getAccessToken()).toBeNull();
  });

  it('does not end the session on a 401 from an anonymous request', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    mockFetch(401, { detail: 'Invalid credentials' });

    await expect(apiFetch('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      status: 401,
      message: 'Invalid credentials',
    });

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
