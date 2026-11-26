import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GoodPractice } from '@/components/goodPractices/card/GoodPracticeCard';
import { GoodPracticeCard } from '@/components/goodPractices/card/GoodPracticeCard';
import Header from '@/components/goodPractices/header/Header';
import { ApiError } from '@/services/api';
import {
  createGoodPractice,
  deleteGoodPractice,
  getGoodPractices,
  updateGoodPractice,
} from '@/services/goodPractices';
import { GoodPractices } from './GoodPractices';

vi.mock('@/services/goodPractices', () => ({
  getGoodPractices: vi.fn(),
  createGoodPractice: vi.fn(),
  updateGoodPractice: vi.fn(),
  deleteGoodPractice: vi.fn(),
}));

const walk: GoodPractice = {
  id: '1',
  title: 'Caminhada de dez minutos',
  description: 'Sair para andar sem o celular.',
  status: 'published',
};

const call: GoodPractice = {
  id: '2',
  title: 'Ligar para alguém',
  description: 'Uma conversa curta com quem você gosta.',
  status: 'draft',
};

async function renderLoaded() {
  render(<GoodPractices />);
  await screen.findByText(walk.title);
}

function fillForm(title: string, description: string, status?: 'draft' | 'published') {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: title } });
  fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: description } });
  if (status) fireEvent.change(screen.getByLabelText('Status'), { target: { value: status } });
}

describe('GoodPractices', () => {
  beforeEach(() => {
    vi.mocked(getGoodPractices).mockReset().mockResolvedValue([walk, call]);
    vi.mocked(createGoodPractice).mockReset();
    vi.mocked(updateGoodPractice).mockReset();
    vi.mocked(deleteGoodPractice).mockReset();
  });

  it('shows the loading state and then the practices with their status', async () => {
    render(<GoodPractices />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando práticas');
    const card = (await screen.findByText(walk.title)).closest('article');
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText('Publicada')).toBeInTheDocument();
    expect(screen.getByText('Rascunho')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows the empty state when there are no practices', async () => {
    vi.mocked(getGoodPractices).mockResolvedValue([]);

    render(<GoodPractices />);

    expect(await screen.findByText('Nenhuma prática encontrada.')).toBeInTheDocument();
  });

  it('filters by name and by status', async () => {
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Rascunhos' }));
    expect(screen.queryByText(walk.title)).toBeNull();
    expect(screen.getByText(call.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rascunhos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Publicadas' }));
    expect(screen.getByText(walk.title)).toBeInTheDocument();
    expect(screen.queryByText(call.title)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    fireEvent.change(screen.getByLabelText('Buscar prática pelo nome'), {
      target: { value: '  CAMINHADA ' },
    });
    expect(screen.getByText(walk.title)).toBeInTheDocument();
    expect(screen.queryByText(call.title)).toBeNull();

    fireEvent.change(screen.getByLabelText('Buscar prática pelo nome'), {
      target: { value: 'meditar' },
    });
    expect(screen.getByText('Nenhuma prática encontrada.')).toBeInTheDocument();
  });

  it('shows the load error and retries', async () => {
    vi.mocked(getGoodPractices).mockRejectedValueOnce(new Error('offline'));

    render(<GoodPractices />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Não foi possível carregar as práticas.');

    fireEvent.click(within(alert).getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText(walk.title)).toBeInTheDocument();
    expect(getGoodPractices).toHaveBeenCalledTimes(2);
  });

  it('explains a 403 and shows the API message for other API errors', async () => {
    vi.mocked(getGoodPractices).mockRejectedValueOnce(new ApiError(403, 'Forbidden'));
    const { unmount } = render(<GoodPractices />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você não tem permissão para gerenciar práticas do bem.',
    );
    unmount();

    vi.mocked(getGoodPractices).mockRejectedValueOnce(new ApiError(500, 'Banco indisponível'));
    render(<GoodPractices />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Banco indisponível');
  });

  it('shows no error on 401, because the session handler takes over', async () => {
    vi.mocked(getGoodPractices).mockRejectedValueOnce(new ApiError(401, 'expired'));

    render(<GoodPractices />);

    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('ignores a response that arrives after the page is closed', async () => {
    let resolve: (practices: GoodPractice[]) => void = () => {};
    vi.mocked(getGoodPractices).mockReturnValue(
      new Promise((resolvePromise) => {
        resolve = resolvePromise;
      }),
    );
    const { unmount } = render(<GoodPractices />);

    unmount();
    resolve([walk]);
    await Promise.resolve();

    expect(screen.queryByText(walk.title)).toBeNull();
  });

  it('ignores a failure that arrives after the page is closed', async () => {
    let reject: (error: unknown) => void = () => {};
    vi.mocked(getGoodPractices).mockReturnValue(
      new Promise((_, rejectPromise) => {
        reject = rejectPromise;
      }),
    );
    const { unmount } = render(<GoodPractices />);

    unmount();
    reject(new Error('offline'));
    await Promise.resolve();

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('validates the form before creating', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    const dialog = screen.getByRole('dialog', { name: 'Nova prática' });

    fillForm('   ', 'Descrição');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar prática' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Informe o título da prática.');

    fillForm('Título', '   ');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar prática' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Informe a descrição da prática.');

    expect(createGoodPractice).not.toHaveBeenCalled();
  });

  it('creates a practice, puts it first and confirms', async () => {
    const created: GoodPractice = {
      id: '3',
      title: 'Beber água',
      description: 'Um copo agora.',
      status: 'published',
    };
    vi.mocked(createGoodPractice).mockResolvedValue(created);
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByLabelText('Status')).toHaveValue('draft');
    fillForm('  Beber água ', ' Um copo agora. ', 'published');
    fireEvent.click(screen.getByRole('button', { name: 'Criar prática' }));

    expect(await screen.findByText('Prática criada com sucesso.')).toBeInTheDocument();
    expect(createGoodPractice).toHaveBeenCalledWith({
      title: 'Beber água',
      description: 'Um copo agora.',
      status: 'published',
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    const titles = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(['Beber água', walk.title, call.title]);
  });

  it('edits a practice in place', async () => {
    vi.mocked(updateGoodPractice).mockResolvedValue({ ...call, status: 'published' });
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: `Editar ${call.title}` }));
    const dialog = screen.getByRole('dialog', { name: 'Editar prática' });
    expect(screen.getByLabelText('Título')).toHaveValue(call.title);
    expect(screen.getByLabelText('Status')).toHaveValue('draft');
    fillForm(call.title, call.description, 'published');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Prática atualizada com sucesso.')).toBeInTheDocument();
    expect(updateGoodPractice).toHaveBeenCalledWith('2', {
      title: call.title,
      description: call.description,
      status: 'published',
    });
    expect(screen.queryByText('Rascunho')).toBeNull();
  });

  it('keeps the form open with the error when saving fails', async () => {
    let rejectSave: (error: unknown) => void = () => {};
    vi.mocked(createGoodPractice).mockReturnValue(
      new Promise((_, reject) => {
        rejectSave = reject;
      }),
    );
    await renderLoaded();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    fillForm('Beber água', 'Um copo agora.');
    fireEvent.click(screen.getByRole('button', { name: 'Criar prática' }));

    expect(await screen.findByRole('button', { name: 'Salvando…' })).toBeDisabled();
    rejectSave(new Error('offline'));

    const dialog = screen.getByRole('dialog', { name: 'Nova prática' });
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar a prática.',
    );
    expect(within(dialog).getByRole('button', { name: 'Criar prática' })).toBeEnabled();
  });

  it('keeps the form open without an error message on 401', async () => {
    vi.mocked(updateGoodPractice).mockRejectedValue(new ApiError(401, 'expired'));
    await renderLoaded();
    fireEvent.click(screen.getByRole('button', { name: `Editar ${walk.title}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled(),
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('closes the form on cancel without saving', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(createGoodPractice).not.toHaveBeenCalled();
  });

  it('only deletes after confirmation', async () => {
    vi.mocked(deleteGoodPractice).mockResolvedValue(undefined);
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: `Excluir ${walk.title}` }));
    const dialog = screen.getByRole('alertdialog', { name: 'Excluir prática' });
    expect(dialog).toHaveTextContent(`Tem certeza de que deseja excluir ${walk.title}?`);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(deleteGoodPractice).not.toHaveBeenCalled();
    expect(screen.getByText(walk.title)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: `Excluir ${walk.title}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir prática' }));

    expect(await screen.findByText('Prática excluída com sucesso.')).toBeInTheDocument();
    expect(deleteGoodPractice).toHaveBeenCalledWith('1');
    expect(screen.queryByText(walk.title)).toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('keeps the confirmation open with the error when deleting fails', async () => {
    let rejectDelete: (error: unknown) => void = () => {};
    vi.mocked(deleteGoodPractice).mockReturnValue(
      new Promise((_, reject) => {
        rejectDelete = reject;
      }),
    );
    await renderLoaded();
    fireEvent.click(screen.getByRole('button', { name: `Excluir ${walk.title}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir prática' }));

    expect(await screen.findByRole('button', { name: 'Excluindo…' })).toBeDisabled();
    rejectDelete(new ApiError(403, 'Forbidden'));

    const dialog = screen.getByRole('alertdialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Você não tem permissão para gerenciar práticas do bem.',
    );
    expect(screen.getByRole('heading', { name: walk.title })).toBeInTheDocument();
  });

  it('keeps the confirmation open without an error message on 401', async () => {
    vi.mocked(deleteGoodPractice).mockRejectedValue(new ApiError(401, 'expired'));
    await renderLoaded();
    fireEvent.click(screen.getByRole('button', { name: `Excluir ${walk.title}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir prática' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Excluir prática' })).toBeEnabled(),
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('GoodPractices delete dialog', () => {
  beforeEach(() => {
    vi.mocked(getGoodPractices).mockReset().mockResolvedValue([walk, call]);
    vi.mocked(deleteGoodPractice).mockReset();
  });

  it('closes on the close button without deleting', async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole('button', { name: `Excluir ${walk.title}` }));

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(deleteGoodPractice).not.toHaveBeenCalled();
  });

  it('can turn a published practice back into a draft', async () => {
    vi.mocked(updateGoodPractice).mockResolvedValue({ ...walk, status: 'draft' });
    await renderLoaded();

    fireEvent.click(screen.getByRole('button', { name: `Editar ${walk.title}` }));
    expect(screen.getByLabelText('Status')).toHaveValue('published');
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await screen.findByText('Prática atualizada com sucesso.');
    expect(updateGoodPractice).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ status: 'draft' }),
    );
  });
});

describe('GoodPracticeCard', () => {
  it('shows the usage count when it is known', () => {
    const { rerender } = render(
      <GoodPracticeCard
        practice={{ ...walk, usageCount: 3 }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('3 usos')).toBeInTheDocument();

    rerender(<GoodPracticeCard practice={walk} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/usos/)).toBeNull();
  });
});

describe('GoodPractices Header', () => {
  it('can show the add button as unavailable', () => {
    const onAdd = vi.fn();
    render(<Header onAdd={onAdd} addDisabled />);

    const button = screen.getByRole('button', { name: 'Adicionar (em breve)' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      'title',
      'O cadastro estará disponível quando o endpoint for liberado.',
    );
  });
});
