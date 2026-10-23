import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

function renderPagination(page: number, totalPages = 3) {
  const onPageChange = vi.fn();
  const onPageSizeChange = vi.fn();

  render(
    <Pagination
      page={page}
      totalPages={totalPages}
      pageSize={10}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />,
  );

  return { onPageChange, onPageSizeChange };
}

describe('Pagination', () => {
  it('disables the previous button on the first page', () => {
    renderPagination(1);

    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('disables the next button on the last page', () => {
    renderPagination(3);

    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
  });

  it('notifies page and page size changes', () => {
    const { onPageChange, onPageSizeChange } = renderPagination(2);

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    fireEvent.click(screen.getByRole('button', { name: 'Página 1' }));
    fireEvent.change(screen.getByLabelText('Itens por página'), { target: { value: '20' } });

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
