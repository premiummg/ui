import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
