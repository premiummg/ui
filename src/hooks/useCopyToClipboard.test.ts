import { describe, expect, test, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from './useCopyToClipboard';

describe('useCopyToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('copied flips true after copy() and back to false after resetMs', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const { result } = renderHook(() => useCopyToClipboard(1000));
    expect(result.current[0]).toBe(false);

    await act(async () => {
      await result.current[1]('hello');
    });
    expect(result.current[0]).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(false);
  });

  test('reset() clears copied immediately', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      await result.current[1]('x');
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe(false);
  });
});
