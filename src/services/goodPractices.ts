import type { GoodPractice } from '@/components/goodPractices/card/GoodPracticeCard';
import { apiFetch } from './api';

type GoodPracticeResponse = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

type GoodPracticeListResponse = {
  items: GoodPracticeResponse[];
  total: number;
  page: number;
  page_size: number;
};

export type GoodPracticeInput = Pick<GoodPractice, 'title' | 'description' | 'status'>;

function toGoodPractice(response: GoodPracticeResponse): GoodPractice {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    status: response.enabled ? 'published' : 'draft',
  };
}

function toRequestBody(practice: GoodPracticeInput) {
  return {
    title: practice.title,
    description: practice.description,
    enabled: practice.status === 'published',
  };
}

export async function createGoodPractice(practice: GoodPracticeInput) {
  const response = await apiFetch<GoodPracticeResponse>('/admin/good-practices', {
    method: 'POST',
    body: JSON.stringify(toRequestBody(practice)),
  });
  return toGoodPractice(response);
}

export async function getGoodPractices() {
  const pageSize = 100;
  const practices: GoodPractice[] = [];
  const fetchPage = async (page: number) => {
    const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    return apiFetch<GoodPracticeListResponse>(`/admin/good-practices?${query.toString()}`);
  };

  const firstPage = await fetchPage(1);
  practices.push(...firstPage.items.map(toGoodPractice));
  const totalPages = Math.ceil(firstPage.total / firstPage.page_size);

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await fetchPage(page);
    practices.push(...response.items.map(toGoodPractice));
  }

  return practices;
}

export async function updateGoodPractice(id: string, practice: GoodPracticeInput) {
  const response = await apiFetch<GoodPracticeResponse>(
    `/admin/good-practices/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(toRequestBody(practice)),
    },
  );
  return toGoodPractice(response);
}

export function deleteGoodPractice(id: string) {
  return apiFetch<void>(`/admin/good-practices/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
