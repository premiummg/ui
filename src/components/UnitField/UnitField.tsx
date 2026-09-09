import { useState } from 'react';

export const DEFAULT_UNIT_OPTIONS = ['pcs', 'boxes', 'bags', 'rolls', 'sheets', 'lbs', 'kg', 'ft', 'gal', 'hrs'];
const OTHER_SENTINEL = '__other__';

export interface UnitFieldProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  disabled?: boolean;
  // Defaults to a common set of physical units (materials/purchase-order
  // line items). Pass your own list to reuse the same "pick one, or type
  // something else" behavior for any other closed-but-extensible list.
  options?: string[];
  // Displays every option (and the typed-custom value) title-cased, without
  // changing the stored value itself - for a list of options stored
  // lowercase (like role/status elsewhere) that should still read as normal
  // words rather than shouting or all-lowercase. Defaults on; pass `false`
  // for a list of abbreviations (kg, ft, gal) that read oddly capitalized.
  capitalize?: boolean;
}

// A <select> that also accepts a value outside its own list: picking "Other…"
// swaps it for a plain text input (auto-focused), with a "back to list"
// button that returns to the dropdown - value isn't lost, just re-typed.
export function UnitField({ value, onChange, className, disabled, options = DEFAULT_UNIT_OPTIONS, capitalize = true }: UnitFieldProps) {
  const [justPickedOther, setJustPickedOther] = useState(false);
  const isCustom = justPickedOther || (value !== '' && !options.includes(value));
  const fieldClassName = `${className ?? ''} ${capitalize ? 'capitalize' : ''}`.trim();

  if (isCustom) {
    return (
      <div className="flex gap-1 items-center">
        <input
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          className={fieldClassName}
          placeholder="Type unit…"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => { setJustPickedOther(false); onChange(options[0] ?? ''); }}
          title="Back to list"
          disabled={disabled}
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↩
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={e => {
        if (e.target.value === OTHER_SENTINEL) { setJustPickedOther(true); onChange(''); }
        else onChange(e.target.value);
      }}
      className={fieldClassName}
      disabled={disabled}
    >
      {options.map(u => <option key={u} value={u}>{u}</option>)}
      <option value={OTHER_SENTINEL}>Other…</option>
    </select>
  );
}
