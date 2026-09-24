import { FilterPill } from '../FilterPill';

// {value, label} pairs for id-keyed facets, where the display label can
// repeat across rows and only the id identifies the option (e.g. division,
// company, team names). Plain strings work when the value IS the label
// (role, status, app).
export interface EntityOption {
  value: string;
  label: string;
}

export interface FilterRowProps {
  label: string;
  options: Array<string | EntityOption>;
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  // Role/status values are stored lowercase and need title-casing for
  // display; real names (divisions, companies, departments) are already
  // cased correctly and would be mangled by it.
  capitalize?: boolean;
  labelWidth?: string;
  // Override for the "Clear" link text - e.g. a translated string for a
  // localized consumer. Defaults to the English word.
  clearLabel?: string;
}

// A label, a row of toggleable pills, and a "Clear" link once anything is
// selected. Renders nothing when there are no options - every caller derives
// its options from the current result set, so an empty list means the facet
// has nothing to offer.
export function FilterRow({
  label,
  options,
  selected,
  onToggle,
  onClear,
  capitalize = false,
  labelWidth = 'w-20',
  clearLabel = 'Clear',
}: FilterRowProps) {
  if (!options.length) return null;
  const opts = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`text-xs font-semibold text-gray-400 ${labelWidth} shrink-0`}>{label}</span>
      {opts.map(opt => (
        <FilterPill
          key={opt.value}
          label={opt.label}
          active={selected.includes(opt.value)}
          onClick={() => onToggle(opt.value)}
          className={capitalize ? 'capitalize' : ''}
        />
      ))}
      {selected.length > 0 && (
        <button onClick={onClear} className="text-xs text-gray-400 underline hover:text-gray-600 dark:hover:text-gray-200">
          {clearLabel}
        </button>
      )}
    </div>
  );
}
