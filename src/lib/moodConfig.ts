import type { Mood } from '@/types/mood';

type MoodConfig = {
  label: string;
  color: string;
};

// Labels iguais aos exibidos no app (silpo-mobile); cores da paleta do protótipo.
export const moodConfig: Record<Mood, MoodConfig> = {
  FELIZ: { label: 'Feliz', color: '#e9a93b' },
  BEM: { label: 'Bem', color: '#7cc59a' },
  CANSADO: { label: 'Cansado', color: '#b3dea3' },
  TRISTE: { label: 'Triste', color: '#6e86ac' },
  ANSIOSO: { label: 'Ansioso', color: '#c98a4e' },
  IRRITADO: { label: 'Irritado', color: '#c4483f' },
};
