import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser, login } from './auth';
import { requestPasswordReset, resetPassword, verifyResetCode } from './forgotPassword';
import {
  createGoodPractice,
  deleteGoodPractice,
  getGoodPractices,
  updateGoodPractice,
} from './goodPractices';
import { createUser, updateUser } from './users';

function jsonResponse(body: unknown, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetch(...responses: Response[]) {
  const fetchMock = vi.fn();
  responses.forEach((response) => fetchMock.mockResolvedValueOnce(response));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function call(fetchMock: ReturnType<typeof vi.fn>, index = 0) {
  const [url, init] = fetchMock.mock.calls[index] as [string, RequestInit];
  return {
    path: url.replace(String(import.meta.env.VITE_API_BASE_URL), ''),
    method: init.method ?? 'GET',
    body: init.body ? (JSON.parse(String(init.body)) as unknown) : undefined,
  };
}

const practiceResponse = {
  id: 'p1',
  title: 'Caminhar',
  description: 'Dez minutos ao ar livre',
  enabled: true,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('auth service', () => {
  it('logs in with e-mail and password', async () => {
    const fetchMock = mockFetch(jsonResponse({ access_token: 'jwt', token_type: 'bearer' }));

    await expect(login('admin@silpo.org', 'senha')).resolves.toMatchObject({
      access_token: 'jwt',
    });

    expect(call(fetchMock)).toEqual({
      path: '/auth/login',
      method: 'POST',
      body: { email: 'admin@silpo.org', password: 'senha' },
    });
  });

  it('reads the current user', async () => {
    const fetchMock = mockFetch(jsonResponse({ id: '1', role: 'ADMIN' }));

    await expect(getCurrentUser()).resolves.toEqual({ id: '1', role: 'ADMIN' });
    expect(call(fetchMock)).toMatchObject({ path: '/auth/me', method: 'GET' });
  });
});

describe('password reset service', () => {
  it('requests the reset link for an e-mail', async () => {
    const fetchMock = mockFetch(jsonResponse({ message: 'ok' }));

    await requestPasswordReset('admin@silpo.org');

    expect(call(fetchMock)).toEqual({
      path: '/auth/forgot-password',
      method: 'POST',
      body: { email: 'admin@silpo.org' },
    });
  });

  it('escapes the code in the verification and reset URLs', async () => {
    const fetchMock = mockFetch(jsonResponse({ message: 'ok' }), jsonResponse({ message: 'ok' }));

    await verifyResetCode('a/b?c');
    await resetPassword('a/b?c', 'nova-senha');

    expect(call(fetchMock, 0)).toMatchObject({ path: '/auth/reset-password/a%2Fb%3Fc' });
    expect(call(fetchMock, 1)).toEqual({
      path: '/auth/reset-password/a%2Fb%3Fc',
      method: 'POST',
      body: { new_password: 'nova-senha' },
    });
  });
});

describe('good practices service', () => {
  it('loads every page and maps enabled to the published status', async () => {
    const fetchMock = mockFetch(
      jsonResponse({ items: [practiceResponse], total: 201, page: 1, page_size: 100 }),
      jsonResponse({
        items: [{ ...practiceResponse, id: 'p2', enabled: false }],
        total: 201,
        page: 2,
        page_size: 100,
      }),
      jsonResponse({
        items: [{ ...practiceResponse, id: 'p3' }],
        total: 201,
        page: 3,
        page_size: 100,
      }),
    );

    const practices = await getGoodPractices();

    expect(practices.map(({ id, status }) => [id, status])).toEqual([
      ['p1', 'published'],
      ['p2', 'draft'],
      ['p3', 'published'],
    ]);
    expect(fetchMock.mock.calls.map((_, index) => call(fetchMock, index).path)).toEqual([
      '/admin/good-practices?page=1&page_size=100',
      '/admin/good-practices?page=2&page_size=100',
      '/admin/good-practices?page=3&page_size=100',
    ]);
  });

  it('makes a single request when everything fits in the first page', async () => {
    const fetchMock = mockFetch(jsonResponse({ items: [], total: 0, page: 1, page_size: 100 }));

    await expect(getGoodPractices()).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('creates and updates sending enabled from the status', async () => {
    const fetchMock = mockFetch(
      jsonResponse({ ...practiceResponse, enabled: false }),
      jsonResponse(practiceResponse),
    );

    const created = await createGoodPractice({
      title: 'Caminhar',
      description: 'Dez minutos ao ar livre',
      status: 'draft',
    });
    const updated = await updateGoodPractice('p 1', {
      title: 'Caminhar',
      description: 'Dez minutos ao ar livre',
      status: 'published',
    });

    expect(created.status).toBe('draft');
    expect(updated.status).toBe('published');
    expect(call(fetchMock, 0)).toEqual({
      path: '/admin/good-practices',
      method: 'POST',
      body: { title: 'Caminhar', description: 'Dez minutos ao ar livre', enabled: false },
    });
    expect(call(fetchMock, 1)).toMatchObject({
      path: '/admin/good-practices/p%201',
      method: 'PATCH',
      body: { enabled: true },
    });
  });

  it('deletes by id', async () => {
    const fetchMock = mockFetch(jsonResponse(null, 204));

    await expect(deleteGoodPractice('p1')).resolves.toBeUndefined();
    expect(call(fetchMock)).toMatchObject({ path: '/admin/good-practices/p1', method: 'DELETE' });
  });
});

describe('users service', () => {
  const userResponse = {
    id: 'u1',
    full_name: null,
    email: 'ana@email.com',
    birth_date: null,
    gender: 'FEMALE',
    role: 'USER',
    enabled: true,
    onboarding_completed: false,
    created_at: '2026-01-01T00:00:00Z',
  };

  it('creates a user mapping the form fields to the API names', async () => {
    const fetchMock = mockFetch(jsonResponse(userResponse, 201));

    const user = await createUser({
      name: 'Ana',
      email: 'ana@email.com',
      birthDate: null,
      gender: 'FEMALE',
      isActive: true,
    });

    expect(user).toMatchObject({ id: 'u1', name: null, isActive: true });
    expect(call(fetchMock)).toEqual({
      path: '/admin/users',
      method: 'POST',
      body: {
        full_name: 'Ana',
        email: 'ana@email.com',
        birth_date: null,
        gender: 'FEMALE',
        enabled: true,
      },
    });
  });

  it('sends only the changed fields on update', async () => {
    const fetchMock = mockFetch(jsonResponse({ ...userResponse, enabled: false }));

    await updateUser('u1', { isActive: false });

    expect(call(fetchMock)).toEqual({
      path: '/admin/users/u1',
      method: 'PATCH',
      body: { enabled: false },
    });
  });
});
