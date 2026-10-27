import { describe, expect, it } from 'vitest';
import { getAge } from './user';

describe('getAge', () => {
  const now = new Date('2026-08-20T12:00:00');

  it('counts the birthday only once it has happened this year', () => {
    expect(getAge('1997-08-20', now)).toBe(29);
    expect(getAge('1997-08-21', now)).toBe(28);
    expect(getAge('1997-01-05', now)).toBe(29);
  });
});
