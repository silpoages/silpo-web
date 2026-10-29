export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR');
}

function isSameDay(date: Date, otherDate: Date) {
  return (
    date.getFullYear() === otherDate.getFullYear() &&
    date.getMonth() === otherDate.getMonth() &&
    date.getDate() === otherDate.getDate()
  );
}

// "hoje, 08:12", "ontem, 21:40" ou a data completa para acessos mais antigos.
export function formatLastAccess(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate);
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return `hoje, ${time}`;
  if (isSameDay(date, yesterday)) return `ontem, ${time}`;
  return formatDate(isoDate);
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
