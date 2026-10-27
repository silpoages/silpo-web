const DURATION_PATTERN = /^(\d{1,3}):([0-5]\d)$/;

// 304 → "05:04"
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// "05:04" → 304; devolve null quando o texto não está no formato mm:ss.
export function parseDuration(value: string): number | null {
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
