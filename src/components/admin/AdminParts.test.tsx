import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '@/lib/authContext';
import { AdminFooter } from './AdminFooter';
import { AdminLayout } from './AdminLayout';
import { Breadcrumb } from './Breadcrumb';
import { UserCard } from './UserCard';

function renderLayoutAs(user: AuthContextValue['user'], path = '/dashboard') {
  const value: AuthContextValue = {
    user,
    status: 'authenticated',
    login: vi.fn(),
    logout: vi.fn(),
  };
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<p>Conteúdo</p>} />
            <Route path="/outra" element={<p>Fora do menu</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('AdminLayout user card', () => {
  it('falls back to the e-mail when the admin has no name', () => {
    renderLayoutAs({
      id: '1',
      email: 'admin@silpo.org',
      full_name: null,
      role: 'ADMIN',
      onboarding_completed: true,
    });

    expect(screen.getByText('admin@silpo.org')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('shows no user card without a signed-in user', () => {
    renderLayoutAs(null);

    expect(screen.queryByText('Administrador')).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Sair' })).toHaveLength(1);
  });
});

describe('AdminLayout breadcrumb', () => {
  it('shows only "Início" on a page that is not in the menu', () => {
    renderLayoutAs(null, '/outra');

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(1);
    expect(within(nav).getByText('Início')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Fora do menu')).toBeInTheDocument();
  });
});

describe('AdminFooter', () => {
  it('links the documentation when a URL is given', () => {
    render(<AdminFooter documentationUrl="https://docs.silpo.org" />);

    const link = screen.getByRole('link', { name: 'Documentação' });
    expect(link).toHaveAttribute('href', 'https://docs.silpo.org');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('shows plain text without a URL', () => {
    render(<AdminFooter />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Documentação')).toBeInTheDocument();
  });
});

describe('Breadcrumb', () => {
  it('renders items without a path as text and marks only the last as current', () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          items={[{ label: 'Início', path: '/dashboard' }, { label: 'Seção' }, { label: 'Atual' }]}
        />
      </MemoryRouter>,
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/dashboard');
    expect(within(nav).getByText('Seção')).not.toHaveAttribute('aria-current');
    expect(within(nav).getByText('Seção')).toHaveClass('breadcrumb__link');
    expect(within(nav).getByText('Atual')).toHaveAttribute('aria-current', 'page');
  });
});

describe('UserCard', () => {
  it.each([
    ['Henrique Lima', 'HL'],
    ['  maria   da   silva ', 'MS'],
    ['Cher', 'C'],
    ['   ', ''],
  ])('shows the initials of "%s"', (name, initials) => {
    const { container } = render(<UserCard name={name} role="Administrador" onLogout={vi.fn()} />);

    expect(container.querySelector('.user-card__avatar')).toHaveTextContent(
      new RegExp(`^${initials}$`),
    );
  });
});
