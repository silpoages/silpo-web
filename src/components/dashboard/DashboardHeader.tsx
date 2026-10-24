import type { DashboardPeriod } from '@/types/dashboard';
import { PeriodSelect } from './PeriodSelect';

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
};

export function DashboardHeader({ title, subtitle, period, onPeriodChange }: DashboardHeaderProps) {
  return (
    <header className="dashboard__header">
      <div>
        <h1 id="dashboard-heading" className="dashboard__title">
          {title}
        </h1>
        <p className="dashboard__subtitle">{subtitle}</p>
      </div>
      <PeriodSelect id="dashboard-period" value={period} onChange={onPeriodChange} />
    </header>
  );
}
