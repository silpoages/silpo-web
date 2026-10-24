import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestPasswordReset } from '@/services/forgotPassword';
import { ForgotPassword } from './ForgotPassword';

vi.mock('@/services/forgotPassword', () => ({ requestPasswordReset: vi.fn() }));

function renderPage() {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );
}

function submitEmail(email: string) {
  fireEvent.change(screen.getByLabelText('E-MAIL'), { target: { value: email } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar link de redefinição' }));
}

describe('ForgotPassword', () => {
  afterEach(() => {
    vi.mocked(requestPasswordReset).mockReset();
  });

  it('sends the reset request and confirms it', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({ message: 'ok' });
    renderPage();

    submitEmail(' admin@silpo.com ');

    expect(
      await screen.findByText(/se o e-mail estiver cadastrado, enviaremos um link/i),
    ).toBeInTheDocument();
    expect(requestPasswordReset).toHaveBeenCalledWith('admin@silpo.com');
    expect(screen.getByLabelText('E-MAIL')).toHaveValue('');
  });

  it('shows an error when the request fails', async () => {
    vi.mocked(requestPasswordReset).mockRejectedValue(new Error('network'));
    renderPage();

    submitEmail('admin@silpo.com');

    expect(
      await screen.findByText('Não foi possível enviar o link. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
