import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminLayout } from './AdminLayout';

type RenderOptions = {
  path?: string;
  props?: Parameters<typeof AdminLayout>[0];
};

function renderLayout({ path = '/dashboard', props = {} }: RenderOptions = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<p>Tela de login</p>} />
        <Route element={<AdminLayout {...props} />}>
          <Route path="/dashboard" element={<p>Conteúdo do dashboard</p>} />
          <Route path="/daily-messages" element={<p>Conteúdo das mensagens</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminLayout', () => {
  it('renders the current route content inside the layout', () => {
    renderLayout({ path: '/daily-messages' });

    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo das mensagens')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Painel administrativo');
  });

  it('highlights the sidebar item and breadcrumb of the current route', () => {
    renderLayout({ path: '/daily-messages' });

    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(nav).getByRole('link', { name: /mensagens diárias/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: /dashboard/i })).not.toHaveAttribute(
      'aria-current',
    );

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Início' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(within(breadcrumb).getByText('Mensagens diárias')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates between pages through the sidebar', () => {
    renderLayout({ path: '/dashboard' });

    fireEvent.click(screen.getByRole('link', { name: /mensagens diárias/i }));

    expect(screen.getByText('Conteúdo das mensagens')).toBeInTheDocument();
  });

  it('renders counters received by props formatted in pt-BR', () => {
    renderLayout({ props: { counters: { users: 1284, dailyMessages: 64 } } });

    expect(screen.getByRole('link', { name: /usuários/i })).toHaveTextContent('1.284');
    expect(screen.getByRole('link', { name: /mensagens diárias/i })).toHaveTextContent('64');
    expect(screen.getByRole('link', { name: /meditações/i })).toHaveTextContent(/^Meditações$/);
  });

  it('renders the user card with initials when a user is provided', () => {
    renderLayout({ props: { user: { name: 'Henrique Lima', role: 'Administrador' } } });

    expect(screen.getByText('HL')).toBeInTheDocument();
    expect(screen.getByText('Henrique Lima')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('calls onLogout when provided', () => {
    const handleLogout = vi.fn();
    renderLayout({ props: { onLogout: handleLogout } });

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(handleLogout).toHaveBeenCalledOnce();
  });

  it('goes back to the login page on logout by default', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(screen.getByText('Tela de login')).toBeInTheDocument();
  });
});
