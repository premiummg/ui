import { useState, type ReactNode } from 'react';
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
}

const TEXT = {
  en: { none: 'No matches', clearSelection: 'Clear selection', clearQuery: 'Clear search' },
  fr: { none: 'Aucun résultat', clearSelection: 'Effacer la sélection', clearQuery: 'Effacer la recherche' },
};

// A search-then-select combobox over any list of objects. Unlike SearchPicker, which takes groups of
// {id, label, sub} and filters on those two strings, this one lets the caller decide how an item is matched
// (`matches`), drawn as a row (`renderOption`) and drawn once chosen (`renderSelected`), so a project, an
// employee or a vendor each keep their own look while sharing the open, filter, outside-click and chip behaviour.
export function ItemPicker<T>({
  items, selected, onSelect, getKey, matches, renderSelected, renderOption,
  searchPlaceholder, noResultsLabel, clearSelectionLabel, clearQueryLabel,
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
  const filtered = trimmed ? items.filter(item => matches(item, trimmed)) : items;

  function handleSelect(item: T) {
    onSelect(item);
    setQuery('');
    setOpen(false);
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-(--premium-red) bg-red-50/30 dark:bg-red-900/10">
        {renderSelected(selected)}
        <IconButton onClick={() => { setFocusBox(true); onSelect(null); setQuery(''); }} aria-label={clearSelectionLabel ?? tx.clearSelection}>
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
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          // Used once: a form reset later must not have the box take the focus (and open the list) on its own.
          onFocus={() => { setOpen(true); setFocusBox(false); }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          // text-base: iOS Safari zooms in on a text input under 16px when it gets focus (the row above is text-sm).
          className="flex-1 min-w-0 bg-transparent outline-none text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label={clearQueryLabel ?? tx.clearQuery} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <FiX size={12} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">{noResultsLabel ?? tx.none}</p>
            ) : (
              filtered.map(item => (
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
          </div>
        </div>
      )}
    </div>
  );
}
