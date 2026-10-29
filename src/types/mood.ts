// Mesmos valores do enum Mood do silpo-backend (app/enums/mood.py), na mesma ordem do app.
export const MOODS = ['FELIZ', 'BEM', 'CANSADO', 'TRISTE', 'ANSIOSO', 'IRRITADO'] as const;

export type Mood = (typeof MOODS)[number];
