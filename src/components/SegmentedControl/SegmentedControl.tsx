import { useEffect, useRef } from 'react';
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
  // 'onColor' for a control that sits on a solid brand-colour band (the page header): translucent white track, the
  // chosen option filled white. Default is for a plain white or dark surface.
  tone?: 'default' | 'onColor';
}

// A row of two or three mutually-exclusive choices where each one changes
// what else on the form is needed - "which side is picked decides whether a
// field appears below", worth reading at a glance rather than as two
// checkboxes that were really one choice. Not a tab list (nothing else on
// the page changes view) and not a radio group (there's no need for
// keyboard arrow-key semantics beyond plain tab/click).
export function SegmentedControl<T extends string>({ options, value, onChange, className = '', tone = 'default' }: SegmentedControlProps<T>) {
  const onColor = tone === 'onColor';
  // In a row that scrolls (a phone), the chosen option is brought into view instead of staying off to one side.
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ inline: 'nearest', block: 'nearest' });
  }, [value]);
  return (
    // max-w-full + overflow-x-auto: a row with more options than a phone is wide scrolls inside its own box instead of
    // pushing the whole page wider than the screen.
    <div className={`inline-flex max-w-full overflow-x-auto rounded-lg p-0.5 ${onColor ? 'bg-white/15' : 'border border-gray-200 dark:border-white/20'} ${className}`}>
      {options.map(opt => {
        const Icon = opt.icon;
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            ref={selected ? selectedRef : undefined}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-heading font-bold transition ${
              onColor
                ? (selected ? 'bg-white' : 'text-white/70 hover:text-white')
                : (selected ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5')
            }`}
            style={selected ? (onColor ? { color: 'var(--premium-red-dark)' } : { backgroundColor: 'var(--premium-red)' }) : {}}
          >
            {Icon && <Icon size={13} />} {opt.label}
          </button>
        );
      })}
    </div>
  );
}
