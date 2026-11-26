import { describe, expect, it } from 'vitest';
import { formatCount, formatNumber, formatPercent, getShare } from './format';

describe('format', () => {
  it('formats numbers and percentages in pt-BR', () => {
    expect(formatNumber(8917)).toBe('8.917');
    expect(formatPercent(0.243)).toBe('24%');
  });

  it('uses singular only for exactly one', () => {
    expect(formatCount(1, 'registro', 'registros')).toBe('1 registro');
    expect(formatCount(0, 'registro', 'registros')).toBe('0 registros');
    expect(formatCount(1200, 'registro', 'registros')).toBe('1.200 registros');
  });

  it('returns the share of the total without dividing by zero', () => {
    expect(getShare(1, 4)).toBe(0.25);
    expect(getShare(3, 0)).toBe(0);
  });
});
