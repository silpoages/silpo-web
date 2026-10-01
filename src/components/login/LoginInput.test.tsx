import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginInput } from './LoginInput';

describe('LoginInput', () => {
  it('toggles password visibility without clearing the typed value', () => {
    render(<LoginInput id="password" label="Senha" isPassword />);

    const input = screen.getByLabelText('Senha');
    fireEvent.change(input, { target: { value: 'minha senha' } });

    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('minha senha');

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
