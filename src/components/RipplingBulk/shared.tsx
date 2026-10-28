import { useCallback, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { Button } from '../Button';

// Pieces the Rippling bulk dialogs (Match, Import, Fill) all need, kept in one
// place so a fix to one is a fix to all.

// Which rows of a list are ticked. `reset` replaces the selection (used when the
// list loads), `toggle` flips one row, `toggleAll` ticks or clears every row of
// `allIds`, `remove` drops rows that left the list.
export function useIdSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const reset = useCallback((ids: string[]) => setSelected(new Set(ids)), []);
  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleAll = useCallback((allIds: string[]) => {
    setSelected((prev) => (allIds.length > 0 && allIds.every((id) => prev.has(id)) ? new Set() : new Set(allIds)));
  }, []);
  const remove = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);

  return { selected, reset, toggle, toggleAll, remove };
}

export function ModalLoading({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 py-8">
      <FiRefreshCw size={18} className="animate-spin shrink-0" style={{ color: 'var(--premium-red)' }} />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}

export function ModalLoadError({ message, retryLabel, onRetry }: { message: string; retryLabel: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-6">
      <p className="text-sm text-red-500">{message}</p>
      <Button variant="secondary" size="xs" onClick={onRetry}>{retryLabel}</Button>
    </div>
  );
}

export function SelectAllRow({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="mb-2 flex cursor-pointer items-center gap-2.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-red-600" />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

// The list of what did not go through, under a "N done, M not" headline.
export function BatchFailures({ items }: { items: { key: string; name: string; message: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="max-h-[35vh] divide-y divide-gray-100 overflow-y-auto dark:divide-white/10">
      {items.map((f) => (
        <div key={f.key} className="py-2.5 text-sm">
          <span className="font-medium text-gray-900 dark:text-gray-100">{f.name}</span>
          <span className="ml-2 text-gray-500 dark:text-gray-400">{f.message}</span>
        </div>
      ))}
    </div>
  );
}
