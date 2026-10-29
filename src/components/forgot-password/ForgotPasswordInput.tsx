import type { ComponentProps } from 'react';

type ForgotPasswordInputProps = ComponentProps<'input'> & {
  label: string;
};

export function ForgotPasswordInput({ id, label, ...inputProps }: ForgotPasswordInputProps) {
  return (
    <div className="forgot-password-input">
      <label htmlFor={id}>{label}</label>
      <div className="forgot-password-input__field">
        <input id={id} {...inputProps} />
      </div>
    </div>
  );
}
