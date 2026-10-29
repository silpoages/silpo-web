import './ui.css';

type ToggleProps = {
  isChecked: boolean;
  label: string;
  isDisabled?: boolean;
  size?: 'default' | 'small';
  onChange: (isChecked: boolean) => void;
};

export function Toggle({
  isChecked,
  label,
  isDisabled = false,
  size = 'default',
  onChange,
}: ToggleProps) {
  const classNames = ['toggle'];
  if (isChecked) classNames.push('toggle--checked');
  if (size === 'small') classNames.push('toggle--small');

  return (
    <button
      type="button"
      role="switch"
      className={classNames.join(' ')}
      aria-checked={isChecked}
      aria-label={label}
      disabled={isDisabled}
      onClick={() => onChange(!isChecked)}
    >
      <span className="toggle__thumb" aria-hidden="true" />
    </button>
  );
}
