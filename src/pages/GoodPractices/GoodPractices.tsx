import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/goodPractices/header/Header';
import {
  GoodPracticeFormModal,
  type GoodPracticeFormValues,
} from '@/components/goodPractices/modal/GoodPracticeFormModal';
import { GoodPracticesList } from '@/components/goodPractices/list/GoodPracticesList';
import type { GoodPractice } from '@/components/goodPractices/card/GoodPracticeCard';
import { Modal } from '@/components/modal/Modal';
import { ApiError } from '@/services/api';
import {
  createGoodPractice,
  deleteGoodPractice,
  getGoodPractices,
  updateGoodPractice,
} from '@/services/goodPractices';

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; practice: GoodPractice }
  | { type: 'delete'; practice: GoodPractice }
  | null;

export function GoodPractices() {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<GoodPractice[]>([]);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem('silpo.accessToken');
    navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let isCurrent = true;

    getGoodPractices()
      .then((loadedPractices) => {
        if (isCurrent) {
          setPractices(loadedPractices);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          if (isUnauthorized(error)) {
            handleUnauthorized();
            return;
          }
          setLoadError(getErrorMessage(error, 'Não foi possível carregar as práticas.'));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [handleUnauthorized, reloadKey]);

  async function handleSave(values: GoodPracticeFormValues) {
    if (!modalState || modalState.type === 'delete') {
      return;
    }

    setIsSaving(true);
    setMutationError(null);
    setFeedback('');
    try {
      if (modalState.type === 'edit') {
        const updatedPractice = await updateGoodPractice(modalState.practice.id, values);
        setPractices((currentPractices) =>
          currentPractices.map((practice) =>
            practice.id === updatedPractice.id ? updatedPractice : practice,
          ),
        );
        setFeedback('Prática atualizada com sucesso.');
      } else {
        const createdPractice = await createGoodPractice(values);
        setPractices((currentPractices) => [createdPractice, ...currentPractices]);
        setFeedback('Prática criada com sucesso.');
      }
      setModalState(null);
    } catch (error: unknown) {
      if (isUnauthorized(error)) {
        handleUnauthorized();
        return;
      }
      setMutationError(getErrorMessage(error, 'Não foi possível salvar a prática.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (modalState?.type !== 'delete') {
      return;
    }

    setIsSaving(true);
    setMutationError(null);
    setFeedback('');
    try {
      await deleteGoodPractice(modalState.practice.id);
      setPractices((currentPractices) =>
        currentPractices.filter((practice) => practice.id !== modalState.practice.id),
      );
      setFeedback('Prática excluída com sucesso.');
      setModalState(null);
    } catch (error: unknown) {
      if (isUnauthorized(error)) {
        handleUnauthorized();
        return;
      }
      setMutationError(getErrorMessage(error, 'Não foi possível excluir a prática.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Header
        onAdd={() => {
          setMutationError(null);
          setModalState({ type: 'create' });
        }}
      />
      {feedback && (
        <p className="good-practices__feedback" role="status">
          {feedback}
        </p>
      )}
      {isLoading ? (
        <p className="good-practices__feedback" role="status">
          Carregando práticas…
        </p>
      ) : loadError ? (
        <div className="good-practices__feedback" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setLoadError(null);
              setReloadKey((current) => current + 1);
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <GoodPracticesList
          practices={practices}
          onEdit={(practice) => {
            setMutationError(null);
            setModalState({ type: 'edit', practice });
          }}
          onDelete={(practice) => {
            setMutationError(null);
            setModalState({ type: 'delete', practice });
          }}
        />
      )}
      {(modalState?.type === 'create' || modalState?.type === 'edit') && (
        <GoodPracticeFormModal
          key={modalState.type === 'edit' ? modalState.practice.id : 'create'}
          practice={modalState.type === 'edit' ? modalState.practice : undefined}
          isSaving={isSaving}
          error={mutationError}
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
              <button type="button" disabled={isSaving} onClick={() => setModalState(null)}>
                Cancelar
              </button>
              <button
                className="good-practice-modal__danger"
                type="button"
                disabled={isSaving}
                onClick={handleDelete}
              >
                {isSaving ? 'Excluindo…' : 'Excluir prática'}
              </button>
            </>
          }
        >
          {mutationError && (
            <p className="good-practice-form__error" role="alert">
              {mutationError}
            </p>
          )}
          <p>
            Tem certeza de que deseja excluir <strong>{modalState.practice.title}</strong>?
          </p>
        </Modal>
      )}
    </>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Você não tem permissão para gerenciar práticas do bem.';
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
