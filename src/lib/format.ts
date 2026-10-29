const numberFormatter = new Intl.NumberFormat('pt-BR');
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Recebe uma fração (0.24) e devolve o percentual formatado ("24%"). */
export function formatPercent(fraction: number): string {
  return percentFormatter.format(fraction);
}

/** Número formatado + palavra no singular ou plural ("1 registro", "8.917 registros"). */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

/** Proporção de `value` em relação a `total`, sem dividir por zero. */
export function getShare(value: number, total: number): number {
  return total > 0 ? value / total : 0;
}
