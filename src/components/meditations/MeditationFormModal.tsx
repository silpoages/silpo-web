import { useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import selectChevronIcon from '@/assets/icons/select-chevron.svg';
import { Modal } from '@/components/ui/Modal';
import { formatDuration, parseDuration } from '@/lib/duration';
import type { Meditation, MeditationFormValues } from '@/types/meditation';

const MAX_AUDIO_SIZE_BYTES = 20 * 1024 * 1024;
const DEFAULT_DURATION = '05:00';

type MeditationFormModalProps = {
  meditation?: Meditation;
  onSubmit: (values: MeditationFormValues) => void;
  onClose: () => void;
};

type FormErrors = Partial<Record<'title' | 'description' | 'duration' | 'audio', string>>;

function isMp3(file: File) {
  return file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3');
}

function validateAudioFile(file: File): string | undefined {
  if (!isMp3(file)) return 'Envie um arquivo no formato MP3.';
  if (file.size > MAX_AUDIO_SIZE_BYTES) return 'O arquivo deve ter até 20 MB.';
  return undefined;
}

export function MeditationFormModal({ meditation, onSubmit, onClose }: MeditationFormModalProps) {
  const isEditing = Boolean(meditation);
  const [title, setTitle] = useState(meditation?.title ?? '');
  const [description, setDescription] = useState(meditation?.description ?? '');
  const [duration, setDuration] = useState(
    meditation ? formatDuration(meditation.durationSeconds) : DEFAULT_DURATION,
  );
  const [isEnabled, setIsEnabled] = useState(meditation?.enabled ?? true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function selectAudioFile(file: File | undefined) {
    if (!file) return;
    const audioError = validateAudioFile(file);
    setErrors((currentErrors) => ({ ...currentErrors, audio: audioError }));
    setAudioFile(audioError ? null : file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectAudioFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    selectAudioFile(event.dataTransfer.files[0]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const durationSeconds = parseDuration(duration);
    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = 'Informe o título.';
    if (!description.trim()) nextErrors.description = 'Informe a descrição.';
    if (!durationSeconds) nextErrors.duration = 'Informe a duração no formato mm:ss.';
    if (!isEditing && !audioFile) nextErrors.audio = 'Selecione o arquivo de áudio.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !durationSeconds) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      durationSeconds,
      enabled: isEnabled,
      audioFile,
    });
  }

  const dropzoneClassNames = ['meditation-dropzone'];
  if (isDragging) dropzoneClassNames.push('meditation-dropzone--dragging');
  if (errors.audio) dropzoneClassNames.push('meditation-dropzone--invalid');

  return (
    <Modal
      id="meditation-form"
      title={isEditing ? 'Editar meditação' : 'Nova meditação'}
      description="Áudios disponíveis dentro das práticas do aplicativo."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="meditation-form-fields" className="button button--primary">
            {isEditing ? 'Salvar alterações' : 'Criar meditação'}
          </button>
        </>
      }
    >
      <form
        id="meditation-form-fields"
        className="meditation-form"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="meditation-field meditation-form__full">
          <label htmlFor="meditation-field-title" className="meditation-field__label">
            Título
          </label>
          <input
            id="meditation-field-title"
            className="meditation-field__control"
            placeholder="Ex.: Respiração para dormir"
            maxLength={80}
            value={title}
            aria-invalid={Boolean(errors.title)}
            onChange={(event) => setTitle(event.target.value)}
          />
          {errors.title && <span className="meditation-field__error">{errors.title}</span>}
        </div>

        <div className="meditation-field meditation-form__full">
          <label htmlFor="meditation-field-description" className="meditation-field__label">
            Descrição
          </label>
          <textarea
            id="meditation-field-description"
            className="meditation-field__control meditation-field__control--textarea"
            placeholder="Quando e como usar este áudio."
            maxLength={300}
            value={description}
            aria-invalid={Boolean(errors.description)}
            onChange={(event) => setDescription(event.target.value)}
          />
          {errors.description && (
            <span className="meditation-field__error">{errors.description}</span>
          )}
        </div>

        <div className="meditation-field">
          <label htmlFor="meditation-field-duration" className="meditation-field__label">
            Duração
          </label>
          <input
            id="meditation-field-duration"
            className="meditation-field__control"
            inputMode="numeric"
            placeholder="05:00"
            value={duration}
            aria-invalid={Boolean(errors.duration)}
            aria-describedby="meditation-field-duration-hint"
            onChange={(event) => setDuration(event.target.value)}
          />
          {errors.duration ? (
            <span className="meditation-field__error">{errors.duration}</span>
          ) : (
            <span id="meditation-field-duration-hint" className="meditation-field__hint">
              Formato mm:ss
            </span>
          )}
        </div>

        <div className="meditation-field">
          <label htmlFor="meditation-field-visibility" className="meditation-field__label">
            Visibilidade
          </label>
          <span className="meditation-field__select">
            <select
              id="meditation-field-visibility"
              className="meditation-field__control"
              value={isEnabled ? 'available' : 'hidden'}
              onChange={(event) => setIsEnabled(event.target.value === 'available')}
            >
              <option value="available">Disponível</option>
              <option value="hidden">Oculta</option>
            </select>
            <img src={selectChevronIcon} alt="" width={10} height={6} />
          </span>
        </div>

        <div className="meditation-field meditation-form__full">
          <span className="meditation-field__label" id="meditation-field-audio-label">
            Arquivo de áudio
          </span>
          <label
            className={dropzoneClassNames.join(' ')}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="audio/mpeg,.mp3"
              className="visually-hidden"
              aria-labelledby="meditation-field-audio-label"
              onChange={handleFileChange}
            />
            {audioFile ? (
              <>
                <span className="meditation-dropzone__file">{audioFile.name}</span>
                {' · '}
                <span className="meditation-dropzone__link">trocar arquivo</span>
              </>
            ) : (
              <>
                Arraste um arquivo MP3 ou{' '}
                <span className="meditation-dropzone__link">selecione</span> (até 20 MB)
              </>
            )}
          </label>
          {errors.audio ? (
            <span className="meditation-field__error">{errors.audio}</span>
          ) : (
            isEditing &&
            !audioFile && (
              <span className="meditation-field__hint">
                Sem novo arquivo, o áudio atual é mantido.
              </span>
            )
          )}
        </div>
      </form>
    </Modal>
  );
}
