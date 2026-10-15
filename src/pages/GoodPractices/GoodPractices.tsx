import { useState } from 'react';
import Header from '@/components/goodPractices/header/Header';
import {
  GoodPracticeFormModal,
  type GoodPracticeFormValues,
} from '@/components/goodPractices/modal/GoodPracticeFormModal';
import { GoodPracticesList } from '@/components/goodPractices/list/GoodPracticesList';
import type { GoodPractice } from '@/components/goodPractices/card/GoodPracticeCard';
import { Modal } from '@/components/modal/Modal';
import { SideBar } from '@/components/goodPractices/SideBar';

const initialPractices: GoodPractice[] = [
  {
    id: 'gratitude',
    title: 'Pratique a gratidão',
    description: 'Reserve um momento para reconhecer algo bom que aconteceu hoje.',
    usageCount: 482,
    status: 'published',
  },
  {
    id: 'walk',
    title: 'Faça uma caminhada',
    description: 'Movimente o corpo e aproveite alguns minutos ao ar livre.',
    usageCount: 694,
    status: 'published',
  },
  {
    id: 'water',
    title: 'Beba água',
    description: 'Faça uma pausa para se hidratar e cuidar do seu corpo.',
    usageCount: 812,
    status: 'published',
  },
  {
    id: 'kindness',
    title: 'Faça um gesto gentil',
    description: 'Demonstre carinho ou ofereça ajuda a alguém próximo.',
    usageCount: 438,
    status: 'published',
  },
  {
    id: 'breathing',
    title: 'Respire com calma',
    description: 'Desacelere por alguns minutos com uma respiração consciente.',
    usageCount: 319,
    status: 'published',
  },
  {
    id: 'reading',
    title: 'Leia algo inspirador',
    description: 'Dedique alguns minutos a uma leitura que faça bem para você.',
    usageCount: 527,
    status: 'draft',
  },
];

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; practice: GoodPractice }
  | { type: 'delete'; practice: GoodPractice }
  | null;

export function GoodPractices() {
  const [practices, setPractices] = useState(initialPractices);
  const [modalState, setModalState] = useState<ModalState>(null);

  function handleSave(values: GoodPracticeFormValues) {
    if (!modalState || modalState.type === 'delete') {
      return;
    }

    if (modalState.type === 'edit') {
      setPractices((currentPractices) =>
        currentPractices.map((practice) =>
          practice.id === modalState.practice.id ? { ...practice, ...values } : practice,
        ),
      );
    } else {
      setPractices((currentPractices) => [
        {
          id: crypto.randomUUID(),
          ...values,
          usageCount: 0,
        },
        ...currentPractices,
      ]);
    }

    setModalState(null);
  }

  function handleDelete() {
    if (modalState?.type !== 'delete') {
      return;
    }

    setPractices((currentPractices) =>
      currentPractices.filter((practice) => practice.id !== modalState.practice.id),
    );
    setModalState(null);
  }

  return (
    <div style={styles.page}>
      <SideBar />
      <div style={styles.container}>
        <Header onAdd={() => setModalState({ type: 'create' })} />
        <GoodPracticesList
          practices={practices}
          onEdit={(practice) => setModalState({ type: 'edit', practice })}
          onDelete={(practice) => setModalState({ type: 'delete', practice })}
        />
      </div>
      {(modalState?.type === 'create' || modalState?.type === 'edit') && (
        <GoodPracticeFormModal
          key={modalState.type === 'edit' ? modalState.practice.id : 'create'}
          practice={modalState.type === 'edit' ? modalState.practice : undefined}
          onClose={() => setModalState(null)}
          onSave={handleSave}
        />
      )}
      {modalState?.type === 'delete' && (
        <Modal
          title="Excluir prática"
          description="Esta ação não pode ser desfeita."
          onClose={() => setModalState(null)}
          actions={
            <>
              <button type="button" onClick={() => setModalState(null)}>
                Cancelar
              </button>
              <button className="good-practice-modal__danger" type="button" onClick={handleDelete}>
                Excluir prática
              </button>
            </>
          }
        >
          <p>
            Tem certeza de que deseja excluir <strong>{modalState.practice.title}</strong>?
          </p>
        </Modal>
      )}
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
  },
  container: {
    flex: 1,
    minWidth: 0,
    padding: '40px',
  },
};
