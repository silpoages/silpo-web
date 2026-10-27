export type Meditation = {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  audioUrl: string | null;
  enabled: boolean;
  createdAt: string;
};

export type MeditationFormValues = Pick<
  Meditation,
  'title' | 'description' | 'durationSeconds' | 'enabled'
> & {
  audioFile: File | null;
};
