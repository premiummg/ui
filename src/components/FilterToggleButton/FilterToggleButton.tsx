import { FiSliders } from 'react-icons/fi';
import { useUiText } from '../../lib/i18n';

export interface FilterToggleButtonProps {
  // Whether the filter panel is open.
  open: boolean;
  // How many filters are applied: shown on the button, which stays red while any is on even with the panel closed.
  count?: number;
  onClick: () => void;
  // Defaults to the built-in "Filters" of the current language.
  label?: string;
  className?: string;
}

const TEXT = { en: { filters: 'Filters' }, fr: { filters: 'Filtres' } };

// The "Filters" button of a list toolbar, which every list page of both apps wrote by hand: outlined while nothing is
// filtered and the panel is closed, brand red with the number of filters applied otherwise.
export function FilterToggleButton({ open, count = 0, onClick, label, className = '' }: FilterToggleButtonProps) {
  const tx = useUiText(TEXT);
  const active = open || count > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={`inline-flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium border transition ${
        active
          ? 'border-transparent text-white'
          : 'border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
      } ${className}`}
      style={active ? { backgroundColor: 'var(--premium-red)' } : undefined}
    >
      <FiSliders size={14} />
      {label ?? tx.filters}
      {count > 0 && (
        <span className="bg-white/30 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>
      )}
    </button>
  );
}
