import { formatCount, getShare } from '@/lib/format';
import type { ActivityRankingItem } from '@/types/dashboard';

type TopActivitiesCardProps = {
  activities: ActivityRankingItem[];
};

export function TopActivitiesCard({ activities }: TopActivitiesCardProps) {
  const ranking = [...activities].sort((a, b) => b.executions - a.executions);
  const maxExecutions = ranking[0]?.executions ?? 0;

  return (
    <article className="dashboard-card" aria-labelledby="top-activities-heading">
      <header className="dashboard-card__header">
        <h2 id="top-activities-heading" className="dashboard-card__title">
          Atividades mais realizadas
        </h2>
      </header>

      {ranking.length === 0 ? (
        <p className="dashboard-card__empty">Nenhuma atividade realizada no período.</p>
      ) : (
        <ol className="activity-ranking">
          {ranking.map((activity, index) => (
            <li key={activity.id} className="activity-ranking__item">
              <span className="activity-ranking__position" aria-hidden="true">
                {index + 1}
              </span>
              <div className="activity-ranking__content">
                <div className="activity-ranking__row">
                  <span className="activity-ranking__name">{activity.name}</span>
                  <span className="activity-ranking__count">
                    {formatCount(activity.executions, 'execução', 'execuções')}
                  </span>
                </div>
                <span className="activity-ranking__track" aria-hidden="true">
                  <span
                    className="activity-ranking__bar"
                    style={{ width: `${getShare(activity.executions, maxExecutions) * 100}%` }}
                  />
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
