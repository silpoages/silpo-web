import { GENDER_LABELS } from '@/lib/user';
import type { Gender } from '@/types/user';
import type { DashboardData, DashboardPeriod } from '@/types/dashboard';
import type { Mood } from '@/types/mood';
import { apiFetch } from './api';

type SummaryResponse = {
  total_users: number;
  premium_active_users: number;
  age_distribution: { age_range: string; count: number }[];
  gender_distribution: { gender: Gender; count: number }[];
};

type MoodsResponse = {
  daily: { day: string; counts: Partial<Record<Mood, number>> }[];
  distribution: { mood: Mood; count: number }[];
};

type ActivitiesResponse = {
  top_activities: { id: string; name: string; executions: number }[];
};

export async function getDashboard(period: DashboardPeriod): Promise<DashboardData> {
  const query = `period_days=${period}`;
  const [summary, moods, activities] = await Promise.all([
    apiFetch<SummaryResponse>('/admin/dashboard/summary'),
    apiFetch<MoodsResponse>(`/admin/dashboard/moods?${query}`),
    apiFetch<ActivitiesResponse>(`/admin/dashboard/activities?${query}`),
  ]);

  return {
    totalUsers: summary.total_users,
    activePremiumUsers: summary.premium_active_users,
    dailyMoods: moods.daily.map((day) => ({ date: day.day, counts: day.counts })),
    moodDistribution: moods.distribution.map((item) => ({ mood: item.mood, count: item.count })),
    topActivities: activities.top_activities,
    ageDistribution: summary.age_distribution.map((item) => ({
      label: item.age_range,
      count: item.count,
    })),
    genderDistribution: summary.gender_distribution.map((item) => ({
      label: GENDER_LABELS[item.gender],
      count: item.count,
    })),
  };
}
