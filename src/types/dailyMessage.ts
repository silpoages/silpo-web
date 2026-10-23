export type DailyMessage = {
  id: string;
  message: string;
  enabled: boolean;
  lastShown: string | null;
  createdAt: string;
};

export type DailyMessageStatusFilter = 'all' | 'enabled' | 'disabled';

export type DailyMessageCounts = {
  total: number;
  enabled: number;
  disabled: number;
};
