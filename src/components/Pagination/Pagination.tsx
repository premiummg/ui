import { ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// The page size that stands for "show everything": a list asks its source for this many rows, which is more than any
// table here holds. Put it in pageSizeOptions and it reads as allLabel.
export const PAGE_SIZE_ALL = 5000;

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
  // fixed limit the caller controls, no selector rendered). The selector always ends with "All" (PAGE_SIZE_ALL).
  pageSizeOptions?: number[];
  onPageSizeChange?: (limit: number) => void;
  pageSizeLabel?: string;
  // What PAGE_SIZE_ALL reads as in the selector.
  allLabel?: string;
}

export function Pagination({
  page, totalPages, total, limit, onPageChange, children,
  ofLabel = 'of', prevLabel = 'Previous page', nextLabel = 'Next page',
  pageSizeOptions = [20, 50, 100], onPageSizeChange, pageSizeLabel = 'per page', allLabel = 'All',
}: PaginationProps) {
  // A table that lets the reader pick a size can always show everything: the "All" option closes the list.
  const sizes = pageSizeOptions.includes(PAGE_SIZE_ALL) ? pageSizeOptions : [...pageSizeOptions, PAGE_SIZE_ALL];
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
              {sizes.map((n) => (
                <option key={n} value={n}>{n === PAGE_SIZE_ALL ? allLabel : n}</option>
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
