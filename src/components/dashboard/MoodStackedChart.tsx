import { formatDayMonth } from '@/lib/date';
import { formatCount, getShare } from '@/lib/format';
import { moodConfig } from '@/lib/moodConfig';
import type { DailyMoodCount } from '@/types/dashboard';
import { MOODS } from '@/types/mood';

type MoodStackedChartProps = {
  days: DailyMoodCount[];
};

function getAxisIndexes(length: number): number[] {
  if (length === 0) return [];
  return [...new Set([0, Math.floor((length - 1) / 2), length - 1])];
}

export function MoodStackedChart({ days }: MoodStackedChartProps) {
  const columns = days.map((day) => {
    const segments = MOODS.map((mood) => ({ mood, count: day.counts[mood] ?? 0 }));
    const total = segments.reduce((sum, segment) => sum + segment.count, 0);
    return { date: day.date, segments, total };
  });
  const maxTotal = Math.max(0, ...columns.map((column) => column.total));
  const busiestDay = columns.find((column) => column.total === maxTotal);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  const description =
    firstDay && lastDay && busiestDay
      ? `Gráfico de barras empilhadas com as emoções registradas por dia, de ${formatDayMonth(firstDay.date)} a ${formatDayMonth(lastDay.date)}. Cada coluna é um dia e cada faixa é uma emoção. O dia com mais registros foi ${formatDayMonth(busiestDay.date)}, com ${formatCount(maxTotal, 'registro', 'registros')}.`
      : '';

  return (
    <section className="mood-chart" aria-labelledby="mood-chart-heading">
      <p className="mood-chart__eyebrow">Faixa emocional coletiva</p>
      <h2 id="mood-chart-heading" className="mood-chart__title">
        Cada coluna é um dia.{' '}
        <span className="mood-chart__highlight">Cada faixa, uma emoção registrada.</span>
      </h2>

      <ul className="mood-chart__legend" aria-label="Legenda das emoções">
        {MOODS.map((mood) => (
          <li key={mood} className="mood-chart__legend-item">
            <span
              className="mood-chart__legend-dot"
              style={{ backgroundColor: moodConfig[mood].color }}
              aria-hidden="true"
            />
            {moodConfig[mood].label}
          </li>
        ))}
      </ul>

      {maxTotal === 0 ? (
        <p className="mood-chart__empty">Nenhuma emoção registrada no período.</p>
      ) : (
        <>
          <div
            className={`mood-chart__plot${days.length > 45 ? ' mood-chart__plot--dense' : ''}`}
            role="img"
            aria-label={description}
          >
            {columns.map((column) => (
              <div
                key={column.date}
                className="mood-chart__column"
                style={{ height: `${getShare(column.total, maxTotal) * 100}%` }}
              >
                {column.segments
                  .filter((segment) => segment.count > 0)
                  .map((segment) => (
                    <span
                      key={segment.mood}
                      className="mood-chart__segment"
                      style={{
                        flexGrow: segment.count,
                        backgroundColor: moodConfig[segment.mood].color,
                      }}
                    />
                  ))}
              </div>
            ))}
          </div>
          <div className="mood-chart__axis" aria-hidden="true">
            {getAxisIndexes(days.length).map((index) => (
              <span key={days[index].date}>{formatDayMonth(days[index].date)}</span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
