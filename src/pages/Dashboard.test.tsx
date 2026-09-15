import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Dashboard } from './Dashboard';

afterEach(() => {
  cleanup();
});

describe('Dashboard', () => {
  it('renders the admin panel heading', () => {
    render(<Dashboard />);

    expect(screen.getByRole('heading', { name: /painel administrativo/i })).toBeInTheDocument();
  });

  it('renders the continue journey card', () => {
    render(<Dashboard />);

    expect(screen.getByRole('article', { name: /continue sua jornada/i })).toBeInTheDocument();
    expect(screen.getByText(/em 8 dias este mês/i)).toBeInTheDocument();
  });
});
