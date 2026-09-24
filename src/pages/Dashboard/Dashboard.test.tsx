import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('renders the admin panel heading', () => {
    render(<Dashboard />);

    expect(screen.getByRole('heading', { name: /painel administrativo/i })).toBeInTheDocument();
  });
});
