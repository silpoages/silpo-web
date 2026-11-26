import { describe, expect, it } from 'vitest';
import { formatAge, getAge, getDisplayName, getInitials } from './user';
import type { AdminUser } from '@/types/user';

describe('getAge', () => {
  const now = new Date('2026-08-20T12:00:00');

  it('counts the birthday only once it has happened this year', () => {
    expect(getAge('1997-08-20', now)).toBe(29);
    expect(getAge('1997-08-21', now)).toBe(28);
    expect(getAge('1997-01-05', now)).toBe(29);
  });
});

describe('user labels', () => {
  const user: AdminUser = {
    id: '1',
    name: null,
    email: 'ana@email.com',
    birthDate: null,
    gender: 'FEMALE',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  it('formats the age in singular and plural', () => {
    expect(formatAge(1)).toBe('1 ano');
    expect(formatAge(0)).toBe('0 anos');
    expect(formatAge(29)).toBe('29 anos');
  });

  it('names users that have not finished onboarding', () => {
    expect(getDisplayName(user)).toBe('Sem nome');
    expect(getDisplayName({ ...user, name: 'Ana' })).toBe('Ana');
  });

  it('uses up to two initials', () => {
    expect(getInitials('  ana   beatriz souza ')).toBe('AB');
    expect(getInitials('élio')).toBe('É');
  });
});
