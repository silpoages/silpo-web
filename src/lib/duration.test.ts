import { describe, expect, it } from 'vitest';
import { formatDuration, parseDuration } from './duration';

describe('formatDuration', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatDuration(304)).toBe('05:04');
    expect(formatDuration(724)).toBe('12:04');
    expect(formatDuration(0)).toBe('00:00');
  });
});

describe('parseDuration', () => {
  it('parses mm:ss into seconds', () => {
    expect(parseDuration('05:04')).toBe(304);
    expect(parseDuration(' 12:04 ')).toBe(724);
    expect(parseDuration('120:00')).toBe(7200);
  });

  it('rejects values outside the mm:ss format', () => {
    expect(parseDuration('5')).toBeNull();
    expect(parseDuration('05:60')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
  });
});
