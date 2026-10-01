import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Back buttons used to be written one of two ways, and both were wrong.
//
//   navigate('/employees/123')  pushes a NEW entry. Employees > detail > edit,
//     then "back" leaves you on the detail page with history reading
//     [employees, detail, edit, detail] - so the browser's own back button
//     returns to the edit form, whose "back" pushes detail again, forever.
//
//   navigate(-1)  never loops, but it walks straight out of the app when the
//     page was opened from a bookmark, a deep link or a new tab, because
//     there is no earlier entry of ours to return to.
//
// The fix is to step back through history when there IS something of ours
// behind us, and only synthesise a destination when there isn't. React Router
// stamps a monotonically increasing `idx` into history.state on every push,
// and it starts at 0 for the entry the app was loaded on, so `idx > 0` is
// exactly the question "did we get here from another page of this app?".
function currentIdx(): number {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === 'number' ? idx : 0;
}

// Pathnames this app has rendered, keyed by that same router index. Read only
// to answer "is the entry behind me already where I want to land?", which lets
// a form that finished its work step back onto the page that opened it instead
// of stacking a second copy of it.
const visited: string[] = [];

/** Mount once inside the router. Records where each history entry points. */
export function useHistoryTracker(): void {
  const location = useLocation();
  useEffect(() => {
    visited[currentIdx()] = location.pathname;
  }, [location]);
}

/**
 * A back button. Returns to the previous page of this app, or falls back to
 * `fallback` (replacing the current entry, so the page just left behind does
 * not linger in history) when there is no previous page of ours.
 */
export function useGoBack(fallback: string): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    if (currentIdx() > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}

/**
 * Leaves the current page for good: after a save, a cancel, or a delete. The
 * current entry is always dropped, because the browser back button must not
 * drop the user back into a form they already submitted or abandoned. When the
 * page behind us is already the destination we step onto it rather than
 * pushing a duplicate of it.
 */
export function useLeaveTo(): (target: string) => void {
  const navigate = useNavigate();
  return useCallback((target: string) => {
    const idx = currentIdx();
    if (idx > 0 && visited[idx - 1] === target.split('?')[0]) navigate(-1);
    else navigate(target, { replace: true });
  }, [navigate]);
}
