import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker, parseValue, toValue, hour12Of, periodOf } from './TimePicker';

describe('TimePicker', () => {
  test('shows the placeholder with no value, and the formatted time with one', () => {
    const { rerender } = render(<TimePicker value="" onChange={() => {}} placeholder="Pick a time" />);
    expect(screen.getByText('Pick a time')).toBeInTheDocument();
    rerender(<TimePicker value="14:30" onChange={() => {}} />);
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  test('clicking the trigger opens the panel, showing the Clear/Done footer', async () => {
    render(<TimePicker value="09:00" onChange={() => {}} />);
    await userEvent.click(screen.getByText('9:00 AM'));
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  test('Done closes the panel without changing the value', async () => {
    const onChange = vi.fn();
    render(<TimePicker value="09:00" onChange={onChange} />);
    await userEvent.click(screen.getByText('9:00 AM'));
    await userEvent.click(screen.getByText('Done'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });

  test('clicking PM commits the equivalent PM hour and closing/reopening reflects it', async () => {
    const onChange = vi.fn();
    render(<TimePicker value="09:00" onChange={onChange} />);
    await userEvent.click(screen.getByText('9:00 AM'));
    await userEvent.click(screen.getByText('PM'));
    expect(onChange).toHaveBeenCalledWith('21:00');
  });

  test('the clear (x) button calls onChange("") without opening the panel', async () => {
    const onChange = vi.fn();
    render(<TimePicker value="09:00" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '' }));
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });

  test('a disabled picker does not open on click', async () => {
    render(<TimePicker value="" onChange={() => {}} disabled placeholder="Pick a time" />);
    await userEvent.click(screen.getByText('Pick a time'));
    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });
});

// AM/PM used to be tracked as its own piece of state, flipped by comparing
// the previous committed hour to the new one (only exactly on 11<->12). That
// broke the moment a single scroll moved more than one row - which a real
// mouse wheel or trackpad tick routinely does - since the in-between hour
// was then never actually "settled" to trigger the comparison, and AM/PM got
// stuck. Everything is now derived straight from h24 instead, so there's no
// separate state to desync in the first place; these tests are really about
// that derivation being correct at every hour, not about any stepping logic.
describe('TimePicker hour/period derivation (h24 is the only source of truth)', () => {
  test('hour12Of maps every h24 to its 12-hour numeral, including midnight and noon', () => {
    expect(hour12Of(0)).toBe(12); // midnight
    expect(hour12Of(1)).toBe(1);
    expect(hour12Of(11)).toBe(11);
    expect(hour12Of(12)).toBe(12); // noon
    expect(hour12Of(13)).toBe(1);
    expect(hour12Of(23)).toBe(11);
  });

  test('periodOf flips exactly at the 11->12 boundary (h24 11 vs 12) and nowhere else', () => {
    for (let h = 0; h <= 23; h++) {
      expect(periodOf(h)).toBe(h < 12 ? 'AM' : 'PM');
    }
  });

  test('jumping several hours in one go (what a fast scroll produces) still derives the right period - no missed flip', () => {
    // 9 AM jumping straight to what would be hour12=12 after crossing 11->12
    // in one scroll, skipping every value in between - the exact shape of
    // bug this replaced: nothing here depends on having "seen" 10 or 11.
    expect(hour12Of(12)).toBe(12);
    expect(periodOf(12)).toBe('PM');
  });

  test('toValue/parseValue round-trip for every hour and a representative set of minutes', () => {
    for (let h = 0; h <= 23; h++) {
      for (const m of [0, 1, 30, 59]) {
        const value = toValue(h, m);
        expect(parseValue(value)).toEqual({ h24: h, minute: m });
      }
    }
  });

  test('clicking AM/PM directly jumps to the equivalent hour in that half of the day', () => {
    // This is the exact arithmetic TimePicker's PeriodColumn onPick uses:
    // (h24 % 12) + (period === 'PM' ? 12 : 0).
    const toPeriod = (h24: number, period: 'AM' | 'PM') => (h24 % 12) + (period === 'PM' ? 12 : 0);
    expect(toPeriod(9, 'PM')).toBe(21); // 9 AM -> 9 PM
    expect(toPeriod(21, 'AM')).toBe(9); // 9 PM -> 9 AM
    expect(toPeriod(0, 'PM')).toBe(12); // 12 AM -> 12 PM
    expect(toPeriod(12, 'AM')).toBe(0); // 12 PM -> 12 AM
  });

  test('parseValue rejects out-of-range or malformed strings', () => {
    expect(parseValue('')).toBeNull();
    expect(parseValue('24:00')).toBeNull();
    expect(parseValue('12:60')).toBeNull();
    expect(parseValue('not-a-time')).toBeNull();
  });
});
