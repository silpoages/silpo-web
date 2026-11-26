import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, expireSession, setUnauthorizedHandler } from './api';
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

  it('joins FastAPI validation errors with the field name', async () => {
    mockFetch(422, {
      detail: [
        { loc: ['body', 'email'], msg: 'value is not a valid email address' },
        { loc: ['body', 'tags', 0], msg: 'field required' },
        { msg: 'something else' },
        { loc: 'not-a-list', msg: 'odd location' },
        'not an object',
        null,
        { loc: ['body', 'title'] },
        { msg: 42 },
      ],
    });

    await expect(apiFetch('/admin/users', { method: 'POST' })).rejects.toMatchObject({
      status: 422,
      message:
        'email: value is not a valid email address; tags: field required; something else; odd location',
    });
  });

  it('keeps the status message when the validation list has nothing readable', async () => {
    mockFetch(422, { detail: [{ loc: ['body'] }] });

    await expect(apiFetch('/admin/users')).rejects.toMatchObject({
      message: 'Request to /admin/users failed with status 422',
    });
  });

  it.each([
    ['a body without detail', { error: 'boom' }],
    ['a non-object body', 'boom'],
    ['a detail of another type', { detail: { code: 1 } }],
  ])('keeps the status message for %s', async (_, body) => {
    mockFetch(500, body);

    await expect(apiFetch('/health')).rejects.toMatchObject({
      status: 500,
      message: 'Request to /health failed with status 500',
    });
  });

  it('keeps the status message when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })),
    );

    await expect(apiFetch('/health')).rejects.toMatchObject({
      status: 502,
      message: 'Request to /health failed with status 502',
    });
  });

  it('resolves to undefined on 204 No Content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(
      apiFetch('/admin/good-practices/1', { method: 'DELETE' }),
    ).resolves.toBeUndefined();
  });

  it('keeps headers set by the caller', async () => {
    setAccessToken('token-123');
    const fetchMock = mockFetch(200, {});

    await apiFetch('/upload', {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: 'Bearer other' },
    });

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('Content-Type')).toBe('multipart/form-data');
    expect(headers.get('Authorization')).toBe('Bearer other');
  });

  it('expires the session on demand', () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    setAccessToken('token-123', true);

    expireSession();

    expect(getAccessToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('clears the token even without a registered handler', () => {
    setAccessToken('token-123');

    expireSession();

    expect(getAccessToken()).toBeNull();
  });
});
