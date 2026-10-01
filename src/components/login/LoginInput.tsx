import { useState, type ComponentProps } from 'react';

type LoginInputProps = ComponentProps<'input'> & {
  label: string;
  isPassword?: boolean;
};

export function LoginInput({
  id,
  label,
  isPassword = false,
  type = 'text',
  className,
  ...inputProps
}: LoginInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="login-input">
      <label htmlFor={id}>{label}</label>
      <div className="login-input__field">
        <input
          id={id}
          type={isPassword ? (isVisible ? 'text' : 'password') : type}
          className={[className, isPassword && 'login-input__control--password']
            .filter(Boolean)
            .join(' ')}
          {...inputProps}
        />
        {isPassword && (
          <button
            className="login-input__toggle"
            type="button"
            aria-label={
              isVisible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`
            }
            aria-pressed={isVisible}
            onClick={() => setIsVisible((visible) => !visible)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path
                d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.7" />
              {isVisible && (
                <path
                  d="M4 20 20 4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
