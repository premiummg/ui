import type { IconType } from 'react-icons';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: IconType;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}

// A row of two or three mutually-exclusive choices where each one changes
// what else on the form is needed - "which side is picked decides whether a
// field appears below", worth reading at a glance rather than as two
// checkboxes that were really one choice. Not a tab list (nothing else on
// the page changes view) and not a radio group (there's no need for
// keyboard arrow-key semantics beyond plain tab/click).
export function SegmentedControl<T extends string>({ options, value, onChange, className = '' }: SegmentedControlProps<T>) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 dark:border-white/20 p-0.5 ${className}`}>
      {options.map(opt => {
        const Icon = opt.icon;
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-bold transition ${
              selected ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
            style={selected ? { backgroundColor: 'var(--premium-red)' } : {}}
          >
            {Icon && <Icon size={13} />} {opt.label}
          </button>
        );
      })}
    </div>
  );
}
