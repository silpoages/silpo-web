import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDailyMessages, updateDailyMessage } from './dailyMessages';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const apiMessage = {
  id: '1',
  message: 'Respire.',
  enabled: true,
  last_shown: null,
  created_at: '2026-11-01T12:00:00Z',
};

describe('daily messages service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends tab, search and pagination as query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        items: [apiMessage],
        page: 2,
        page_size: 10,
        total: 4,
        enabled: 3,
        disabled: 1,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getDailyMessages({
      page: 2,
      pageSize: 10,
      search: ' respire ',
      status: 'enabled',
    });

    const [path, queryString] = String(fetchMock.mock.calls[0][0]).split('?');
    expect(path).toMatch(/\/admin\/daily-messages$/);
    expect(Object.fromEntries(new URLSearchParams(queryString))).toEqual({
      page: '2',
      page_size: '10',
      search: 'respire',
      enabled: 'true',
    });
    expect(result.messages[0]).toMatchObject({ message: 'Respire.', lastShown: null });
    expect(result.total).toBe(3);
  });

  it('patches the enabled flag', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ...apiMessage, enabled: false }));
    vi.stubGlobal('fetch', fetchMock);

    await updateDailyMessage('1', { enabled: false });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/admin\/daily-messages\/1$/);
    expect(init.method).toBe('PATCH');
    expect(init.body).toBe(JSON.stringify({ enabled: false }));
  });
});
