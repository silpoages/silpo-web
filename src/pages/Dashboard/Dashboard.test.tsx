import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, setUnauthorizedHandler } from '@/services/api';
import { getDashboard } from '@/services/dashboard';
import { getAccessToken, setAccessToken } from '@/services/session';
import type { DashboardData } from '@/types/dashboard';
import { Dashboard } from './Dashboard';

vi.mock('@/services/dashboard', () => ({ getDashboard: vi.fn() }));

const data: DashboardData = {
  totalUsers: 1284,
  activePremiumUsers: 100,
  dailyMoods: [{ date: '2026-08-20', counts: { FELIZ: 4 } }],
  moodDistribution: [{ mood: 'FELIZ', count: 4 }],
  topActivities: [{ id: 'meditation', name: 'Meditação', executions: 12 }],
  ageDistribution: [{ label: '18-24', count: 30 }],
  genderDistribution: [{ label: 'Feminino', count: 3 }],
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(getDashboard).mockReset().mockResolvedValue(data);
    setUnauthorizedHandler(null);
    sessionStorage.clear();
    localStorage.clear();
  });

  it('loads the last 30 days and reloads when the period changes', async () => {
    render(<Dashboard />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados do dashboard');
    expect(await screen.findByText('1.284')).toBeInTheDocument();
    expect(getDashboard).toHaveBeenCalledWith(30);

    fireEvent.change(screen.getAllByLabelText('Período')[0], { target: { value: '7' } });

    await waitFor(() => expect(getDashboard).toHaveBeenLastCalledWith(7));
  });

  it('shows the error state and retries', async () => {
    vi.mocked(getDashboard).mockRejectedValueOnce(new ApiError(500, 'Erro'));
    render(<Dashboard />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o dashboard.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('1.284')).toBeInTheDocument();
    expect(getDashboard).toHaveBeenCalledTimes(2);
  });

  it.each([401, 403])('ends the session on %i instead of showing an error', async (status) => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    setAccessToken('jwt', true);
    vi.mocked(getDashboard).mockRejectedValueOnce(new ApiError(status, 'nope'));

    render(<Dashboard />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledOnce());
    expect(getAccessToken()).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('ignores responses that arrive after the page is closed', async () => {
    let resolve: (value: DashboardData) => void = () => {};
    let reject: (error: unknown) => void = () => {};
    vi.mocked(getDashboard)
      .mockReturnValueOnce(new Promise((resolvePromise) => (resolve = resolvePromise)))
      .mockReturnValueOnce(new Promise((_, rejectPromise) => (reject = rejectPromise)));

    render(<Dashboard />).unmount();
    render(<Dashboard />).unmount();
    resolve(data);
    reject(new Error('offline'));
    await new Promise((resolveTick) => setTimeout(resolveTick, 0));

    expect(screen.queryByText('1.284')).toBeNull();
  });
});
