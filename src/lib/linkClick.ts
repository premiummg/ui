import type { MouseEvent } from 'react';

// True for the one kind of click an in-app router should take over: a plain
// primary-button click with no modifier. Ctrl/Cmd/Shift/Alt-click and the
// middle button are the visitor asking the BROWSER for a new tab or window,
// so a component that renders a real `<a href>` and also takes an
// `onNavigate` callback must leave those alone - otherwise "open in new
// tab" silently navigates the current tab instead. Same rule `NavTile`
// already applies inline.
export function isPlainLeftClick(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
