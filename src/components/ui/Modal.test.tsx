import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

function renderModal(props: Partial<Parameters<typeof Modal>[0]> = {}) {
  const onClose = vi.fn();
  render(
    <Modal
      id="test"
      title="Título"
      footer={<button type="button">Ok</button>}
      onClose={onClose}
      {...props}
    />,
  );
  return onClose;
}

describe('Modal', () => {
  it('closes on a click on the overlay but not inside the panel', () => {
    const onClose = renderModal({ children: <p>Corpo</p> });

    fireEvent.mouseDown(screen.getByText('Corpo'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on Escape and ignores other keys', () => {
    const onClose = renderModal();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('focuses the first field when it opens', () => {
    renderModal({ children: <input aria-label="Campo" /> });
    expect(screen.getByLabelText('Campo')).toHaveFocus();
  });

  it('focuses the panel when it has no fields', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('is described by its description only when there is one', () => {
    renderModal({ description: 'Explicação' });
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Explicação');
  });

  it('has no description and no body when they are not given', () => {
    renderModal();
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
    expect(document.querySelector('.modal__body')).toBeNull();
  });
});
