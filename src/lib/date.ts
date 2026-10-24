export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR');
}

const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

/** "2026-08-20" → "20 ago". */
export function formatDayMonth(isoDate: string): string {
  const parts = dayMonthFormatter.formatToParts(new Date(isoDate));
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value.replace('.', '') ?? '';
  return `${day} ${month}`;
}
