import { useState } from 'react';
import { MeditationFormModal } from '@/components/meditations/MeditationFormModal';
import { MeditationsScreen } from '@/components/meditations/MeditationsScreen';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Meditation, MeditationFormValues } from '@/types/meditation';
import { MEDITATIONS_MOCK } from './meditationsMock';

type FormState = { mode: 'create' } | { mode: 'edit'; meditationId: string } | null;

export function Meditations() {
  const [meditations, setMeditations] = useState(MEDITATIONS_MOCK);
  const [formState, setFormState] = useState<FormState>(null);
  const [deletingMeditationId, setDeletingMeditationId] = useState<string | null>(null);

  const findMeditation = (id: string | null) =>
    meditations.find((meditation) => meditation.id === id);
  const editingMeditation =
    formState?.mode === 'edit' ? findMeditation(formState.meditationId) : undefined;
  const deletingMeditation = findMeditation(deletingMeditationId);

  function handleToggle(id: string, isEnabled: boolean) {
    setMeditations((currentMeditations) =>
      currentMeditations.map((meditation) =>
        meditation.id === id ? { ...meditation, enabled: isEnabled } : meditation,
      ),
    );
  }

  // Até a integração com a API, o áudio enviado só fica disponível nesta sessão do navegador.
  function handleFormSubmit({ audioFile, ...values }: MeditationFormValues) {
    const audioUrl = audioFile ? URL.createObjectURL(audioFile) : null;

    if (formState?.mode === 'edit') {
      const { meditationId } = formState;
      setMeditations((currentMeditations) =>
        currentMeditations.map((meditation) =>
          meditation.id === meditationId
            ? { ...meditation, ...values, audioUrl: audioUrl ?? meditation.audioUrl }
            : meditation,
        ),
      );
    } else {
      const newMeditation: Meditation = {
        ...values,
        id: crypto.randomUUID(),
        audioUrl,
        createdAt: new Date().toISOString(),
      };
      setMeditations((currentMeditations) => [newMeditation, ...currentMeditations]);
    }
    setFormState(null);
  }

  function handleConfirmDelete() {
    setMeditations((currentMeditations) =>
      currentMeditations.filter((meditation) => meditation.id !== deletingMeditationId),
    );
    setDeletingMeditationId(null);
  }

  return (
    <>
      <MeditationsScreen
        meditations={meditations}
        onToggle={handleToggle}
        onEdit={(id) => setFormState({ mode: 'edit', meditationId: id })}
        onDelete={setDeletingMeditationId}
        onCreate={() => setFormState({ mode: 'create' })}
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
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingMeditationId(null)}
        />
      )}
    </>
  );
}
