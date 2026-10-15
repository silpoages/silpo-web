import { useState, type ComponentProps } from 'react';

type ForgotPasswordProps = ComponentProps<'input'> & {
  label: string;
  isEmail?: boolean;
};

export function ForgotPasswordInput({
  id,
  label,
  isEmail = false,
  type = 'text',
  className,
  ...inputProps
}: ForgotPasswordProps) {
  const [isVisible] = useState(true);

  return (
    <div className="forgot-password-input">
      <label htmlFor={id}>{label}</label>
      <div className="forgot-password-input__field">
        <input
          id={id}
          type={isEmail ? (isVisible ? 'text' : 'email') : type}
          className={[className, isEmail && 'forgot-password-input__control--email']
            .filter(Boolean)
            .join('')}
          {...inputProps}
        />
      </div>
    </div>
  );
}
