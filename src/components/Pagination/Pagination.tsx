import { ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  children?: ReactNode;
  // Text overrides - e.g. translated copy for a localized consumer. Each
  // defaults to the English copy.
  ofLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
  // Page-size control - omit onPageSizeChange to keep today's behavior (a
  // fixed limit the caller controls, no selector rendered).
  pageSizeOptions?: number[];
  onPageSizeChange?: (limit: number) => void;
  pageSizeLabel?: string;
}

export function Pagination({
  page, totalPages, total, limit, onPageChange, children,
  ofLabel = 'of', prevLabel = 'Previous page', nextLabel = 'Next page',
  pageSizeOptions = [20, 50, 100], onPageSizeChange, pageSizeLabel = 'per page',
}: PaginationProps) {
  if (totalPages <= 1 && !children && !onPageSizeChange) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/10">
      {/* Every number a user reads as data is Montserrat with tabular numerals
          (pg. 14) - .pmg-figure applies that. */}
      <p className="text-xs text-gray-400 flex items-center">
        <span>
          <span className="pmg-figure text-gray-600 dark:text-gray-300">{from}</span>
          {'–'}
          <span className="pmg-figure text-gray-600 dark:text-gray-300">{to}</span>
          {` ${ofLabel} `}
          <span className="pmg-figure text-gray-600 dark:text-gray-300">{total}</span>
        </span>
        {children && <span className="ml-3">{children}</span>}
        {onPageSizeChange && (
          <span className="ml-3 flex items-center gap-1.5">
            <select
              value={limit}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label={pageSizeLabel}
              className="rounded-lg border-0 bg-gray-100 py-1 pl-2 pr-6 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-white/10 dark:text-gray-300 dark:[color-scheme:dark]"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {pageSizeLabel}
          </span>
        )}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label={prevLabel}
            title={prevLabel}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <FiChevronLeft size={14} />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label={nextLabel}
            title={nextLabel}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
