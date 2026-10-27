import { useState, type FormEvent } from 'react';
import selectChevronIcon from '@/assets/icons/select-chevron.svg';
import { Modal } from '@/components/ui/Modal';
import type { DailyMessage, DailyMessageFormValues } from '@/types/dailyMessage';

export const DAILY_MESSAGE_MAX_LENGTH = 140;

type DailyMessageFormModalProps = {
  dailyMessage?: DailyMessage;
  onSubmit: (values: DailyMessageFormValues) => void;
  onClose: () => void;
};

export function DailyMessageFormModal({
  dailyMessage,
  onSubmit,
  onClose,
}: DailyMessageFormModalProps) {
  const isEditing = Boolean(dailyMessage);
  const [message, setMessage] = useState(dailyMessage?.message ?? '');
  const [isEnabled, setIsEnabled] = useState(dailyMessage?.enabled ?? true);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError('Informe o texto da mensagem.');
      return;
    }

    setError(null);
    onSubmit({ message: trimmedMessage, enabled: isEnabled });
  }

  return (
    <Modal
      id="daily-message-form"
      title={isEditing ? 'Editar mensagem' : 'Nova mensagem'}
      description="Mensagens ativas entram no rodízio diário exibido aos usuários."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="daily-message-form-fields" className="button button--primary">
            {isEditing ? 'Salvar alterações' : 'Criar mensagem'}
          </button>
        </>
      }
    >
      <form
        id="daily-message-form-fields"
        className="daily-message-form"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="daily-message-field">
          <label htmlFor="daily-message-form-message" className="daily-message-field__label">
            Mensagem
          </label>
          <textarea
            id="daily-message-form-message"
            className="daily-message-field__control daily-message-field__control--textarea"
            placeholder="Escreva uma mensagem breve e acolhedora."
            maxLength={DAILY_MESSAGE_MAX_LENGTH}
            value={message}
            aria-invalid={Boolean(error)}
            aria-describedby="daily-message-form-counter"
            onChange={(event) => setMessage(event.target.value)}
          />
          {error && <span className="daily-message-field__error">{error}</span>}
          <span id="daily-message-form-counter" className="daily-message-field__hint">
            {message.length}/{DAILY_MESSAGE_MAX_LENGTH} caracteres
          </span>
        </div>
        <label className="daily-message-field">
          <span className="daily-message-field__label">Status</span>
          <span className="daily-message-field__select">
            <select
              className="daily-message-field__control"
              value={isEnabled ? 'enabled' : 'disabled'}
              onChange={(event) => setIsEnabled(event.target.value === 'enabled')}
            >
              <option value="enabled">Ativa</option>
              <option value="disabled">Inativa</option>
            </select>
            <img src={selectChevronIcon} alt="" width={10} height={6} />
          </span>
        </label>
      </form>
    </Modal>
  );
}
