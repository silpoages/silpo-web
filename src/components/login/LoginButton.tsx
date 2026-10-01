import type { ComponentProps } from 'react';

type LoginButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'text';
};

export function LoginButton({
  className = '',
  variant = 'primary',
  ...buttonProps
}: LoginButtonProps) {
  return (
    <button
      className={`login-button login-button--${variant} ${className}`.trim()}
      {...buttonProps}
    />
  );
}
