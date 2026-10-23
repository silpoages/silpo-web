import './ui.css';

type ToggleProps = {
  isChecked: boolean;
  label: string;
  isDisabled?: boolean;
  onChange: (isChecked: boolean) => void;
};

export function Toggle({ isChecked, label, isDisabled = false, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      className={isChecked ? 'toggle toggle--checked' : 'toggle'}
      aria-checked={isChecked}
      aria-label={label}
      disabled={isDisabled}
      onClick={() => onChange(!isChecked)}
    >
      <span className="toggle__thumb" aria-hidden="true" />
    </button>
  );
}
