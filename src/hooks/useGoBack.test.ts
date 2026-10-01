import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGoBack, useLeaveTo, useHistoryTracker } from './useGoBack';

// `currentIdx()` reads the REAL `window.history.state.idx` that a real
// BrowserRouter/HashRouter stamps on every push - MemoryRouter never touches
// `window.history` at all, so these hooks are only meaningful under a router
// that does. Driving `window.history` directly here (rather than rendering a
// real router) tests this hook's own idx-branching logic in isolation from
// react-router's own idx-stamping, which is the part these hooks assume
// rather than implement themselves.
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: window.location.pathname }),
  };
});

function setIdx(idx: number, pathname = '/current') {
  window.history.replaceState({ idx }, '', pathname);
}

describe('useGoBack', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    setIdx(0, '/');
  });

  test('falls back (replacing) when there is no earlier entry of this app (idx === 0)', () => {
    setIdx(0, '/employees/123');
    const { result } = renderHook(() => useGoBack('/employees'));
    result.current();
    expect(mockNavigate).toHaveBeenCalledWith('/employees', { replace: true });
  });

  test('steps back through real history when there is an earlier entry (idx > 0)', () => {
    setIdx(2, '/employees/123');
    const { result } = renderHook(() => useGoBack('/fallback'));
    result.current();
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

describe('useHistoryTracker + useLeaveTo', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('steps back when the entry behind is already the destination, instead of stacking a duplicate', () => {
    // Record idx 0 -> "/employees" (as useHistoryTracker would on that page).
    setIdx(0, '/employees');
    renderHook(() => useHistoryTracker());

    // Now on idx 1, leaving for "/employees" - the entry right behind us.
    setIdx(1, '/employees/123/edit');
    const { result } = renderHook(() => useLeaveTo());
    result.current('/employees');
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('replaces with the target when the entry behind is not the destination', () => {
    setIdx(0, '/somewhere-else');
    renderHook(() => useHistoryTracker());

    setIdx(1, '/employees/123/edit');
    const { result } = renderHook(() => useLeaveTo());
    result.current('/employees/123');
    expect(mockNavigate).toHaveBeenCalledWith('/employees/123', { replace: true });
  });

  test('ignores a query string on the target when matching against the visited path', () => {
    setIdx(0, '/employees');
    renderHook(() => useHistoryTracker());

    setIdx(1, '/employees/123/edit');
    const { result } = renderHook(() => useLeaveTo());
    result.current('/employees?filters=1');
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
