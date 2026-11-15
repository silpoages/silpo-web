import type { Meditation, MeditationFormValues } from '@/types/meditation';
import { apiFetch } from './api';

type MeditationResponse = {
  id: string;
  name: string;
  description: string;
  audio_url: string | null;
  max_duration_seconds: number | null;
  enabled: boolean;
};

type MeditationListResponse = {
  items: MeditationResponse[];
  total: number;
  page: number;
  page_size: number;
};

function toMeditation(response: MeditationResponse): Meditation {
  return {
    id: response.id,
    title: response.name,
    description: response.description,
    durationSeconds: response.max_duration_seconds ?? 0,
    audioUrl: response.audio_url,
    enabled: response.enabled,
    createdAt: '',
  };
}

function toFormData(values: MeditationFormValues) {
  const body = new FormData();
  body.append('name', values.title);
  body.append('description', values.description);
  body.append('max_duration_seconds', String(values.durationSeconds));
  body.append('enabled', String(values.enabled));
  if (values.audioFile) body.append('audio', values.audioFile);
  return body;
}

export async function getMeditations() {
  const pageSize = 100;
  const meditations: Meditation[] = [];
  const fetchPage = (page: number) =>
    apiFetch<MeditationListResponse>(
      `/admin/meditations?${new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      }).toString()}`,
    );

  const firstPage = await fetchPage(1);
  meditations.push(...firstPage.items.map(toMeditation));
  const totalPages = Math.ceil(firstPage.total / firstPage.page_size);
  for (let page = 2; page <= totalPages; page += 1) {
    const response = await fetchPage(page);
    meditations.push(...response.items.map(toMeditation));
  }
  return meditations;
}

export async function createMeditation(values: MeditationFormValues) {
  const response = await apiFetch<MeditationResponse>('/admin/meditations', {
    method: 'POST',
    body: toFormData(values),
  });
  return toMeditation(response);
}

export async function updateMeditation(id: string, values: MeditationFormValues) {
  const response = await apiFetch<MeditationResponse>(
    `/admin/meditations/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: toFormData(values) },
  );
  return toMeditation(response);
}

export async function setMeditationEnabled(id: string, enabled: boolean) {
  const body = new FormData();
  body.append('enabled', String(enabled));
  const response = await apiFetch<MeditationResponse>(
    `/admin/meditations/${encodeURIComponent(id)}`,
    { method: 'PATCH', body },
  );
  return toMeditation(response);
}

export function deleteMeditation(id: string) {
  return apiFetch<void>(`/admin/meditations/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
