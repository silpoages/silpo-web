import { useState } from 'react';
import { DashboardScreen } from '@/components/dashboard/DashboardScreen';
import type { DashboardPeriod } from '@/types/dashboard';
import { getDashboardMock } from './dashboardMock';

export function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>(30);

  return (
    <DashboardScreen period={period} data={getDashboardMock(period)} onPeriodChange={setPeriod} />
  );
}
