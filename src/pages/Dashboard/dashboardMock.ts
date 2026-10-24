import type { DailyMoodCount, DashboardData, DashboardPeriod, MoodCount } from '@/types/dashboard';
import { MOODS, type Mood } from '@/types/mood';

// Dados temporários até a integração com a API do dashboard.
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LAST_DAY = Date.UTC(2026, 7, 20);

const BASE_MOOD_COUNTS: Record<Mood, number> = {
  FELIZ: 26,
  BEM: 22,
  CANSADO: 18,
  TRISTE: 12,
  ANSIOSO: 20,
  IRRITADO: 7,
};

function buildDailyMoods(period: DashboardPeriod): DailyMoodCount[] {
  return Array.from({ length: period }, (_, dayIndex) => {
    const date = new Date(LAST_DAY - (period - 1 - dayIndex) * DAY_IN_MS)
      .toISOString()
      .slice(0, 10);
    const counts: Partial<Record<Mood, number>> = {};
    MOODS.forEach((mood, moodIndex) => {
      // Variação determinística (sem Math.random) para o gráfico não ficar uniforme.
      const wave = Math.sin(dayIndex * 0.45 + moodIndex * 1.3) * 5;
      const weekendDip = dayIndex % 7 >= 5 ? -4 : 2;
      counts[mood] = Math.max(1, Math.round(BASE_MOOD_COUNTS[mood] + wave + weekendDip));
    });
    return { date, counts };
  });
}

function sumByMood(days: DailyMoodCount[]): MoodCount[] {
  return MOODS.map((mood) => ({
    mood,
    count: days.reduce((sum, day) => sum + (day.counts[mood] ?? 0), 0),
  }));
}

function scaleToPeriod(valueIn30Days: number, period: DashboardPeriod): number {
  return Math.round((valueIn30Days * period) / 30);
}

export function getDashboardMock(period: DashboardPeriod): DashboardData {
  const dailyMoods = buildDailyMoods(period);

  return {
    totalUsers: 1284,
    activePremiumUsers: 100,
    dailyMoods,
    moodDistribution: sumByMood(dailyMoods),
    topActivities: [
      { id: 'breathing', name: 'Respiração guiada', executions: scaleToPeriod(412, period) },
      { id: 'diary', name: 'Registro no diário', executions: scaleToPeriod(356, period) },
      { id: 'meditation', name: 'Meditação', executions: scaleToPeriod(298, period) },
      { id: 'good-practice', name: 'Prática do bem', executions: scaleToPeriod(187, period) },
      { id: 'self-regulation', name: 'Autorregulação', executions: scaleToPeriod(143, period) },
    ],
    ageDistribution: [
      { label: '13–17', count: 9 },
      { label: '18–24', count: 31 },
      { label: '25–34', count: 27 },
      { label: '35–44', count: 18 },
      { label: '45–59', count: 10 },
      { label: '60+', count: 5 },
    ],
    genderDistribution: [
      { label: 'Feminino', count: 58 },
      { label: 'Masculino', count: 33 },
      { label: 'Não binário', count: 6 },
      { label: 'Não informado', count: 3 },
    ],
  };
}
