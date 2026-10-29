import type { DashboardData, DashboardPeriod } from '@/types/dashboard';
import { AgeDistributionCard } from './AgeDistributionCard';
import { DashboardHeader } from './DashboardHeader';
import { GenderDistributionCard } from './GenderDistributionCard';
import { MoodDistributionCard } from './MoodDistributionCard';
import { MoodStackedChart } from './MoodStackedChart';
import { StatCard } from './StatCard';
import { TopActivitiesCard } from './TopActivitiesCard';
import './DashboardScreen.css';

type DashboardScreenProps = {
  period: DashboardPeriod;
  data: DashboardData | null;
  isLoading?: boolean;
  error?: string | null;
  onPeriodChange: (period: DashboardPeriod) => void;
  onRetry?: () => void;
};

export function DashboardScreen({
  period,
  data,
  isLoading = false,
  error = null,
  onPeriodChange,
  onRetry,
}: DashboardScreenProps) {
  function renderContent() {
    if (isLoading) {
      return (
        <p className="dashboard__feedback" role="status">
          Carregando dados do dashboard…
        </p>
      );
    }

    if (error) {
      return (
        <div className="dashboard__feedback" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="dashboard__retry" onClick={onRetry}>
              Tentar novamente
            </button>
          )}
        </div>
      );
    }

    if (!data) {
      return (
        <p className="dashboard__feedback">Nenhum dado disponível para o período selecionado.</p>
      );
    }

    return (
      <>
        <MoodStackedChart days={data.dailyMoods} />
        <div className="dashboard__grid">
          <StatCard label="Usuários cadastrados" value={data.totalUsers} />
          <StatCard
            label="Usuários premium"
            value={data.activePremiumUsers}
            description={data.activePremiumUsers === 1 ? 'ativo este mês' : 'ativos este mês'}
          />
          <MoodDistributionCard items={data.moodDistribution} />
          <TopActivitiesCard activities={data.topActivities} />
          <AgeDistributionCard items={data.ageDistribution} />
          <GenderDistributionCard items={data.genderDistribution} />
        </div>
      </>
    );
  }

  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <DashboardHeader
        title="Dashboard"
        subtitle={`Como o SILPO está sendo usado nos últimos ${period} dias.`}
        period={period}
        onPeriodChange={onPeriodChange}
      />
      {renderContent()}
    </section>
  );
}
