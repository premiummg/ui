import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthNav } from './MonthNav';

describe('MonthNav', () => {
  test('null value shows the current month and disables Next', () => {
    render(<MonthNav value={null} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /january|february|march|april|may|june|july|august|september|october|november|december/i })).toBeInTheDocument();
    const [, , next] = screen.getAllByRole('button');
    expect(next).toBeDisabled();
  });

  test('Prev on a specific month calls onChange with the prior month', async () => {
    const onChange = vi.fn();
    render(<MonthNav value="2026-03" onChange={onChange} />);
    const [prev] = screen.getAllByRole('button');
    await userEvent.click(prev);
    expect(onChange).toHaveBeenCalledWith('2026-02');
  });

  test('opening the picker shows the months grid with the selected month marked', async () => {
    render(<MonthNav value="2026-03" onChange={() => {}} />);
    await userEvent.click(screen.getByText('March 2026'));
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  test('a restricted `months` list disables months outside it, even in the past', async () => {
    render(<MonthNav value={null} months={['2026-01']} onChange={() => {}} />);
    await userEvent.click(screen.getByText(/2026/));
    const feb = screen.getByText('Feb');
    expect(feb.closest('button')).toBeDisabled();
  });

  test('"Current month" is disabled when value is already null, enabled otherwise', async () => {
    const onChange = vi.fn();
    render(<MonthNav value="2026-01" onChange={onChange} />);
    await userEvent.click(screen.getByText('January 2026'));
    const currentBtn = screen.getByText('Current month');
    expect(currentBtn).not.toBeDisabled();
    await userEvent.click(currentBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
