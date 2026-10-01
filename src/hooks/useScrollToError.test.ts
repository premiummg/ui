import { describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollToError } from './useScrollToError';

describe('useScrollToError', () => {
  test('does not scroll when trigger is false', () => {
    const { result } = renderHook(() => useScrollToError(false));
    const scrollIntoView = vi.fn();
    Object.assign(result.current, { current: { scrollIntoView } });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  test('scrolls the ref into view when trigger becomes true', () => {
    const scrollIntoView = vi.fn();
    const { result, rerender } = renderHook(({ trigger }) => useScrollToError(trigger), {
      initialProps: { trigger: false },
    });
    // @ts-expect-error - assigning a stub DOM node for the test
    result.current.current = { scrollIntoView };

    rerender({ trigger: true });
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });
});
