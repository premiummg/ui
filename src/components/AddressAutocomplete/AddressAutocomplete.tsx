import { useEffect, useState } from 'react';
import { searchAddress, type AddressSuggestion, type SearchAddressOptions } from './nominatim';

export interface AddressAutocompleteProps {
  id?: string;
  value: string;
  onChange: (text: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // Debounce before a search fires, in ms.
  debounceMs?: number;
  countryCodes?: SearchAddressOptions['countryCodes'];
  userAgent?: SearchAddressOptions['userAgent'];
  // Text overrides - e.g. translated copy for a localized consumer. Each
  // defaults to the English copy.
  searchingLabel?: string;
  attributionLabel?: string;
}

// Regional-indicator flag emoji (🇨🇦 etc.) render as an actual flag on iOS/
// macOS/Android, but Windows' system font has never reliably drawn them as
// pictures - Chrome/Edge on Windows shows the two letter codes side by side
// or a blank box instead. A real flag image renders identically everywhere,
// so this uses flagcdn.com (free, no key/signup) instead of the emoji this
// component used up through 0.11.0.
function FlagIcon({ countryCode }: { countryCode: string }) {
  const code = countryCode.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/16x12/${code}.png`}
      srcSet={`https://flagcdn.com/32x24/${code}.png 2x`}
      width={16}
      height={12}
      alt=""
      className="inline-block align-middle mr-1.5 rounded-[2px]"
    />
  );
}

// Free address autocomplete backed by OpenStreetMap/Nominatim - a plain
// `.input-field` input plus a suggestions dropdown. Meant to sit inside a
// consumer's own field/label wrapper like the plain `<input>` it replaces -
// it renders no label itself, just the input, dropdown and attribution line
// Nominatim's usage policy requires.
export function AddressAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
  disabled,
  className = '',
  debounceMs = 400,
  countryCodes,
  userAgent,
  searchingLabel = 'Searching…',
  attributionLabel = 'Data from OpenStreetMap contributors',
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  // -1 means "nothing highlighted yet" - arrow keys move this before Enter
  // commits it, same as a native <select> or any combobox.
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (!focused) {
      // Selecting a suggestion (or blurring) sets focused false while a
      // search might still be in flight - without this, the cleanup below
      // only marks that call cancelled, and nothing was left to ever turn
      // the spinner back off.
      setLoading(false);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      const results = await searchAddress(value, { countryCodes, userAgent });
      if (!cancelled) {
        setSuggestions(results);
        setHighlightedIndex(-1);
        setLoading(false);
      }
    }, debounceMs);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused, countryCodes, userAgent, debounceMs]);

  function selectSuggestion(s: AddressSuggestion) {
    onSelect(s);
    setSuggestions([]);
    setHighlightedIndex(-1);
    setFocused(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      // Only hijack Enter once a suggestion is actually highlighted - with
      // nothing highlighted, Enter should submit the form like normal.
      if (highlightedIndex < 0) return;
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        data-1p-ignore
        className={`input-field ${className}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        // A blur that fires because the user clicked a suggestion below
        // would otherwise close the dropdown before that click's own
        // onClick ever runs - the timeout lets the click land first.
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
      />
      {loading && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{searchingLabel}</p>}

      {focused && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-(--premium-dark-grey) shadow-lg">
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              id={`${id ?? 'address-autocomplete'}-option-${i}`}
              type="button"
              role="option"
              aria-selected={i === highlightedIndex}
              onMouseEnter={() => setHighlightedIndex(i)}
              onClick={() => selectSuggestion(s)}
              className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 transition ${
                i === highlightedIndex ? 'bg-gray-50 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'
              } ${i < suggestions.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}
            >
              {s.countryCode && <FlagIcon countryCode={s.countryCode} />}
              {s.displayName}
            </button>
          ))}
        </div>
      )}

      {/* Nominatim's own usage policy requires this attribution. */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{attributionLabel}</p>
    </div>
  );
}
