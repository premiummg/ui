import { ReactNode, useEffect, useRef } from 'react';

export interface ModalProps {
  onClose: () => void;
  // Optional built-in heading + one line of supporting copy - the shape
  // every real confirm/edit modal in the app already hand-rolls itself (an
  // <h3>, sometimes a <p> under it, both inside a p-6 wrapper). Omit both
  // and build your own header inside `children` for anything richer.
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  maxWidth?: string;
  zIndex?: string;
}

export function Modal({ onClose, title, description, children, maxWidth = 'max-w-md', zIndex = 'z-50' }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Selecting text near the modal's edge (mousedown inside the content,
  // mouseup outside it once the drag crosses the boundary) fires a click
  // event whose target is the overlay itself - a plain onClick={onClose}
  // on the overlay would wrongly treat that as an outside click and close
  // the modal mid-selection. Only close when BOTH the press and the release
  // happened directly on the overlay, never when either started inside.
  const pressedOverlay = useRef(false);

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm`}
      onMouseDown={e => { pressedOverlay.current = e.target === e.currentTarget; }}
      onClick={e => { if (e.target === e.currentTarget && pressedOverlay.current) onClose(); }}
    >
      <div
        className={`bg-white dark:bg-(--premium-dark-grey) rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 w-full ${maxWidth}`}
      >
        <div className="p-6">
          {title && (
            // Tight mb-1 when a description follows right under it, a
            // looser mb-4 when the title sits directly above whatever
            // `children` brings (a form, a confirm/cancel row) instead -
            // the same two spacings real modals already split between.
            <h3 className={`font-heading font-bold text-gray-900 dark:text-gray-100 ${description ? 'mb-1' : 'mb-4'}`}>
              {title}
            </h3>
          )}
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
