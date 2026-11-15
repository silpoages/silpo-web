import type {
  DailyMessage,
  DailyMessageCounts,
  DailyMessageFormValues,
  DailyMessageStatusFilter,
} from '@/types/dailyMessage';
import { apiFetch } from './api';

type DailyMessageResponse = {
  id: string;
  message: string;
  enabled: boolean;
  last_shown: string | null;
  created_at: string;
};

type DailyMessageListResponse = {
  items: DailyMessageResponse[];
  page: number;
  page_size: number;
  total: number;
  enabled: number;
  disabled: number;
};

export type DailyMessageQuery = {
  page: number;
  pageSize: number;
  search: string;
  status: DailyMessageStatusFilter;
};

function toDailyMessage(response: DailyMessageResponse): DailyMessage {
  return {
    id: response.id,
    message: response.message,
    enabled: response.enabled,
    lastShown: response.last_shown,
    createdAt: response.created_at,
  };
}

function statusParam(status: DailyMessageStatusFilter): string | null {
  if (status === 'enabled') return 'true';
  if (status === 'disabled') return 'false';
  return null;
}

export async function getDailyMessages(query: DailyMessageQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    page_size: String(query.pageSize),
  });
  const search = query.search.trim();
  if (search) params.set('search', search);
  const enabled = statusParam(query.status);
  if (enabled) params.set('enabled', enabled);

  const response = await apiFetch<DailyMessageListResponse>(
    `/admin/daily-messages?${params.toString()}`,
  );
  const counts: DailyMessageCounts = {
    total: response.total,
    enabled: response.enabled,
    disabled: response.disabled,
  };
  const filteredTotal =
    query.status === 'enabled'
      ? response.enabled
      : query.status === 'disabled'
        ? response.disabled
        : response.total;

  return {
    messages: response.items.map(toDailyMessage),
    counts,
    total: filteredTotal,
  };
}

export async function createDailyMessage(values: DailyMessageFormValues) {
  const response = await apiFetch<DailyMessageResponse>('/admin/daily-messages', {
    method: 'POST',
    body: JSON.stringify(values),
  });
  return toDailyMessage(response);
}

export async function updateDailyMessage(id: string, values: Partial<DailyMessageFormValues>) {
  const response = await apiFetch<DailyMessageResponse>(
    `/admin/daily-messages/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(values),
    },
  );
  return toDailyMessage(response);
}
