import { useEffect, useState } from 'react';
import { MeditationFormModal } from '@/components/meditations/MeditationFormModal';
import { MeditationsScreen } from '@/components/meditations/MeditationsScreen';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ApiError } from '@/services/api';
import {
  createMeditation,
  deleteMeditation,
  getMeditations,
  setMeditationEnabled,
  updateMeditation,
} from '@/services/meditations';
import type { Meditation, MeditationFormValues } from '@/types/meditation';

type FormState = { mode: 'create' } | { mode: 'edit'; meditationId: string } | null;

export function Meditations() {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deletingMeditationId, setDeletingMeditationId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    getMeditations()
      .then((items) => {
        if (!isCurrent) return;
        setMeditations(items);
        setIsLoading(false);
      })
      .catch((loadError: unknown) => {
        if (!isCurrent) return;
        if (loadError instanceof ApiError && loadError.status === 401) return;
        setError('Não foi possível carregar as meditações.');
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  const findMeditation = (id: string | null) =>
    meditations.find((meditation) => meditation.id === id);
  const editingMeditation =
    formState?.mode === 'edit' ? findMeditation(formState.meditationId) : undefined;
  const deletingMeditation = findMeditation(deletingMeditationId);

  async function handleToggle(id: string, isEnabled: boolean) {
    const previous = meditations;
    setNotice(null);
    setMeditations((current) =>
      current.map((meditation) =>
        meditation.id === id ? { ...meditation, enabled: isEnabled } : meditation,
      ),
    );
    try {
      const updated = await setMeditationEnabled(id, isEnabled);
      setMeditations((current) =>
        current.map((meditation) => (meditation.id === id ? updated : meditation)),
      );
    } catch {
      setMeditations(previous);
      setNotice('Não foi possível atualizar a visibilidade da meditação.');
    }
  }

  async function handleFormSubmit(values: MeditationFormValues) {
    if (formState?.mode === 'edit') {
      await updateMeditation(formState.meditationId, values);
    } else {
      await createMeditation(values);
    }
    setFormState(null);
    setNotice(null);
    setReloadKey((key) => key + 1);
  }

  async function handleConfirmDelete() {
    // Só é chamado pelo diálogo de confirmação, que só aparece com uma meditação selecionada.
    /* v8 ignore next */
    if (!deletingMeditationId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteMeditation(deletingMeditationId);
      setDeletingMeditationId(null);
      setReloadKey((key) => key + 1);
    } catch {
      setDeleteError('Não foi possível excluir a meditação.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <MeditationsScreen
        meditations={meditations}
        isLoading={isLoading}
        error={error}
        notice={notice}
        onToggle={(id, isEnabled) => void handleToggle(id, isEnabled)}
        onEdit={(id) => setFormState({ mode: 'edit', meditationId: id })}
        onDelete={setDeletingMeditationId}
        onCreate={() => setFormState({ mode: 'create' })}
        onRetry={() => setReloadKey((key) => key + 1)}
      />

      {formState && (
        <MeditationFormModal
          key={editingMeditation?.id ?? 'new'}
          meditation={editingMeditation}
          onSubmit={handleFormSubmit}
          onClose={() => setFormState(null)}
        />
      )}

      {deletingMeditation && (
        <ConfirmDialog
          title="Excluir meditação?"
          message={`"${deletingMeditation.title}" deixará de aparecer no aplicativo.`}
          confirmLabel="Excluir"
          isConfirming={isDeleting}
          error={deleteError}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => {
            if (isDeleting) return;
            setDeletingMeditationId(null);
            setDeleteError(null);
          }}
        />
      )}
    </>
  );
}
