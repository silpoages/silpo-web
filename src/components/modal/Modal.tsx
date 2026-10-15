import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import './styles.css';

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
}

export function Modal({ title, description, onClose, children, actions }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    dialog.showModal();
    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <dialog
      className="good-practice-modal"
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleDialogClick}
    >
      <div className="good-practice-modal__panel">
        <header className="good-practice-modal__header">
          <div>
            <h2 className="good-practice-modal__title" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="good-practice-modal__description" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <button
            className="good-practice-modal__close"
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div className="good-practice-modal__body">{children}</div>
        <footer className="good-practice-modal__footer">{actions}</footer>
      </div>
    </dialog>
  );
}
