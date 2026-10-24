import { formatPercent } from '@/lib/format';

type MoodDistributionRowProps = {
  label: string;
  color: string;
  /** Fração do total de registros (0 a 1), exibida como percentual. */
  share: number;
  /** Tamanho da barra em relação à maior emoção (0 a 1). */
  relativeSize: number;
};

export function MoodDistributionRow({
  label,
  color,
  share,
  relativeSize,
}: MoodDistributionRowProps) {
  return (
    <li className="mood-row">
      <span className="mood-row__label">{label}</span>
      <span className="mood-row__track" aria-hidden="true">
        <span
          className="mood-row__bar"
          style={{ width: `${relativeSize * 100}%`, backgroundColor: color }}
        />
      </span>
      <span className="mood-row__value">{formatPercent(share)}</span>
    </li>
  );
}
