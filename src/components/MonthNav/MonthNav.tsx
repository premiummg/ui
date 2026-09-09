import { useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useOutsideClick } from '../../hooks/useOutsideClick';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS_PER_PAGE = 12;

export interface MonthNavProps {
  // null = current month; 'YYYY-MM' = a specific past month.
  value: string | null;
  // If provided, restrict the picker to these months (sorted desc).
  months?: string[];
  fetching?: boolean;
  onChange: (month: string | null) => void;
  // 'hero' is white-on-transparent, for sitting directly on a bold solid-color
  // field instead of a white/dark card. Only the trigger row changes - the
  // dropdown itself is always a normal light/dark card, since it floats over
  // whatever page content sits below the field.
  variant?: 'default' | 'hero';
}

type View = 'months' | 'years';

function getCurYM() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function toYM(year: number, monthIdx: number) {
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
}

function formatLong(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function decadeStart(year: number) {
  return Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

export function MonthNav({ value, months, fetching = false, onChange, variant = 'default' }: MonthNavProps) {
  const cur = getCurYM();
  const displayYM = value ?? cur;
  const [displayYear] = displayYM.split('-').map(Number);

  const [open, setOpen]     = useState(false);
  const [view, setView]     = useState<View>('months');
  const [viewYear, setViewYear] = useState(displayYear);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => { setOpen(false); setView('months'); };

  useOutsideClick(containerRef, close, open);

  // ── Outer arrow buttons (month-by-month navigation) ─────────────────────────

  let canGoPrev: boolean;
  let canGoNext: boolean;

  if (months) {
    const selIdx = value ? months.indexOf(value) : -1;
    canGoPrev = value === null ? months.length > 0 : selIdx < months.length - 1;
    canGoNext = value !== null;
  } else {
    canGoPrev = true;
    canGoNext = value !== null;
  }

  const goPrev = () => {
    if (months) {
      const selIdx = value ? months.indexOf(value) : -1;
      if (value === null) onChange(months[0]);
      else if (selIdx < months.length - 1) onChange(months[selIdx + 1]);
    } else {
      onChange(shiftMonth(displayYM, -1));
    }
  };

  const goNext = () => {
    if (months) {
      const selIdx = value ? months.indexOf(value) : -1;
      onChange(selIdx === 0 ? null : months[selIdx - 1]);
    } else {
      const nxt = shiftMonth(displayYM, 1);
      onChange(nxt >= cur ? null : nxt);
    }
  };

  // ── Picker helpers ───────────────────────────────────────────────────────────

  const curYear = new Date().getFullYear();

  const isMonthAvailable = (year: number, idx: number) => {
    const ym = toYM(year, idx);
    if (ym > cur) return false;
    if (months && ym < cur && !months.includes(ym)) return false;
    return true;
  };

  const isMonthSelected = (year: number, idx: number) => {
    const ym = toYM(year, idx);
    return value === null ? ym === cur : value === ym;
  };

  const isCurrentMonth = (year: number, idx: number) => toYM(year, idx) === cur;

  const isYearAvailable = (year: number) => {
    if (year > curYear) return false;
    if (months) return months.some(m => parseInt(m.split('-')[0]) === year) || year === curYear;
    return true;
  };

  const isYearSelected = (year: number) => parseInt(displayYM.split('-')[0]) === year;

  const selectMonth = (year: number, idx: number) => {
    if (!isMonthAvailable(year, idx)) return;
    const ym = toYM(year, idx);
    onChange(ym >= cur ? null : ym);
    close();
  };

  const selectYear = (year: number) => {
    if (!isYearAvailable(year)) return;
    setViewYear(year);
    setView('months');
  };

  const openPicker = () => {
    if (fetching) return;
    setViewYear(displayYear);
    setView('months');
    setOpen(o => !o);
  };

  // Decade arrows in years view shift by a full page; year arrows in months view shift by 1
  const pgStart = decadeStart(viewYear);

  const handlePickerPrev = () => {
    if (view === 'years') setViewYear(y => decadeStart(y) - 1);
    else setViewYear(y => y - 1);
  };

  const handlePickerNext = () => {
    if (view === 'years') setViewYear(decadeStart(viewYear) + YEARS_PER_PAGE);
    else setViewYear(y => y + 1);
  };

  const pickerPrevDisabled = view === 'years'
    ? (months ? !months.some(m => parseInt(m.split('-')[0]) < pgStart) : pgStart <= 2020)
    : (months ? !months.some(m => parseInt(m.split('-')[0]) < viewYear) : viewYear <= 2020);

  const pickerNextDisabled = view === 'years'
    ? pgStart + YEARS_PER_PAGE > curYear
    : viewYear >= curYear;

  const headerLabel = view === 'years'
    ? `${pgStart} – ${pgStart + YEARS_PER_PAGE - 1}`
    : String(viewYear);

  const btnCls = 'w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed';
  const triggerBtnCls = variant === 'hero'
    ? 'w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition disabled:opacity-30 disabled:cursor-not-allowed'
    : btnCls;
  const triggerLabelCls = variant === 'hero'
    ? 'font-heading font-bold text-sm text-white min-w-[130px] text-center px-2 py-1 rounded-lg hover:bg-white/15 transition select-none'
    : 'text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[130px] text-center px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition select-none';

  return (
    // inline-block, not a bare block div: a plain <div> stretches to its
    // parent's full width unless that parent happens to be a flex/inline
    // row, and once it does, the picker's `right-0` below anchors to THIS
    // div's right edge rather than the compact prev/label/next row's own.
    <div ref={containerRef} className="relative inline-block">

      {/* Outer row: prev — label — next */}
      <div className={`flex items-center gap-1 ${variant === 'hero' ? 'bg-white/15 rounded-lg p-0.5' : ''}`}>
        <button onClick={goPrev} disabled={!canGoPrev || fetching} className={triggerBtnCls}>
          <FiChevronLeft size={14} />
        </button>
        <button onClick={openPicker} className={triggerLabelCls}>
          {fetching ? '…' : formatLong(displayYM)}
        </button>
        <button onClick={goNext} disabled={!canGoNext || fetching} className={triggerBtnCls}>
          <FiChevronRight size={14} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 right-0 w-60 bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">

          {/* Picker header — shared by both views */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <button onClick={handlePickerPrev} disabled={pickerPrevDisabled} className={btnCls}>
              <FiChevronLeft size={14} />
            </button>
            <button
              onClick={() => setView(v => v === 'months' ? 'years' : 'months')}
              className="text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-(--premium-red) dark:hover:text-red-400 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition select-none"
            >
              {headerLabel}
            </button>
            <button onClick={handlePickerNext} disabled={pickerNextDisabled} className={btnCls}>
              <FiChevronRight size={14} />
            </button>
          </div>

          {/* Months grid */}
          {view === 'months' && (
            <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
              {MONTH_LABELS.map((label, idx) => {
                const avail  = isMonthAvailable(viewYear, idx);
                const sel    = isMonthSelected(viewYear, idx);
                const todayM = isCurrentMonth(viewYear, idx);
                return (
                  <button
                    key={label}
                    onClick={() => selectMonth(viewYear, idx)}
                    disabled={!avail}
                    className={`
                      py-2 rounded-lg text-xs font-medium transition
                      ${!avail
                        ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                        : sel
                        ? 'text-white shadow-sm'
                        : todayM
                        ? 'text-(--premium-red) dark:text-red-400 ring-1 ring-(--premium-red)/40 dark:ring-red-500/40'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'}
                    `}
                    style={sel && avail ? { backgroundColor: 'var(--premium-red)' } : {}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Years grid */}
          {view === 'years' && (
            <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
              {Array.from({ length: YEARS_PER_PAGE }, (_, i) => pgStart + i).map(year => {
                const avail = isYearAvailable(year);
                const sel   = isYearSelected(year);
                const today = year === curYear;
                return (
                  <button
                    key={year}
                    onClick={() => selectYear(year)}
                    disabled={!avail}
                    className={`
                      py-2 rounded-lg text-xs font-medium transition
                      ${!avail
                        ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                        : sel
                        ? 'text-white shadow-sm'
                        : today
                        ? 'text-(--premium-red) dark:text-red-400 ring-1 ring-(--premium-red)/40 dark:ring-red-500/40'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'}
                    `}
                    style={sel && avail ? { backgroundColor: 'var(--premium-red)' } : {}}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
            <button
              onClick={() => { onChange(null); close(); }}
              disabled={value === null}
              className="text-xs font-semibold transition hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--premium-red)' }}
            >
              Current month
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
