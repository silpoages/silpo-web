import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDashboard } from './dashboard';

describe('dashboard service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks for summary, moods and activities of the selected period', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            total_users: 10,
            premium_active_users: 2,
            age_distribution: [{ age_range: '18-24', count: 4 }],
            gender_distribution: [{ gender: 'FEMALE', count: 6 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            daily: [{ day: '2026-11-01', counts: { FELIZ: 1 } }],
            distribution: [{ mood: 'FELIZ', count: 1 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            top_activities: [{ id: 'breathing', name: 'Respiração', executions: 3 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const data = await getDashboard(7);

    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
      expect.stringMatching(/\/admin\/dashboard\/summary$/),
      expect.stringMatching(/\/admin\/dashboard\/moods\?period_days=7$/),
      expect.stringMatching(/\/admin\/dashboard\/activities\?period_days=7$/),
    ]);
    expect(data.totalUsers).toBe(10);
    expect(data.dailyMoods).toEqual([{ date: '2026-11-01', counts: { FELIZ: 1 } }]);
    expect(data.genderDistribution).toEqual([{ label: 'Feminino', count: 6 }]);
    expect(data.topActivities[0]?.name).toBe('Respiração');
  });
});
