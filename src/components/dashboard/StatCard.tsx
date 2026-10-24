import { formatNumber } from '@/lib/format';

type StatCardProps = {
  label: string;
  value: number;
  description?: string;
};

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="dashboard-card stat-card">
      <h2 className="dashboard-card__eyebrow">{label}</h2>
      <p className="stat-card__value">
        <span className="stat-card__number">{formatNumber(value)}</span>
        {description && <span className="stat-card__description">{description}</span>}
      </p>
    </article>
  );
}
