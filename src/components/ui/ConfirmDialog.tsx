import { Modal } from './Modal';
import './ui.css';

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  isConfirming = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      id="confirm-dialog"
      role="alertdialog"
      title={title}
      description={message}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="button button--secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="button button--danger"
            disabled={isConfirming}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {error && (
        <p className="confirm-dialog__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
}
