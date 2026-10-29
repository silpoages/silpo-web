import type { ComponentProps } from 'react';

type ForgotPasswordButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'text';
};

export function ForgotPasswordButton({
  className = '',
  variant = 'primary',
  ...buttonProps
}: ForgotPasswordButtonProps) {
  return (
    <button
      className={`forgot-password-button forgot-password-button--${variant} ${className}`.trim()}
      {...buttonProps}
    />
  );
}
