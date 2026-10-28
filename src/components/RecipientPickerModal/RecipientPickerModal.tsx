import { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Modal } from '../Modal';
import { FormLabel } from '../FormLabel';
import { Button } from '../Button';

export interface RecipientPerson {
  id: string;
  name: string;
  // Second line under the name: division, position, whatever tells two
  // people with the same name apart.
  sub?: string;
}

export interface RecipientPickerLabels {
  heading: string;
  description?: string;
  searchLabel: string;
  searchPlaceholder: string;
  selectAll: string;
  clearAll: string;
  selectedCount: (n: number) => string;
  empty: string;
  cont: string;
  cancel: string;
}

export interface RecipientPickerModalProps {
  people: RecipientPerson[];
  onClose: () => void;
  // Called with the people ticked, in list order, when the sender continues.
  onContinue: (selected: RecipientPerson[]) => void;
  labels: RecipientPickerLabels;
}

// "Who is this going to": a searchable, multi-select list of the people the
// sender is allowed to address. Presentational; the caller decides who is in
// the list (their division, admins, ...) and what happens with the pick, which
// in both apps is handing it on to SendMessageModal.
export function RecipientPickerModal({ people, onClose, onContinue, labels: t }: RecipientPickerModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => (q ? people.filter(p => `${p.name} ${p.sub ?? ''}`.toLowerCase().includes(q)) : people),
    [people, q],
  );
  const allVisibleSelected = visible.length > 0 && visible.every(p => selected.has(p.id));

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelected(prev => {
      const next = new Set(prev);
      for (const p of visible) {
        if (allVisibleSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  }

  return (
    <Modal onClose={onClose} title={t.heading} description={t.description} maxWidth="max-w-lg">
      <div className="space-y-3">
        <div>
          <FormLabel text={t.searchLabel} htmlFor="recipient-picker-search" />
          <div className="relative">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id="recipient-picker-search"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="input-field w-full pl-8"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={toggleVisible}
            disabled={!visible.length}
            className="font-medium transition disabled:opacity-50"
            style={{ color: 'var(--premium-red)' }}
          >
            {allVisibleSelected ? t.clearAll : t.selectAll}
          </button>
          <span className="text-gray-500 dark:text-gray-400">{t.selectedCount(selected.size)}</span>
        </div>

        <ul className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/15 divide-y divide-gray-100 dark:divide-white/10">
          {visible.length === 0 && <li className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{t.empty}</li>}
          {visible.map(p => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4 shrink-0"
                  style={{ accentColor: 'var(--premium-red)' }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                  {p.sub && <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{p.sub}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="md" onClick={onClose}>{t.cancel}</Button>
          <Button
            variant="primary"
            size="md"
            disabled={!selected.size}
            onClick={() => onContinue(people.filter(p => selected.has(p.id)))}
          >
            {t.cont}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
