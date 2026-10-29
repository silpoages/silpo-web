import type { Mood } from './mood';

export type DashboardPeriod = 7 | 30 | 90;

export type DailyMoodCount = {
  /** Data no formato YYYY-MM-DD. */
  date: string;
  counts: Partial<Record<Mood, number>>;
};

export type MoodCount = {
  mood: Mood;
  count: number;
};

export type ActivityRankingItem = {
  id: string;
  name: string;
  executions: number;
};

export type DistributionItem = {
  label: string;
  count: number;
};

export type DashboardData = {
  totalUsers: number;
  activePremiumUsers: number;
  dailyMoods: DailyMoodCount[];
  moodDistribution: MoodCount[];
  topActivities: ActivityRankingItem[];
  ageDistribution: DistributionItem[];
  genderDistribution: DistributionItem[];
};
