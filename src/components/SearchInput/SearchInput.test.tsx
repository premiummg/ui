import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('calls onChange after the debounce delay, not before', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} debounceMs={300} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'proj' } });
    expect(onChange).not.toHaveBeenCalledWith('proj');
    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledWith('proj');
  });

  test('the clear button empties the field and calls onChange("")', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchInput value="proj" onChange={onChange} debounceMs={0} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('textbox')).toHaveValue('');
    vi.advanceTimersByTime(0);
    expect(onChange).toHaveBeenCalledWith('');
  });

  test('does not spontaneously call onChange after mount when the initial value is non-empty', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchInput value="proj" onChange={onChange} debounceMs={300} />);
    vi.advanceTimersByTime(300);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('resets to empty when the parent passes value=""', () => {
    const { rerender } = render(<SearchInput value="proj" onChange={() => {}} />);
    rerender(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
