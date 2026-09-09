export interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

export function FilterPill({ label, active, onClick, className = '' }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
        active
          ? 'border-transparent text-white shadow-sm'
          : 'border-gray-200 dark:border-white/20 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/40'
      } ${className}`}
      style={active ? { backgroundColor: 'var(--premium-red)' } : {}}
    >
      {label}
    </button>
  );
}
