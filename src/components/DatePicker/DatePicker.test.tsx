import { afterEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  test('shows the placeholder with no value, and the formatted date with one', () => {
    const { rerender } = render(<DatePicker value="" onChange={() => {}} placeholder="Pick a date" />);
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
    rerender(<DatePicker value="2026-03-15" onChange={() => {}} />);
    expect(screen.getByText('Mar 15, 2026')).toBeInTheDocument();
  });

  test('clicking the trigger opens the calendar, showing the month/year header', async () => {
    render(<DatePicker value="2026-03-15" onChange={() => {}} />);
    await userEvent.click(screen.getByText('Mar 15, 2026'));
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  test('selecting a day calls onChange with an ISO date and closes the calendar', async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-15" onChange={onChange} />);
    await userEvent.click(screen.getByText('Mar 15, 2026'));
    await userEvent.click(screen.getByText('20'));
    expect(onChange).toHaveBeenCalledWith('2026-03-20');
    expect(screen.queryByText('March 2026')).not.toBeInTheDocument();
  });

  test('the clear (x) button calls onChange("") without opening the calendar', async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-15" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '' }));
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.queryByText('March 2026')).not.toBeInTheDocument();
  });

  test('a disabled picker does not open on click', async () => {
    render(<DatePicker value="" onChange={() => {}} disabled placeholder="Pick a date" />);
    await userEvent.click(screen.getByText('Pick a date'));
    expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument();
  });

  test('an unavailable date is struck through and not selectable', async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-15" onChange={onChange} unavailableDates={['2026-03-20']} />);
    await userEvent.click(screen.getByText('Mar 15, 2026'));
    const day20 = screen.getByText('20');
    expect(day20.closest('button')).toBeDisabled();
    expect(day20.closest('button')!.className).toContain('line-through');
  });

  describe('when the default (today) view is already past maxDate, in a different year', () => {
    afterEach(() => { vi.useRealTimers(); });

    test('Next stays disabled instead of wrongly re-enabling across the year boundary', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2027, 0, 15)); // "today" defaults viewMonth to Jan 2027
      render(<DatePicker value="" onChange={() => {}} maxDate={new Date(2025, 5, 10)} />);
      fireEvent.click(screen.getByText('Select date'));
      const header = screen.getByText('January 2027');
      expect(header.nextElementSibling).toBeDisabled();
    });
  });
});
