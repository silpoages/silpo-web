import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Meditation } from '@/types/meditation';
import { MeditationFormModal } from './MeditationFormModal';

const meditation: Meditation = {
  id: '3',
  title: 'Ansiedade no peito',
  description: 'Guia para momentos em que a respiração fica curta e o corpo aperta.',
  durationSeconds: 510,
  audioUrl: 'https://example.com/ansiedade.mp3',
  enabled: true,
  createdAt: '2026-07-03T12:00:00Z',
};

function createFile(name: string, type: string, sizeInBytes = 1024) {
  const file = new File(['audio'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeInBytes });
  return file;
}

function selectFile(file: File) {
  fireEvent.change(screen.getByLabelText('Arquivo de áudio'), { target: { files: [file] } });
}

describe('MeditationFormModal', () => {
  it('validates required fields before creating', () => {
    const onSubmit = vi.fn();
    render(<MeditationFormModal onSubmit={onSubmit} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Nova meditação' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Duração'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar meditação' }));

    expect(screen.getByText('Informe o título.')).toBeInTheDocument();
    expect(screen.getByText('Informe a descrição.')).toBeInTheDocument();
    expect(screen.getByText('Informe a duração no formato mm:ss.')).toBeInTheDocument();
    expect(screen.getByText('Selecione o arquivo de áudio.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects audio files that are not MP3 or exceed 20 MB', () => {
    render(<MeditationFormModal onSubmit={vi.fn()} onClose={vi.fn()} />);

    selectFile(createFile('audio.wav', 'audio/wav'));
    expect(screen.getByText('Envie um arquivo no formato MP3.')).toBeInTheDocument();

    selectFile(createFile('longo.mp3', 'audio/mpeg', 21 * 1024 * 1024));
    expect(screen.getByText('O arquivo deve ter até 20 MB.')).toBeInTheDocument();
  });

  it('creates a meditation with the filled values', () => {
    const onSubmit = vi.fn();
    render(<MeditationFormModal onSubmit={onSubmit} onClose={vi.fn()} />);
    const audioFile = createFile('pausa.mp3', 'audio/mpeg');

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: ' Pausa curta ' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Para a tarde.' } });
    fireEvent.change(screen.getByLabelText('Duração'), { target: { value: '05:12' } });
    fireEvent.change(screen.getByLabelText('Visibilidade'), { target: { value: 'hidden' } });
    selectFile(audioFile);
    expect(screen.getByText('pausa.mp3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar meditação' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Pausa curta',
      description: 'Para a tarde.',
      durationSeconds: 312,
      enabled: false,
      audioFile,
    });
  });

  it('prefills the form when editing and keeps the current audio', () => {
    const onSubmit = vi.fn();
    render(<MeditationFormModal meditation={meditation} onSubmit={onSubmit} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Editar meditação' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Ansiedade no peito');
    expect(screen.getByLabelText('Duração')).toHaveValue('08:30');
    expect(screen.getByLabelText('Visibilidade')).toHaveValue('available');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: meditation.title,
      description: meditation.description,
      durationSeconds: 510,
      enabled: true,
      audioFile: null,
    });
  });
});
