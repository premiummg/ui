import { useMemo, useState, type ReactNode } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { usePopover } from '../../hooks/usePopover';
import { useUiText } from '../../lib/i18n';
import { IconButton } from '../IconButton';
import { Input } from '../Input';

export interface ItemPickerProps<T> {
  items: T[];
  selected: T | null;
  onSelect: (item: T | null) => void;
  getKey: (item: T) => string;
  // Decides whether an item answers the typed text. The text arrives trimmed and lowercased.
  matches: (item: T, query: string) => boolean;
  // What the chosen value looks like in the chip that replaces the box once something is picked.
  renderSelected: (item: T) => ReactNode;
  // What one row of the dropdown looks like.
  renderOption: (item: T) => ReactNode;
  searchPlaceholder: string;
  // The next three default to the built-in text of the current language (see UiLangProvider).
  noResultsLabel?: string;
  clearSelectionLabel?: string;
  clearQueryLabel?: string;
  // add: a picker that adds to a list (the materials of a row, the teammates): picking one clears the box and keeps the
  // list open for the next, and no chip replaces the box (pass selected={null}).
  mode?: 'select' | 'add';
  // Something that is not in the list yet can be created from what was typed: the row shown when nothing matches.
  onCreate?: (query: string) => void;
  createLabel?: (query: string) => string;
  // Turned off: the box takes no typing and the list does not open (a form that cannot be edited).
  disabled?: boolean;
  // A list searched on the server as the person types (too long to load whole, like years of purchase orders): each
  // change of the text is passed on, `items` are the answers (shown as they come, not filtered again), and the list
  // only opens once something is typed. `loading` while the answer is on its way.
  onQueryChange?: (query: string) => void;
  loading?: boolean;
  loadingLabel?: string;
}

// The most rows a list draws at once; the rest are reached by typing more.
const MAX_SHOWN = 50;

const TEXT = {
  en: { searching: 'Searching…', create: (q: string) => `Add "${q}"`, none: 'No matches', clearSelection: 'Clear selection', clearQuery: 'Clear search', more: (n: number) => `${n} more: keep typing to narrow the list` },
  fr: { searching: 'Recherche…', create: (q: string) => `Ajouter « ${q} »`, none: 'Aucun résultat', clearSelection: 'Effacer la sélection', clearQuery: 'Effacer la recherche', more: (n: number) => `${n} de plus : continuez à écrire pour réduire la liste` },
};

// A search-then-select combobox over any list of objects. Unlike SearchPicker, which takes groups of
// {id, label, sub} and filters on those two strings, this one lets the caller decide how an item is matched
// (`matches`), drawn as a row (`renderOption`) and drawn once chosen (`renderSelected`), so a project, an
// employee or a vendor each keep their own look while sharing the open, filter, outside-click and chip behaviour.
export function ItemPicker<T>({
  items, selected, onSelect, getKey, matches, renderSelected, renderOption,
  searchPlaceholder, noResultsLabel, clearSelectionLabel, clearQueryLabel, mode = 'select', onCreate, createLabel, disabled = false, onQueryChange, loading = false, loadingLabel,
}: ItemPickerProps<T>) {
  const tx = useUiText(TEXT);
  const [query, setQuery] = useState('');
  // usePopover, like SearchPicker: Escape closes the list and nothing else (inside a Modal it used to close the whole
  // dialog and lose what was picked there), and a click outside closes it too.
  const { open, setOpen, ref: containerRef } = usePopover<HTMLDivElement>();
  // After the chip is cleared its button unmounts and the box takes its place: focus goes to the box, or a keyboard user
  // is left on the page body.
  const [focusBox, setFocusBox] = useState(false);

  const trimmed = query.trim().toLowerCase();
  // Filtered on a keystroke or a new list, not on every render of the page around it; and at most MAX_SHOWN rows are
  // drawn (a list of thousands of employees redrew every one of them on each key).
  const filtered = useMemo(() => (onQueryChange ? items : trimmed ? items.filter(item => matches(item, trimmed)) : items), [items, trimmed, matches, onQueryChange]);
  const shown = filtered.length > MAX_SHOWN ? filtered.slice(0, MAX_SHOWN) : filtered;

  function changeQuery(next: string) {
    setQuery(next);
    onQueryChange?.(next);
  }

  function handleSelect(item: T) {
    onSelect(item);
    changeQuery('');
    if (mode !== 'add') setOpen(false);
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-(--premium-red) bg-red-50/30 dark:bg-red-900/10">
        {renderSelected(selected)}
        <IconButton onClick={() => { setFocusBox(true); onSelect(null); changeQuery(''); }} aria-label={clearSelectionLabel ?? tx.clearSelection}>
          <FiX size={14} />
        </IconButton>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition ${open ? 'border-(--premium-red) ring-2 ring-(--premium-red)/20' : 'border-gray-200 dark:border-white/20'} bg-white dark:bg-(--premium-steel-grey)`}>
        <FiSearch size={14} className="text-gray-400 shrink-0" />
        <Input
          type="text"
          value={query}
          autoFocus={focusBox}
          onChange={e => { changeQuery(e.target.value); setOpen(true); }}
          // Used once: a form reset later must not have the box take the focus (and open the list) on its own.
          onFocus={() => { if (!disabled) setOpen(true); setFocusBox(false); }}
          disabled={disabled}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          aria-expanded={open}
          // text-base: iOS Safari zooms in on a text input under 16px when it gets focus (the row above is text-sm).
          className="flex-1 min-w-0 bg-transparent outline-none text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        {query && (
          <button type="button" onClick={() => changeQuery('')} aria-label={clearQueryLabel ?? tx.clearQuery} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <FiX size={12} />
          </button>
        )}
      </div>

      {open && !disabled && (!onQueryChange || trimmed) && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-3 text-sm text-gray-400">{loadingLabel ?? tx.searching}</p>
            ) : filtered.length === 0 && onCreate && query.trim() ? (
              <button
                type="button"
                onClick={() => { onCreate(query.trim()); changeQuery(''); if (mode !== 'add') setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
                style={{ color: 'var(--premium-red)' }}
              >
                {createLabel ? createLabel(query.trim()) : tx.create(query.trim())}
              </button>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">{noResultsLabel ?? tx.none}</p>
            ) : (
              shown.map(item => (
                <button
                  key={getKey(item)}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-between gap-3 border-b border-gray-50 dark:border-white/5 last:border-0"
                >
                  {renderOption(item)}
                </button>
              ))
            )}
            {filtered.length > shown.length && (
              <p className="px-4 py-2.5 text-xs text-gray-400">{tx.more(filtered.length - shown.length)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
