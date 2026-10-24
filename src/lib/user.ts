import type { Gender, UserFilters } from '@/types/user';

export const GENDER_LABELS: Record<Gender, string> = {
  FEMALE: 'Feminino',
  MALE: 'Masculino',
  NON_BINARY: 'Não-binário',
  OTHER: 'Outro',
  PREFER_NOT_TO_SAY: 'Prefere não informar',
};

export const GENDER_OPTIONS = Object.entries(GENDER_LABELS) as [Gender, string][];
export const DEFAULT_USER_FILTERS: UserFilters = { status: 'all', gender: 'all' };

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase('pt-BR'))
    .join('');
}

export function formatAge(age: number): string {
  return `${age} ${age === 1 ? 'ano' : 'anos'}`;
}
