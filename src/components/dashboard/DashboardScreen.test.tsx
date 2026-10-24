import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DashboardData } from '@/types/dashboard';
import { DashboardScreen } from './DashboardScreen';

const data: DashboardData = {
  totalUsers: 1284,
  activePremiumUsers: 100,
  dailyMoods: [
    { date: '2026-08-19', counts: { FELIZ: 2, TRISTE: 1 } },
    { date: '2026-08-20', counts: { FELIZ: 4, BEM: 3 } },
  ],
  moodDistribution: [
    { mood: 'FELIZ', count: 6 },
    { mood: 'BEM', count: 3 },
    { mood: 'TRISTE', count: 1 },
  ],
  topActivities: [
    { id: 'meditation', name: 'Meditação', executions: 1 },
    { id: 'breathing', name: 'Respiração guiada', executions: 1250 },
  ],
  ageDistribution: [
    { label: '18–24', count: 30 },
    { label: '25–34', count: 70 },
  ],
  genderDistribution: [
    { label: 'Feminino', count: 3 },
    { label: 'Masculino', count: 1 },
  ],
};

function renderScreen(props: Partial<Parameters<typeof DashboardScreen>[0]> = {}) {
  const handlers = { onPeriodChange: vi.fn(), onRetry: vi.fn() };
  const view = render(<DashboardScreen period={30} data={data} {...handlers} {...props} />);
  return { ...handlers, ...view };
}

describe('DashboardScreen', () => {
  it('shows a subtitle that follows the selected period', () => {
    const { rerender, onPeriodChange } = renderScreen();

    expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText('Como o SILPO está sendo usado nos últimos 30 dias.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Período')).toHaveValue('30');

    rerender(<DashboardScreen period={7} data={data} onPeriodChange={onPeriodChange} />);

    expect(
      screen.getByText('Como o SILPO está sendo usado nos últimos 7 dias.'),
    ).toBeInTheDocument();
  });

  it('notifies the selected period', () => {
    const { onPeriodChange } = renderScreen();

    fireEvent.change(screen.getByLabelText('Período'), { target: { value: '90' } });

    expect(onPeriodChange).toHaveBeenCalledWith(90);
  });

  it('formats numbers in pt-BR and handles singular and plural', () => {
    const { rerender, onPeriodChange } = renderScreen();

    expect(screen.getByText('1.284')).toBeInTheDocument();
    expect(screen.getByText('ativos este mês')).toBeInTheDocument();
    expect(screen.getByText('10 registros')).toBeInTheDocument();
    expect(screen.getByText('1.250 execuções')).toBeInTheDocument();
    expect(screen.getByText('1 execução')).toBeInTheDocument();

    rerender(
      <DashboardScreen
        period={30}
        data={{ ...data, activePremiumUsers: 1, moodDistribution: [{ mood: 'BEM', count: 1 }] }}
        onPeriodChange={onPeriodChange}
      />,
    );

    expect(screen.getByText('ativo este mês')).toBeInTheDocument();
    expect(screen.getByText('1 registro')).toBeInTheDocument();
  });

  it('lists every Mood with bars proportional to the largest value', () => {
    renderScreen();

    const list = screen.getByRole('list', { name: 'Distribuição das emoções registradas' });
    const rows = within(list).getAllByRole('listitem');

    expect(rows.map((row) => row.querySelector('.mood-row__label')?.textContent)).toEqual([
      'Feliz',
      'Bem',
      'Cansado',
      'Triste',
      'Ansioso',
      'Irritado',
    ]);
    expect(within(rows[0]).getByText('60%')).toBeInTheDocument();
    expect(within(rows[1]).getByText('30%')).toBeInTheDocument();
    expect(rows[0].querySelector('.mood-row__bar')).toHaveStyle({ width: '100%' });
    expect(rows[1].querySelector('.mood-row__bar')).toHaveStyle({ width: '50%' });
    expect(rows[2].querySelector('.mood-row__bar')).toHaveStyle({ width: '0%' });
  });

  it('ranks activities by number of executions', () => {
    renderScreen();

    const ranking = screen.getByRole('heading', { name: 'Atividades mais realizadas' })
      .parentElement?.parentElement as HTMLElement;
    const items = within(ranking).getAllByRole('listitem');

    expect(items[0]).toHaveTextContent('Respiração guiada');
    expect(items[1]).toHaveTextContent('Meditação');
  });

  it('describes the charts for assistive technologies', () => {
    renderScreen();

    expect(
      screen.getByRole('img', { name: /emoções registradas por dia, de 19 ago a 20 ago/i }),
    ).toHaveAccessibleName(/o dia com mais registros foi 20 ago, com 7 registros/i);
    expect(
      screen.getByRole('img', { name: /faixa etária: 18–24, 30%; 25–34, 70%/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /gênero: feminino, 75%; masculino, 25%/i }),
    ).toBeInTheDocument();
  });

  it('shows the loading state', () => {
    renderScreen({ isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados do dashboard');
    expect(screen.queryByText('Emoções registradas')).not.toBeInTheDocument();
  });

  it('shows the error state with retry', () => {
    const { onRetry } = renderScreen({ error: 'Não foi possível carregar o dashboard.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o dashboard.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows empty states when there is no data', () => {
    const { rerender, onPeriodChange } = renderScreen({ data: null });

    expect(
      screen.getByText('Nenhum dado disponível para o período selecionado.'),
    ).toBeInTheDocument();

    rerender(
      <DashboardScreen
        period={30}
        data={{
          ...data,
          dailyMoods: [],
          moodDistribution: [],
          topActivities: [],
          ageDistribution: [],
          genderDistribution: [],
        }}
        onPeriodChange={onPeriodChange}
      />,
    );

    expect(screen.getAllByText('Nenhuma emoção registrada no período.')).toHaveLength(2);
    expect(screen.getByText('Nenhuma atividade realizada no período.')).toBeInTheDocument();
    expect(screen.getAllByText('Nenhum usuário ativo no período.')).toHaveLength(2);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
