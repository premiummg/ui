import { ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  children?: ReactNode;
}

export function Pagination({ page, totalPages, total, limit, onPageChange, children }: PaginationProps) {
  if (totalPages <= 1 && !children) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/10">
      {/* Every number a user reads as data is Montserrat with tabular numerals
          (pg. 14) - .pmg-figure applies that. */}
      <p className="text-xs text-gray-400">
        <span className="pmg-figure text-gray-600 dark:text-gray-300">{from}</span>
        {'–'}
        <span className="pmg-figure text-gray-600 dark:text-gray-300">{to}</span>
        {' of '}
        <span className="pmg-figure text-gray-600 dark:text-gray-300">{total}</span>
        {children && <span className="ml-3">{children}</span>}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            title="Previous page"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <FiChevronLeft size={14} />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
            title="Next page"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
