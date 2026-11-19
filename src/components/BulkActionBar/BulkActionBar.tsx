import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { Button } from '../Button';
import { TextButton } from '../TextButton';

export interface BulkActionBarProps {
  count: number;
  countLabel: (n: number) => ReactNode;
  // Shown instead of the count while nothing is ticked yet: the mode's own instruction ("Pick who to delete").
  emptyPrompt: string;
  // A "Select all N" shortcut. Left out when everything selectable is already selected, or there is nothing to select.
  onSelectAll?: () => void;
  selectAllLabel?: (n: number) => string;
  selectableCount?: number;
  onCancel: () => void;
  cancelLabel: string;
  actionLabel: string;
  actionIcon: IconType;
  onAction: () => void;
  actionDisabled?: boolean;
  // Red, for anything destructive (delete). Everything else is the plain primary button.
  danger?: boolean;
}

// The bar a page shows for the whole selecting mode of a list, not only once something is ticked: it is both the
// instruction and the way out. Fixed to the viewport, because on a long list you select while scrolled away from any
// toolbar at the top of the page.
export function BulkActionBar({
  count, countLabel, emptyPrompt, onSelectAll, selectAllLabel, selectableCount,
  onCancel, cancelLabel, actionLabel, actionIcon: ActionIcon, onAction, actionDisabled, danger,
}: BulkActionBarProps) {
  return (
    <>
      {/* The bar is fixed, so on a phone (where it wraps to two or three rows) it would sit on the last rows and the
          pager with no way to scroll them clear. This spacer gives the page that room for as long as the bar shows. */}
      <div aria-hidden className="h-36 sm:h-24" />
      <div className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-40 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-gray-200 dark:border-white/20 bg-white dark:bg-(--premium-dark-grey) shadow-2xl px-4 py-3">
        <span className="w-full text-sm text-gray-700 dark:text-gray-200 sm:w-auto">
          {count ? countLabel(count) : emptyPrompt}
        </span>
        {onSelectAll && selectAllLabel && !!selectableCount && selectableCount > count && (
          <TextButton tone="accent" onClick={onSelectAll}>{selectAllLabel(selectableCount)}</TextButton>
        )}
        <span className="hidden h-5 w-px bg-gray-200 dark:bg-white/20 sm:block" />
        <TextButton tone="muted" onClick={onCancel} className="max-sm:ml-auto">{cancelLabel}</TextButton>
        <Button
          type="button"
          variant={danger ? 'danger' : 'primary'}
          onClick={onAction}
          disabled={actionDisabled || !count}
          className="max-sm:w-full"
        >
          <ActionIcon size={14} /> {actionLabel}
        </Button>
      </div>
    </>
  );
}
