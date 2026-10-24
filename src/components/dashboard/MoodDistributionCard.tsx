import { formatCount, getShare } from '@/lib/format';
import { moodConfig } from '@/lib/moodConfig';
import type { MoodCount } from '@/types/dashboard';
import { MOODS } from '@/types/mood';
import { MoodDistributionRow } from './MoodDistributionRow';

type MoodDistributionCardProps = {
  items: MoodCount[];
};

export function MoodDistributionCard({ items }: MoodDistributionCardProps) {
  const countByMood = new Map(items.map((item) => [item.mood, item.count]));
  const rows = MOODS.map((mood) => ({ mood, count: countByMood.get(mood) ?? 0 }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const maxCount = Math.max(0, ...rows.map((row) => row.count));

  return (
    <article className="dashboard-card" aria-labelledby="mood-distribution-heading">
      <header className="dashboard-card__header">
        <h2 id="mood-distribution-heading" className="dashboard-card__title">
          Emoções registradas
        </h2>
        <span className="dashboard-card__meta">{formatCount(total, 'registro', 'registros')}</span>
      </header>

      {total === 0 ? (
        <p className="dashboard-card__empty">Nenhuma emoção registrada no período.</p>
      ) : (
        <ul className="mood-distribution" aria-label="Distribuição das emoções registradas">
          {rows.map((row) => (
            <MoodDistributionRow
              key={row.mood}
              label={moodConfig[row.mood].label}
              color={moodConfig[row.mood].color}
              share={getShare(row.count, total)}
              relativeSize={getShare(row.count, maxCount)}
            />
          ))}
        </ul>
      )}
    </article>
  );
}
