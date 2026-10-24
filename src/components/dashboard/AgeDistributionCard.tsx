import { formatPercent, getShare } from '@/lib/format';
import type { DistributionItem } from '@/types/dashboard';

type AgeDistributionCardProps = {
  items: DistributionItem[];
};

export function AgeDistributionCard({ items }: AgeDistributionCardProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(0, ...items.map((item) => item.count));
  const description = `Gráfico de barras com a distribuição dos usuários ativos por faixa etária: ${items
    .map((item) => `${item.label}, ${formatPercent(getShare(item.count, total))}`)
    .join('; ')}.`;

  return (
    <article className="dashboard-card" aria-labelledby="age-distribution-heading">
      <header className="dashboard-card__header">
        <h2 id="age-distribution-heading" className="dashboard-card__title">
          Uso por faixa etária
        </h2>
        <span className="dashboard-card__meta">% de usuários ativos</span>
      </header>

      {total === 0 ? (
        <p className="dashboard-card__empty">Nenhum usuário ativo no período.</p>
      ) : (
        <div className="age-chart" role="img" aria-label={description}>
          {items.map((item) => (
            <div key={item.label} className="age-chart__column">
              <div className="age-chart__track">
                <div
                  className="age-chart__bar"
                  style={{ height: `${getShare(item.count, maxCount) * 100}%` }}
                />
              </div>
              <span className="age-chart__value">{formatPercent(getShare(item.count, total))}</span>
              <span className="age-chart__label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
