import { describe, expect, it } from 'vitest';
import { formatLastAccess } from './date';

const now = new Date('2026-08-20T15:00:00');

describe('formatLastAccess', () => {
  it('formats accesses from today and yesterday with the time', () => {
    expect(formatLastAccess('2026-08-20T08:12:00', now)).toBe('hoje, 08:12');
    expect(formatLastAccess('2026-08-19T21:40:00', now)).toBe('ontem, 21:40');
  });

  it('formats older accesses with the full date', () => {
    expect(formatLastAccess('2026-08-02T10:00:00', now)).toBe('02/08/2026');
  });
});
