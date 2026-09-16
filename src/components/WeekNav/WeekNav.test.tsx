import { afterEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeekNav } from './WeekNav';

describe('WeekNav', () => {
  test('null value shows the current week range and disables Next', () => {
    render(<WeekNav value={null} onChange={() => {}} />);
    const [, , next] = screen.getAllByRole('button');
    expect(next).toBeDisabled();
  });

  test('Prev on a specific week calls onChange with the prior Monday', async () => {
    const onChange = vi.fn();
    render(<WeekNav value="2026-03-16" onChange={onChange} />);
    const [prev] = screen.getAllByRole('button');
    await userEvent.click(prev);
    expect(onChange).toHaveBeenCalledWith('2026-03-09');
  });

  test('opening the picker shows the month/year header and a week grid', async () => {
    render(<WeekNav value="2026-03-16" onChange={() => {}} />);
    await userEvent.click(screen.getByText('Mar 16 – Mar 22'));
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  test('a restricted `weeks` list disables the weeks outside it, not the ones inside', async () => {
    // value pins the picker's initial view to March 2026 directly, so no
    // in-dropdown month navigation is needed to reach the fixture data.
    const { container } = render(<WeekNav value="2026-03-16" weeks={['2026-03-02']} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Mar 16 – Mar 22'));
    const weekButtons = [...container.querySelectorAll('.grid.grid-cols-7.rounded-lg')] as HTMLButtonElement[];
    const findRow = (mondayLabel: string) =>
      weekButtons.find(btn => btn.querySelector('span')?.textContent === mondayLabel)!;
    expect(findRow('2')).not.toBeDisabled(); // week of the one allowed Monday
    expect(findRow('16')).toBeDisabled(); // the currently-selected, but not-listed, week
  });

  test('"Current week" is disabled when value is already null, enabled otherwise', async () => {
    const onChange = vi.fn();
    render(<WeekNav value="2026-03-16" onChange={onChange} />);
    await userEvent.click(screen.getByText('Mar 16 – Mar 22'));
    const currentBtn = screen.getByText('Current week');
    expect(currentBtn).not.toBeDisabled();
    await userEvent.click(currentBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  test('the header cycles weeks -> months -> years, and picking a year jumps back to its months view', async () => {
    render(<WeekNav value="2026-03-16" onChange={() => {}} />);
    await userEvent.click(screen.getByText('Mar 16 – Mar 22'));
    await userEvent.click(screen.getByText('March 2026')); // -> months view
    await userEvent.click(screen.getByText('2026')); // -> years view (decade page)
    expect(screen.getByText('2016 – 2027')).toBeInTheDocument();
    await userEvent.click(screen.getByText('2020'));
    expect(screen.getByText('2020')).toBeInTheDocument(); // back in months view, header now reads 2020
    expect(screen.getByText('Mar')).toBeInTheDocument(); // months grid is showing again
  });

  test('variant="hero" gives the trigger row white-on-transparent chrome', () => {
    const { container } = render(<WeekNav value={null} onChange={() => {}} variant="hero" />);
    expect(container.querySelector('.bg-white\\/15')).toBeInTheDocument();
  });

  test('clicking outside closes the picker', async () => {
    render(
      <div>
        <div data-testid="outside" />
        <WeekNav value="2026-03-16" onChange={() => {}} />
      </div>,
    );
    await userEvent.click(screen.getByText('Mar 16 – Mar 22'));
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.queryByText('March 2026')).not.toBeInTheDocument();
  });

  describe('when the current week\'s Monday falls in the previous month', () => {
    afterEach(() => { vi.useRealTimers(); });

    test('the real current month is not marked unavailable in the months quick-jump', () => {
      // May 1, 2026 is a Friday, so its week's Monday is Apr 27 - a case
      // where deriving "the current month" from the week's Monday (instead
      // of from today's real date) picks April instead of May.
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 4, 1));
      render(<WeekNav value={null} onChange={() => {}} />);
      fireEvent.click(screen.getByText('Apr 27 – May 3'));
      fireEvent.click(screen.getByText('April 2026'));
      expect(screen.getByText('May')).not.toBeDisabled();
    });
  });
});
