import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

export type SortDir = 'asc' | 'desc';

export interface SortableColumnHeaderProps {
  col: string;
  label: string;
  sortBy: string;
  sortDir: SortDir;
  onSort: (col: string) => void;
  className?: string;
}

export function SortableColumnHeader({ col, label, sortBy, sortDir, onSort, className = '' }: SortableColumnHeaderProps) {
  const active = sortBy === col;
  return (
    <th className={`px-4 py-3 ${className}`}>
      <button
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 pmg-eyebrow transition ${active ? 'text-(--premium-red)' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
      >
        {label}
        <span className="inline-flex flex-col -space-y-1">
          <FiChevronUp size={11} className={active && sortDir === 'asc' ? 'text-(--premium-red)' : 'opacity-30'} />
          <FiChevronDown size={11} className={active && sortDir === 'desc' ? 'text-(--premium-red)' : 'opacity-30'} />
        </span>
      </button>
    </th>
  );
}
