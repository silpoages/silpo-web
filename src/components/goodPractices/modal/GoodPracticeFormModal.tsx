import { useState, type FormEvent } from 'react';
import type { GoodPractice } from '../card/GoodPracticeCard';
import { Modal } from '../../modal/Modal';
import './formStyles.css';

export type GoodPracticeFormValues = Pick<GoodPractice, 'title' | 'description' | 'status'>;

interface GoodPracticeFormModalProps {
  practice?: GoodPractice;
  onClose: () => void;
  onSave: (values: GoodPracticeFormValues) => void;
}

export function GoodPracticeFormModal({ practice, onClose, onSave }: GoodPracticeFormModalProps) {
  const [title, setTitle] = useState(practice?.title ?? '');
  const [description, setDescription] = useState(practice?.description ?? '');
  const [status, setStatus] = useState<GoodPractice['status']>(practice?.status ?? 'draft');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ title: title.trim(), description: description.trim(), status });
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
          <button className="good-practice-modal__primary" type="submit" form="good-practice-form">
            {isEditing ? 'Salvar alterações' : 'Criar prática'}
          </button>
        </>
      }
    >
      <form className="good-practice-form" id="good-practice-form" onSubmit={handleSubmit}>
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
