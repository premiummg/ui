import { ReactNode, useEffect, useId, useRef } from 'react';

export interface ModalProps {
  onClose: () => void;
  // Optional built-in heading + one line of supporting copy: the shape
  // every real confirm/edit modal in the app already hand-rolls itself (an
  // <h3>, sometimes a <p> under it, both inside a p-6 wrapper). Omit both
  // and build your own header inside `children` for anything richer.
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  maxWidth?: string;
  zIndex?: string;
  // Escape and a click outside the panel call onClose. Pass false for a modal that must not be dismissed
  // while it works (a save in flight): it then only closes through its own buttons.
  dismissable?: boolean;
  // Accessible name when there is no `title` to point at (a modal that builds its own header).
  ariaLabel?: string;
}

// Only the top modal answers Escape and traps Tab, so a confirm opened over an edit modal closes alone instead
// of taking the modal underneath with it. The top one is the last panel in the document: an inner modal sits after
// the one it was opened from, and it stays so even when both mount in the same render (their effects then run
// innermost first, which a list kept in effect order would get backwards).
const MODAL_ATTRIBUTE = 'data-pmg-modal';
const isTopModal = (panel: HTMLElement | null): boolean => {
  const all = document.querySelectorAll(`[${MODAL_ATTRIBUTE}]`);
  return !!panel && all[all.length - 1] === panel;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ onClose, title, description, children, maxWidth = 'max-w-md', zIndex = 'z-50', dismissable = true, ariaLabel }: ModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const panelRef = useRef<HTMLDivElement>(null);
  // The latest callbacks, read from the key handler, so a parent that passes a new onClose on every
  // render does not re-register the listener (and does not re-run the focus handling below).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dismissableRef = useRef(dismissable);
  dismissableRef.current = dismissable;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus moves into the panel and comes back to where it was when the modal closes. The panel itself
    // takes it, not its first field: a field that opens something on focus (a picker's list) would pop
    // open by itself. A child with autoFocus has already claimed it by now and is left alone.
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus();

    const onKey = (e: KeyboardEvent) => {
      if (!isTopModal(panelRef.current)) return;
      if (e.key === 'Escape') {
        // A widget inside the modal that used Escape for itself (closing its own list, cancelling an inline edit)
        // marks the event as handled; the modal stays open.
        if (!e.defaultPrevented && dismissableRef.current) onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      // Tab and Shift+Tab wrap around inside the panel instead of leaving it for the page behind.
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) { e.preventDefault(); panel.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      else if (!panel.contains(active)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
  }, []);

  // Selecting text near the modal's edge (mousedown inside the content,
  // mouseup outside it once the drag crosses the boundary) fires a click
  // event whose target is the overlay itself: a plain onClick={onClose}
  // on the overlay would wrongly treat that as an outside click and close
  // the modal mid-selection. Only close when BOTH the press and the release
  // happened directly on the overlay, never when either started inside.
  const pressedOverlay = useRef(false);

  return (
    <div
      // The overlay scrolls when a modal is taller than the screen (a long list, a small window); the panel centres
      // itself with auto margins, which, unlike items-center, never pushes its top out of reach.
      className={`fixed inset-0 ${zIndex} flex justify-center overflow-y-auto p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm`}
      onMouseDown={e => { pressedOverlay.current = e.target === e.currentTarget; }}
      onClick={e => { if (dismissable && e.target === e.currentTarget && pressedOverlay.current) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        {...{ [MODAL_ATTRIBUTE]: '' }}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`bg-white dark:bg-(--premium-dark-grey) rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 w-full my-auto outline-none ${maxWidth}`}
      >
        <div className="p-6">
          {title && (
            // Tight mb-1 when a description follows right under it, a
            // looser mb-4 when the title sits directly above whatever
            // `children` brings (a form, a confirm/cancel row) instead:
            // the same two spacings real modals already split between.
            <h3 id={titleId} className={`font-heading font-bold text-gray-900 dark:text-gray-100 ${description ? 'mb-1' : 'mb-4'}`}>
              {title}
            </h3>
          )}
          {description && <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
