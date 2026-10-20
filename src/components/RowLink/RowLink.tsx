import { MouseEvent } from 'react';

export interface RowLinkProps {
  /** The real URL this cell points at - middle-click, Ctrl/Cmd/Shift-click
      and "Open in new tab" all work on it natively, same as any other link.
      A plain `<tr onClick={...}>` can never support those: a `<tr>` has no
      href for the browser to act on. */
  href: string;
  /** Called on a plain left-click instead of letting the browser navigate
      (e.g. `() => navigate(href)`, for client-side routing with no reload).
      Omit to let every click - including a plain left one - fall through to
      the browser, a full navigation to `href`. */
  onNavigate?: () => void;
  /** Accessible name for the link, read by a screen reader - the cell's own
      visible text isn't otherwise tied to this link. */
  label: string;
}

// Makes one table cell a real link, stretched to fill it - typically the
// row's primary cell (a name, a number), so hovering/clicking anywhere in
// that cell (not just its text) opens it. Render it as a CHILD of a `<td>`
// (never a `<tr>` directly - a `<tr>` may only contain `<td>`/`<th>`; React
// warns, and some browsers mis-render, if an `<a>` is nested straight
// inside one), and give that `<td>` `className="relative"` - RowLink then
// stretches to fill it (`absolute inset-0`). A second interactive element
// in the SAME cell (rare) needs its own `relative` (plus a higher
// `z-index` if it still doesn't win) to stay independently clickable,
// since it stacks above RowLink by default.
export function RowLink({ href, onNavigate, label }: RowLinkProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!onNavigate || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate();
  }
  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={label}
      className="absolute inset-0"
    />
  );
}
