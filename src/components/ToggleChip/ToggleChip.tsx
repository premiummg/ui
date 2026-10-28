import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

export interface ToggleChipProps {
  icon: IconType;
  label: string;
  active: boolean;
  // Omit for a read only indicator (it follows other state, it is not a switch).
  onClick?: () => void;
  title?: string;
  children?: ReactNode;
}

// The outlined pill with an icon used for on/off switches in a row of options
// (Lunch, Mileage) and for read only indicators that light up from other state.
// Highlighted in the brand red when active.
export function ToggleChip({ icon: Icon, label, active, onClick, title, children }: ToggleChipProps) {
  const readOnly = !onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      aria-disabled={readOnly || undefined}
      tabIndex={readOnly ? -1 : undefined}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition select-none ${
        readOnly ? 'cursor-default ' : ''
      }${
        active ? 'text-white border-transparent' : `border-gray-200 dark:border-white/20 text-gray-500 dark:text-gray-400 ${readOnly ? '' : 'hover:border-gray-400'}`
      }`}
      style={active ? { backgroundColor: 'var(--premium-red)' } : {}}
    >
      <Icon size={14} /> {label}
      {children}
    </button>
  );
}
