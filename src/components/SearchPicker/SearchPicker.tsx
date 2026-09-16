import { useMemo, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { usePopover } from '../../hooks/usePopover';
import { POPOVER_PANEL } from '../../lib/popoverPanel';

export interface PickerItem {
  id: string;
  label: string;
  sub?: string;
}

export interface PickerGroup {
  label?: string;
  items: PickerItem[];
}

export interface SearchPickerProps {
  groups: PickerGroup[];
  placeholder: string;
  emptyText?: string;
  value?: PickerItem | null;
  onChange: (item: PickerItem | null) => void;
}

// A search-then-select combobox: a plain text box until focused, then a
// grouped, filterable dropdown, collapsing to a single selected-value chip
// (with its own clear button) once something's picked. The shape behind
// every "find and pick one" control in a real app - a project search, an
// employee picker, a vendor picker - that SearchInput's plain debounced text
// box doesn't cover on its own (no dropdown, no groups, no selection state).
export function SearchPicker({ groups, placeholder, emptyText = 'No matches', value, onChange }: SearchPickerProps) {
  const [query, setQuery] = useState('');
  const { open, setOpen, ref } = usePopover<HTMLDivElement>(() => setQuery(''));

  const q = query.trim().toLowerCase();
  // Memoized on the actual inputs (groups, q) - otherwise this re-filters on
  // every render of whatever form/page hosts the picker, not just on actual
  // keystrokes in it.
  const filtered = useMemo(
    () => groups
      .map(g => ({
        ...g,
        items: q ? g.items.filter(i => `${i.label} ${i.sub ?? ''}`.toLowerCase().includes(q)) : g.items,
      }))
      .filter(g => g.items.length > 0),
    [groups, q],
  );

  function select(item: PickerItem) {
    onChange(item);
    setOpen(false);
    setQuery('');
  }

  if (value && !open) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/20 bg-white dark:bg-(--premium-steel-grey)">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{value.label}</p>
          {value.sub && <p className="text-xs text-gray-400 truncate">{value.sub}</p>}
        </div>
        <button
          type="button"
          onClick={() => { onChange(null); setOpen(true); }}
          aria-label="Clear selection"
          className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          <FiX size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-(--premium-steel-grey) transition ${
          open ? 'border-(--premium-red) ring-[3px] ring-(--premium-red-ring)' : 'border-gray-200 dark:border-white/20'
        }`}
      >
        <FiSearch size={14} className="text-gray-400 shrink-0" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      {open && (
        <div className={`absolute mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 ${POPOVER_PANEL}`}>
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">{emptyText}</p>
          ) : filtered.map((g, gi) => (
            <div key={gi}>
              {g.label && <p className="px-4 pt-2.5 pb-1 pmg-eyebrow text-gray-400 dark:text-gray-500">{g.label}</p>}
              {g.items.map(i => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => select(i)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition border-b border-gray-50 dark:border-white/5 last:border-0"
                >
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{i.label}</span>
                  {i.sub && <span className="block text-xs text-gray-400">{i.sub}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
