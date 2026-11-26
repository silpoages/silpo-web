import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import {
  createMeditation,
  deleteMeditation,
  getMeditations,
  setMeditationEnabled,
  updateMeditation,
} from '@/services/meditations';
import type { Meditation } from '@/types/meditation';
import { Meditations } from './Meditations';

vi.mock('@/services/meditations', () => ({
  getMeditations: vi.fn(),
  createMeditation: vi.fn(),
  updateMeditation: vi.fn(),
  setMeditationEnabled: vi.fn(),
  deleteMeditation: vi.fn(),
}));

const sleep: Meditation = {
  id: '1',
  title: 'Respiração para dormir',
  description: 'Doze minutos de respiração lenta.',
  durationSeconds: 724,
  audioUrl: 'https://api.example.com/media/meditations/a.mp3',
  enabled: true,
  createdAt: '',
};
const pause: Meditation = {
  ...sleep,
  id: '2',
  title: 'Pausa de cinco minutos',
  durationSeconds: 312,
  enabled: false,
};

async function renderLoaded() {
  render(<Meditations />);
  await screen.findByRole('heading', { name: sleep.title });
}

function fillAndSubmit(label: 'Criar meditação' | 'Salvar alterações') {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Respirar no ônibus' } });
  fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Três minutos.' } });
  fireEvent.change(screen.getByLabelText('Duração'), { target: { value: '03:00' } });
  if (label === 'Criar meditação') {
    fireEvent.change(screen.getByLabelText('Arquivo de áudio'), {
      target: { files: [new File(['mp3'], 'onibus.mp3', { type: 'audio/mpeg' })] },
    });
  }
  fireEvent.click(screen.getByRole('button', { name: label }));
}

describe('Meditations', () => {
  beforeEach(() => {
    vi.mocked(getMeditations).mockReset().mockResolvedValue([sleep, pause]);
    vi.mocked(createMeditation).mockReset();
    vi.mocked(updateMeditation).mockReset();
    vi.mocked(setMeditationEnabled).mockReset();
    vi.mocked(deleteMeditation).mockReset();
  });

  it('shows the loading state and then the meditations', async () => {
    render(<Meditations />);

    expect(screen.getByText('Carregando meditações…')).toBeInTheDocument();
    expect(await screen.findAllByRole('article')).toHaveLength(2);
  });

  it('shows the empty state', async () => {
    vi.mocked(getMeditations).mockResolvedValue([]);
    render(<Meditations />);

    expect(await screen.findByText('Nenhuma meditação cadastrada.')).toBeInTheDocument();
  });

  it('shows the error state and retries', async () => {
    vi.mocked(getMeditations).mockRejectedValueOnce(new ApiError(500, 'Erro'));
    render(<Meditations />);

    expect(await screen.findByText('Não foi possível carregar as meditações.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: sleep.title })).toBeInTheDocument();
    expect(getMeditations).toHaveBeenCalledTimes(2);
  });

  it('stays quiet on 401 while the session handler takes over', async () => {
    vi.mocked(getMeditations).mockRejectedValueOnce(new ApiError(401, 'expired'));
    render(<Meditations />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByText('Não foi possível carregar as meditações.')).toBeNull();
  });

  it('ignores responses that arrive after the page is closed', async () => {
    let resolve: (value: Meditation[]) => void = () => {};
    let reject: (error: unknown) => void = () => {};
    vi.mocked(getMeditations)
      .mockReturnValueOnce(new Promise((resolvePromise) => (resolve = resolvePromise)))
      .mockReturnValueOnce(new Promise((_, rejectPromise) => (reject = rejectPromise)));

    render(<Meditations />).unmount();
    render(<Meditations />).unmount();
    resolve([sleep]);
    reject(new Error('offline'));
    await new Promise((resolveTick) => setTimeout(resolveTick, 0));

    expect(screen.queryByRole('heading', { name: sleep.title })).toBeNull();
  });

  it('changes the visibility right away and keeps what the API returns', async () => {
    vi.mocked(setMeditationEnabled).mockResolvedValue({ ...pause, enabled: true });
    await renderLoaded();
    const toggle = screen.getByRole('switch', { name: `${pause.title} no aplicativo` });

    fireEvent.click(toggle);

    expect(toggle).toBeChecked();
    expect(setMeditationEnabled).toHaveBeenCalledWith('2', true);
    await waitFor(() =>
      expect(
        within(toggle.closest('article') as HTMLElement).getByText('Disponível'),
      ).toBeInTheDocument(),
    );
  });

  it('undoes the visibility change and explains when the API fails', async () => {
    vi.mocked(setMeditationEnabled).mockRejectedValue(new ApiError(500, 'Erro'));
    await renderLoaded();
    const toggle = screen.getByRole('switch', { name: `${sleep.title} no aplicativo` });

    fireEvent.click(toggle);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível atualizar a visibilidade da meditação.',
    );
    expect(toggle).toBeChecked();
  });

  it('creates a meditation and reloads the list', async () => {
    vi.mocked(createMeditation).mockResolvedValue({ ...sleep, id: '3' });
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Nova meditação' }));
    fillAndSubmit('Criar meditação');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(createMeditation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Respirar no ônibus',
        durationSeconds: 180,
        audioFile: expect.any(File),
      }),
    );
    expect(getMeditations).toHaveBeenCalledTimes(2);
  });

  it('edits a meditation and reloads the list', async () => {
    vi.mocked(updateMeditation).mockResolvedValue(sleep);
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: `Editar meditação: ${sleep.title}` }));
    expect(screen.getByLabelText('Título')).toHaveValue(sleep.title);
    fillAndSubmit('Salvar alterações');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(updateMeditation).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ title: 'Respirar no ônibus', audioFile: null }),
    );
    expect(getMeditations).toHaveBeenCalledTimes(2);
  });

  it.each([
    [
      new ApiError(415, 'Audio file content is not a valid MP3'),
      'Audio file content is not a valid MP3',
    ],
    [new TypeError('Failed to fetch'), 'Não foi possível salvar a meditação.'],
  ])('keeps the form open with the error when saving fails (%s)', async (error, message) => {
    vi.mocked(createMeditation).mockRejectedValue(error);
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Nova meditação' }));
    fillAndSubmit('Criar meditação');

    const dialog = screen.getByRole('dialog', { name: 'Nova meditação' });
    expect(await within(dialog).findByText(message)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Criar meditação' })).toBeEnabled();
  });

  it('closes the form without saving', async () => {
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Nova meditação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('only deletes after confirmation and reloads the list', async () => {
    vi.mocked(deleteMeditation).mockResolvedValue(undefined);
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: `Excluir meditação: ${sleep.title}` }));
    const dialog = screen.getByRole('alertdialog', { name: 'Excluir meditação?' });
    expect(dialog).toHaveTextContent(`"${sleep.title}" deixará de aparecer no aplicativo.`);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(deleteMeditation).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: `Excluir meditação: ${sleep.title}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(deleteMeditation).toHaveBeenCalledWith('1');
    expect(getMeditations).toHaveBeenCalledTimes(2);
  });

  it('keeps the confirmation open while deleting and shows the error when it fails', async () => {
    let rejectDelete: (error: unknown) => void = () => {};
    vi.mocked(deleteMeditation).mockReturnValue(
      new Promise((_, reject) => {
        rejectDelete = reject;
      }),
    );
    await renderLoaded();
    fireEvent.click(screen.getByRole('button', { name: `Excluir meditação: ${sleep.title}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByRole('button', { name: 'Excluir' })).toBeDisabled();
    // Enquanto exclui, cancelar não fecha o diálogo.
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    rejectDelete(new ApiError(500, 'Erro'));

    const dialog = screen.getByRole('alertdialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Não foi possível excluir a meditação.',
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
