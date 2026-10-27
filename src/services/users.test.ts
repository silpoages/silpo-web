import { afterEach, describe, expect, it, vi } from 'vitest';
import { getUsers, updateUser } from './users';

function mockFetch(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const apiUser = {
  id: '1',
  full_name: 'Marina Alves',
  email: 'marina.alves@email.com',
  birth_date: '1997-03-12',
  gender: 'FEMALE',
  role: 'USER',
  enabled: true,
  onboarding_completed: true,
  created_at: '2026-03-12T12:00:00Z',
};

describe('users service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists only app accounts with the selected filters', async () => {
    const fetchMock = mockFetch({ items: [apiUser], total: 1, page: 2, page_size: 10 });

    const result = await getUsers({
      page: 2,
      pageSize: 10,
      search: ' marina ',
      filters: { status: 'inactive', gender: 'FEMALE' },
    });

    const url = new URL(fetchMock.mock.calls[0][0] as string, 'http://localhost');
    expect(url.pathname).toBe('/admin/users');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: '2',
      page_size: '10',
      role: 'USER',
      search: 'marina',
      enabled: 'false',
      gender: 'FEMALE',
    });
    expect(result).toEqual({
      total: 1,
      users: [
        {
          id: '1',
          name: 'Marina Alves',
          email: 'marina.alves@email.com',
          birthDate: '1997-03-12',
          gender: 'FEMALE',
          isActive: true,
          createdAt: '2026-03-12T12:00:00Z',
        },
      ],
    });
  });

  it('sends only the changed fields when updating', async () => {
    const fetchMock = mockFetch({ ...apiUser, enabled: false });

    await updateUser('1', { isActive: false });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toEqual({ enabled: false });
  });
});
