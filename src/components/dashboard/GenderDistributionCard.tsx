import { formatPercent, getShare } from '@/lib/format';
import type { DistributionItem } from '@/types/dashboard';

const GENDER_COLORS = ['#0d1a13', '#2f6b46', '#d9ded6', '#86c98f', '#c8e6cc'];
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type GenderDistributionCardProps = {
  items: DistributionItem[];
};

export function GenderDistributionCard({ items }: GenderDistributionCardProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const segments = items.map((item, index) => ({
    label: item.label,
    share: getShare(item.count, total),
    start: items
      .slice(0, index)
      .reduce((sum, previous) => sum + getShare(previous.count, total), 0),
    color: GENDER_COLORS[index % GENDER_COLORS.length],
  }));
  const description = `Gráfico de rosca com a distribuição dos usuários por gênero: ${segments
    .map((segment) => `${segment.label}, ${formatPercent(segment.share)}`)
    .join('; ')}.`;

  return (
    <article className="dashboard-card" aria-labelledby="gender-distribution-heading">
      <header className="dashboard-card__header">
        <h2 id="gender-distribution-heading" className="dashboard-card__title">
          Uso por gênero
        </h2>
      </header>

      {total === 0 ? (
        <p className="dashboard-card__empty">Nenhum usuário ativo no período.</p>
      ) : (
        <div className="gender-chart">
          <svg
            className="gender-chart__donut"
            viewBox="0 0 100 100"
            role="img"
            aria-label={description}
          >
            <circle cx="50" cy="50" r={RADIUS} className="gender-chart__ring" />
            {segments
              .filter((segment) => segment.share > 0)
              .map((segment) => (
                <circle
                  key={segment.label}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  className="gender-chart__segment"
                  stroke={segment.color}
                  strokeDasharray={`${segment.share * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-segment.start * CIRCUMFERENCE}
                  transform="rotate(-90 50 50)"
                />
              ))}
          </svg>
          <ul className="gender-chart__legend">
            {segments.map((segment) => (
              <li key={segment.label} className="gender-chart__legend-item">
                <span
                  className="gender-chart__dot"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <span className="gender-chart__label">{segment.label}</span>
                <span className="gender-chart__value">{formatPercent(segment.share)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
