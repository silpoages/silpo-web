import { useState } from 'react';
import { DashboardScreen } from '@/components/dashboard/DashboardScreen';
import { useDashboard } from '@/hooks/useDashboard';
import type { DashboardPeriod } from '@/types/dashboard';

export function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>(30);
  const dashboard = useDashboard(period);

  return (
    <DashboardScreen
      period={period}
      data={dashboard.data}
      isLoading={dashboard.isLoading}
      error={dashboard.error}
      onPeriodChange={setPeriod}
      onRetry={dashboard.reload}
    />
  );
}
