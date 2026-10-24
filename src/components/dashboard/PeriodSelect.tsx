import type { ChangeEvent } from 'react';
import selectChevronIcon from '@/assets/icons/select-chevron.svg';
import type { DashboardPeriod } from '@/types/dashboard';
import '@/components/ui/ui.css';

const PERIOD_OPTIONS: DashboardPeriod[] = [7, 30, 90];

type PeriodSelectProps = {
  id: string;
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
};

function isDashboardPeriod(value: number): value is DashboardPeriod {
  return PERIOD_OPTIONS.includes(value as DashboardPeriod);
}

export function PeriodSelect({ id, value, onChange }: PeriodSelectProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = Number(event.target.value);
    if (isDashboardPeriod(nextValue)) {
      onChange(nextValue);
    }
  }

  return (
    <div className="period-select">
      <label htmlFor={id} className="visually-hidden">
        Período
      </label>
      <select id={id} value={value} onChange={handleChange}>
        {PERIOD_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {`Últimos ${option} dias`}
          </option>
        ))}
      </select>
      <img src={selectChevronIcon} alt="" width={16} height={16} />
    </div>
  );
}
