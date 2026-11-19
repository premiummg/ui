import { useState } from 'react';
import { useUiText } from '../../lib/i18n';

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
  // changing the stored value itself ("pcs" is stored, "Pcs" is shown). On by
  // default, as the screens of the apps were built around it (it was off for a
  // few versions, and "Pcs/Boxes" read as "pcs/boxes" there). Pass false for a
  // list that must show exactly as stored.
  capitalize?: boolean;
  // Text overrides - e.g. translated copy for a localized consumer. Each
  // defaults to the English copy.
  typeLabel?: string;
  backLabel?: string;
  otherLabel?: string;
}

// A <select> that also accepts a value outside its own list: picking "Other…"
// swaps it for a plain text input (auto-focused), with a "back to list"
// button that returns to the dropdown - value isn't lost, just re-typed.
const TEXT = {
  en: { type: 'Type unit…', back: 'Back to list', other: 'Other…' },
  fr: { type: 'Saisir une unité…', back: 'Retour à la liste', other: 'Autre…' },
};

export function UnitField({
  value, onChange, className, disabled, options = DEFAULT_UNIT_OPTIONS, capitalize = true,
  typeLabel: typeIn, backLabel: backIn, otherLabel: otherIn,
}: UnitFieldProps) {
  const tx = useUiText(TEXT);
  const typeLabel = typeIn ?? tx.type, backLabel = backIn ?? tx.back, otherLabel = otherIn ?? tx.other;
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
          placeholder={typeLabel}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => { setJustPickedOther(false); onChange(options[0] ?? ''); }}
          title={backLabel}
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
      {/* While nothing is chosen there is a blank option to land on: without it the browser shows the first unit as if it
          were selected while the value is still empty. */}
      {value === '' && <option value="" />}
      {options.map(u => <option key={u} value={u}>{u}</option>)}
      <option value={OTHER_SENTINEL}>{otherLabel}</option>
    </select>
  );
}
