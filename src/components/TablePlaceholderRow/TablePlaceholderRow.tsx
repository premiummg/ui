import { ReactNode } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export type TablePlaceholderRowSize = 'sm' | 'md' | 'lg';

// icon size + text size per step. sm/md are both real - the app's own
// inline spinners run 14-15px next to a refresh button and 18px next to a
// bigger loading table, which is what md matches. lg (24px, text-base) has
// no real spot yet - it's one step extrapolated from the other two, for a
// placeholder standing in for more than a single table (e.g. a whole
// section still loading).
const SIZE: Record<TablePlaceholderRowSize, { icon: number; text: string }> = {
  sm: { icon: 14, text: 'text-xs' },
  md: { icon: 18, text: 'text-sm' },
  lg: { icon: 24, text: 'text-base' },
};

export interface TablePlaceholderRowProps {
  colSpan: number;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  size?: TablePlaceholderRowSize;
  children?: ReactNode;
}

export function TablePlaceholderRow({
  colSpan,
  loading = false,
  loadingText = 'Loading…',
  emptyText = 'No results found',
  size = 'md',
  children,
}: TablePlaceholderRowProps) {
  const { icon, text } = SIZE[size];
  return (
    <tr>
      <td colSpan={colSpan} className={`px-4 py-10 text-center text-gray-400 ${text}`}>
        {loading ? (
          // Same spinning FiRefreshCw the app already hand-rolls next to a
          // loading table (PurchaseOrdersPage, ProjectsPage, ...) - here
          // once instead of copied inline at every table that uses this row.
          <span className="inline-flex flex-col items-center gap-2">
            <FiRefreshCw size={icon} className="animate-spin opacity-50" />
            <span>{loadingText}</span>
          </span>
        ) : (children ?? emptyText)}
      </td>
    </tr>
  );
}
