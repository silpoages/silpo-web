import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import closeIcon from '@/assets/icons/close.svg';
import './ui.css';

type ModalProps = {
  id: string;
  title: string;
  description?: string;
  role?: 'dialog' | 'alertdialog';
  footer: ReactNode;
  children?: ReactNode;
  onClose: () => void;
};

export function Modal({
  id,
  title,
  description,
  role = 'dialog',
  footer,
  children,
  onClose,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  useEffect(() => {
    const firstField = panelRef.current?.querySelector<HTMLElement>('input, select, textarea');
    (firstField ?? panelRef.current)?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  }

  function handleOverlayMouseDown(event: MouseEvent) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown} onKeyDown={handleKeyDown}>
      <div
        ref={panelRef}
        className="modal"
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="modal__header">
          <div>
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="modal__description">
                {description}
              </p>
            )}
          </div>
          <button type="button" className="modal__close" aria-label="Fechar" onClick={onClose}>
            <img src={closeIcon} alt="" width={16} height={16} />
          </button>
        </header>
        {children && <div className="modal__body">{children}</div>}
        <footer className="modal__footer">{footer}</footer>
      </div>
    </div>
  );
}
