import { ContinueJourneyCard } from '@/components/ContinueJourneyCard';

export function Dashboard() {
  return (
    <main className="dashboard">
      <h1>Silpo — Painel administrativo</h1>
      <section className="dashboard__journey" aria-label="Resumo da jornada">
        <ContinueJourneyCard />
      </section>
    </main>
  );
}
