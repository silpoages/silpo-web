import type { Meditation } from '@/types/meditation';

// Dados temporários até a integração com a API de meditações.
export const MEDITATIONS_MOCK: Meditation[] = [
  {
    id: '1',
    title: 'Respiração para dormir',
    description: 'Doze minutos de respiração lenta para desacelerar antes de deitar.',
    durationSeconds: 724,
    audioUrl: null,
    enabled: true,
    createdAt: '2026-07-01T12:00:00Z',
  },
  {
    id: '2',
    title: 'Pausa de cinco minutos',
    description: 'Uma parada curta para o meio da tarde, de olhos abertos, sem sair do lugar.',
    durationSeconds: 312,
    audioUrl: null,
    enabled: true,
    createdAt: '2026-07-02T12:00:00Z',
  },
  {
    id: '3',
    title: 'Ansiedade no peito',
    description: 'Guia para momentos em que a respiração fica curta e o corpo aperta.',
    durationSeconds: 510,
    audioUrl: null,
    enabled: true,
    createdAt: '2026-07-03T12:00:00Z',
  },
  {
    id: '4',
    title: 'Manhã sem pressa',
    description: 'Para ouvir ainda na cama, antes de pegar o celular.',
    durationSeconds: 405,
    audioUrl: null,
    enabled: false,
    createdAt: '2026-07-04T12:00:00Z',
  },
];
