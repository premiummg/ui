import { describe, expect, test, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function mockMatchMedia(initialMatches: boolean) {
  let listener: (() => void) | null = null;
  const mq = {
    matches: initialMatches,
    addEventListener: vi.fn((_: string, cb: () => void) => { listener = cb; }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mq));
  return { mq, fireChange: (matches: boolean) => { mq.matches = matches; listener?.(); } };
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('reads the initial media query value', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  test('updates live when the media query changes', () => {
    const { fireChange } = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => fireChange(true));
    expect(result.current).toBe(true);
  });

  test('defaults to false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});
