import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DailyMoodCount } from '@/types/dashboard';
import { MoodStackedChart } from './MoodStackedChart';
import { PeriodSelect } from './PeriodSelect';

function days(count: number): DailyMoodCount[] {
  return Array.from({ length: count }, (_, index) => ({
    date: new Date(Date.UTC(2026, 0, 1 + index)).toISOString().slice(0, 10),
    counts: { FELIZ: index + 1 },
  }));
}

describe('MoodStackedChart', () => {
  it('shows the empty state without columns or axis when there are no days', () => {
    const { container } = render(<MoodStackedChart days={[]} />);

    expect(screen.getByText('Nenhuma emoção registrada no período.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('.mood-chart__axis')).toBeNull();
  });

  it('uses the dense layout for long periods and labels first, middle and last day', () => {
    const { container } = render(<MoodStackedChart days={days(90)} />);

    expect(screen.getByRole('img')).toHaveClass('mood-chart__plot--dense');
    const labels = Array.from(container.querySelectorAll('.mood-chart__axis span')).map(
      (label) => label.textContent,
    );
    expect(labels).toEqual(['1 jan', '14 fev', '31 mar']);
  });

  it('keeps the regular layout for a month and labels a single day once', () => {
    const { container, rerender } = render(<MoodStackedChart days={days(30)} />);
    expect(screen.getByRole('img')).not.toHaveClass('mood-chart__plot--dense');

    rerender(<MoodStackedChart days={days(1)} />);
    expect(container.querySelectorAll('.mood-chart__axis span')).toHaveLength(1);
  });
});

describe('PeriodSelect', () => {
  it('notifies only the supported periods', () => {
    const onChange = vi.fn();
    render(<PeriodSelect id="period" value={30} onChange={onChange} />);
    const select = screen.getByLabelText('Período');

    fireEvent.change(select, { target: { value: '7' } });
    expect(onChange).toHaveBeenCalledWith(7);

    onChange.mockClear();
    fireEvent.change(select, { target: { value: '15' } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
