import { useEffect, useState } from 'react';
import { ApiError, expireSession } from '@/services/api';
import { getDashboard } from '@/services/dashboard';
import type { DashboardData, DashboardPeriod } from '@/types/dashboard';

type DashboardState = {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

export function useDashboard(period: DashboardPeriod): DashboardState {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<Omit<DashboardState, 'reload'>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isCurrent = true;
    setState((current) => ({ ...current, isLoading: true, error: null }));

    getDashboard(period)
      .then((data) => {
        if (!isCurrent) return;
        setState({ data, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          expireSession();
          return;
        }
        setState({
          data: null,
          isLoading: false,
          error: 'Não foi possível carregar o dashboard.',
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [period, reloadKey]);

  return {
    ...state,
    reload: () => setReloadKey((key) => key + 1),
  };
}
