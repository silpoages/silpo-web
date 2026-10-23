import './ui.css';

type StatusBadgeProps = {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function StatusBadge({
  isActive,
  activeLabel = 'Ativa',
  inactiveLabel = 'Inativa',
}: StatusBadgeProps) {
  return (
    <span className={isActive ? 'status-badge status-badge--active' : 'status-badge'}>
      <span className="status-badge__dot" aria-hidden="true" />
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}
