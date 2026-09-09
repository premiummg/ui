import { ReactNode, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export interface NotificationBellProps {
  icon: IconType;
  // aria-label on the trigger button (e.g. "Notifications", "Pending review").
  label: string;
  // Badge count on the trigger. 0/undefined hides the badge.
  count?: number;
  // Dropdown panel header text.
  title: string;
  // Optional right-aligned header action, e.g. "Mark all read".
  headerAction?: { label: string; onClick: () => void };
  // Body content - fully custom (empty state, grouped lists, whatever the
  // caller needs). Wrap it in your own scroll container if it can get long.
  children: ReactNode;
  // Optional footer action, e.g. "View all notifications".
  footer?: { label: string; onClick: () => void };
  width?: string;
}

// The shell three near-identical dropdowns in a typical app navbar all share
// (a notification bell, a "pending review" count, an unread-messages list):
// icon + badge trigger, outside-click-to-close, a header/body/footer panel.
// What differs between them - the actual rows - stays fully up to the
// caller via `children`, since a notification row and a "3 timesheets
// pending" row don't share a shape worth forcing into one prop.
export function NotificationBell({ icon: Icon, label, count, title, headerAction, children, footer, width = 'w-80' }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  return (
    // inline-block, not a bare block div: see OverflowMenu's identical fix -
    // `shrink-0` alone only stops this from shrinking as a flex ITEM, it
    // doesn't stop it from stretching to its parent's full width outside a
    // flex/inline context, which is what pulls the dropdown's `right-0` away
    // from the small trigger button.
    <div className="relative inline-block shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={label}
        aria-expanded={open}
        className="relative p-2 rounded-lg text-gray-400 dark:text-white/60 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
      >
        <Icon size={16} />
        {!!count && (
          <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-yellow-900 rounded-full flex items-center justify-center bg-yellow-400 dark:bg-yellow-300">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 ${width} bg-white dark:bg-(--premium-dark-grey) rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
            {headerAction && (
              <button
                onClick={headerAction.onClick}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              >
                {headerAction.label}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">{children}</div>

          {footer && (
            <button
              onClick={footer.onClick}
              className="w-full px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 border-t border-gray-100 dark:border-white/10 transition"
            >
              {footer.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Matches the empty/placeholder text style the source app used inline in
// every one of these dropdowns ("No notifications", "Nothing unread", ...).
export function NotificationBellEmpty({ children }: { children: ReactNode }) {
  return <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">{children}</div>;
}
