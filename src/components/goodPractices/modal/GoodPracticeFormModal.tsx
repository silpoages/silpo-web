import { useState, type FormEvent } from 'react';
import type { GoodPractice } from '../card/GoodPracticeCard';
import { Modal } from '../../modal/Modal';
import './formStyles.css';

export type GoodPracticeFormValues = Pick<GoodPractice, 'title' | 'description' | 'status'>;

interface GoodPracticeFormModalProps {
  practice?: GoodPractice;
  isSaving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (values: GoodPracticeFormValues) => void | Promise<void>;
}

export function GoodPracticeFormModal({
  practice,
  isSaving = false,
  error,
  onClose,
  onSave,
}: GoodPracticeFormModalProps) {
  const [title, setTitle] = useState(practice?.title ?? '');
  const [description, setDescription] = useState(practice?.description ?? '');
  const [status, setStatus] = useState<GoodPractice['status']>(practice?.status ?? 'draft');
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle || !trimmedDescription) {
      setValidationError(
        !trimmedTitle ? 'Informe o título da prática.' : 'Informe a descrição da prática.',
      );
      return;
    }
    setValidationError(null);
    await onSave({ title: trimmedTitle, description: trimmedDescription, status });
  }

  const isEditing = Boolean(practice);

  return (
    <Modal
      title={isEditing ? 'Editar prática' : 'Nova prática'}
      description="O conteúdo publicado aparece na seleção do usuário no aplicativo."
      onClose={onClose}
      actions={
        <>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="good-practice-modal__primary"
            type="submit"
            form="good-practice-form"
            disabled={isSaving}
          >
            {isSaving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar prática'}
          </button>
        </>
      }
    >
      <form className="good-practice-form" id="good-practice-form" onSubmit={handleSubmit}>
        {(validationError || error) && (
          <p className="good-practice-form__error" role="alert">
            {validationError || error}
          </p>
        )}
        <label className="good-practice-form__field">
          <span>Título</span>
          <input
            autoFocus
            required
            maxLength={80}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Caminhada de dez minutos"
          />
        </label>
        <label className="good-practice-form__field">
          <span>Descrição</span>
          <textarea
            required
            maxLength={300}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descreva como a prática funciona."
          />
        </label>
        <label className="good-practice-form__field">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value === 'published' ? 'published' : 'draft')
            }
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicada</option>
          </select>
        </label>
      </form>
    </Modal>
  );
}
