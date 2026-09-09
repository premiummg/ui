import { useRef, useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export interface OverflowItem {
  icon: IconType;
  label: string;
  // One line under the label saying what the action actually does. Best for
  // rare, consequential actions ("Disable MFA", "Log out all devices") that
  // aren't self-explanatory done once a quarter - cheaper than a confirmation
  // dialog nobody reads.
  hint?: string;
  onClick: () => void;
}

export interface OverflowMenuProps {
  items?: OverflowItem[];
  dangerItems?: OverflowItem[];
  // Invert the trigger's chrome for placement on a solid brand-red field.
  onDark?: boolean;
  label?: string;
  // Which edge the menu hangs from - same contract as WeekNav's own `align`.
  // Defaults to 'right', which suits a trigger sitting toward the right of
  // its row (the common case: the last of several toolbar icons); a trigger
  // anchored near the left edge of its own container (which would push the
  // menu off-screen to the left) passes 'left' instead.
  align?: 'left' | 'right';
}

// A "more actions" menu for a set of rare, non-equal-weight row/page actions.
// Destructive entries sit below a divider and take brand red only there, so
// MAIN red keeps meaning "the one thing you can act on" everywhere else.
export function OverflowMenu({ items, dangerItems, onDark = false, label = 'More actions', align = 'right' }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  const all = [...(items ?? []), ...(dangerItems ?? [])];
  if (all.length === 0) return null;

  function run(item: OverflowItem) {
    setOpen(false);
    item.onClick();
  }

  return (
    // inline-block, not a bare block div: a plain <div> stretches to its
    // parent's full width unless that parent happens to be a flex/inline
    // row (which is why this never showed up composed inside a toolbar) -
    // and once it does, `right-0` on the dropdown below anchors to THIS
    // div's right edge, not the trigger button's, landing the menu wherever
    // this div's stretched edge happens to be instead of under the button.
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={label}
        aria-expanded={open}
        className={`w-9 h-9 rounded-lg grid place-items-center transition ${
          onDark
            ? 'border border-white/25 text-white/90 hover:bg-white/10'
            : 'border border-gray-200 dark:border-white/20 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
        }`}
      >
        <FiMoreHorizontal size={16} />
      </button>

      {/* w-56 below sm: the trigger is usually the last of several icon
          buttons clustered together rather than flush against the screen's
          own right edge, so anchoring a full w-64 (256px) here can push its
          left edge a little past x=0 on a narrow phone. */}
      {open && (
        <div className={`absolute top-full mt-2 ${align === 'left' ? 'left-0' : 'right-0'} w-56 sm:w-64 z-30 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-(--premium-steel-grey) shadow-lg py-1.5 overflow-hidden`}>
          {items?.map(it => (
            <button
              key={it.label}
              type="button"
              onClick={() => run(it)}
              className="w-full text-left px-3.5 py-2 flex items-start gap-2.5 hover:bg-gray-50 dark:hover:bg-white/10 transition"
            >
              <it.icon size={15} className="shrink-0 mt-0.5 text-gray-400 dark:text-gray-300" />
              <span className="min-w-0">
                <span className="block text-sm text-gray-800 dark:text-gray-100">{it.label}</span>
                {it.hint && (
                  <span className="block text-xs text-gray-400 dark:text-gray-400 leading-snug mt-0.5">{it.hint}</span>
                )}
              </span>
            </button>
          ))}

          {items?.length && dangerItems?.length ? (
            <div className="my-1.5 border-t border-gray-100 dark:border-white/10" />
          ) : null}

          {dangerItems?.map(it => (
            <button
              key={it.label}
              type="button"
              onClick={() => run(it)}
              className="w-full text-left px-3.5 py-2 flex items-start gap-2.5 hover:bg-(--premium-red-light) dark:hover:bg-[#E62027]/15 transition group"
            >
              <it.icon size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--premium-red)' }} />
              <span className="min-w-0">
                <span className="block text-sm" style={{ color: 'var(--premium-red)' }}>{it.label}</span>
                {it.hint && (
                  <span className="block text-xs text-gray-400 dark:text-gray-400 leading-snug mt-0.5">{it.hint}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
