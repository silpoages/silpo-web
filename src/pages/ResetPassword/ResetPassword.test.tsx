import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { resetPassword, verifyResetCode } from '@/services/forgotPassword';
import { ResetPassword } from './ResetPassword';

vi.mock('@/services/forgotPassword', () => ({
  verifyResetCode: vi.fn(),
  resetPassword: vi.fn(),
}));

function renderPage(path = '/reset-password?code=abc123') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<p>Tela de login</p>} />
        <Route path="/forgot-password" element={<p>Tela de esqueci a senha</p>} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillPasswords(password: string, confirmation: string) {
  fireEvent.change(screen.getByLabelText('NOVA SENHA'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('CONFIRMAR NOVA SENHA'), {
    target: { value: confirmation },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
}

describe('ResetPassword', () => {
  afterEach(() => {
    vi.mocked(verifyResetCode).mockReset();
    vi.mocked(resetPassword).mockReset();
  });

  it('shows an error when the link has no code', () => {
    renderPage('/reset-password');

    expect(screen.getByRole('alert')).toHaveTextContent('inválido, expirou ou já foi utilizado');
    expect(verifyResetCode).not.toHaveBeenCalled();
  });

  it('does not allow resetting with an invalid, expired or used code', async () => {
    vi.mocked(verifyResetCode).mockRejectedValue(
      new ApiError(400, 'Invalid or expired reset code'),
    );
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Verificando link');
    expect(await screen.findByText(/inválido, expirou ou já foi utilizado/)).toBeInTheDocument();
    expect(screen.queryByLabelText('NOVA SENHA')).toBeNull();

    fireEvent.click(screen.getByRole('link', { name: 'Solicitar novo link' }));
    expect(screen.getByText('Tela de esqueci a senha')).toBeInTheDocument();
  });

  it('requires at least eight characters and a matching confirmation', async () => {
    vi.mocked(verifyResetCode).mockResolvedValue({ message: 'Valid reset code' });
    renderPage();
    await screen.findByLabelText('NOVA SENHA');

    fillPasswords('curta', 'curta');
    expect(screen.getByText('A senha deve ter pelo menos 8 caracteres.')).toBeInTheDocument();

    fillPasswords('senha-segura', 'senha-diferente');
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('resets the password and goes back to the login', async () => {
    vi.mocked(verifyResetCode).mockResolvedValue({ message: 'Valid reset code' });
    vi.mocked(resetPassword).mockResolvedValue({ message: 'Password updated' });
    renderPage();
    await screen.findByLabelText('NOVA SENHA');

    fillPasswords('senha-segura', 'senha-segura');

    expect(await screen.findByText(/senha redefinida com sucesso/i)).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledWith('abc123', 'senha-segura');
    fireEvent.click(screen.getByRole('button', { name: 'Ir para o login' }));
    expect(screen.getByText('Tela de login')).toBeInTheDocument();
  });

  it('shows the invalid link state when the code expires before submitting', async () => {
    vi.mocked(verifyResetCode).mockResolvedValue({ message: 'Valid reset code' });
    vi.mocked(resetPassword).mockRejectedValue(new ApiError(400, 'Invalid or expired reset code'));
    renderPage();
    await screen.findByLabelText('NOVA SENHA');

    fillPasswords('senha-segura', 'senha-segura');

    expect(await screen.findByText(/inválido, expirou ou já foi utilizado/)).toBeInTheDocument();
  });
});
