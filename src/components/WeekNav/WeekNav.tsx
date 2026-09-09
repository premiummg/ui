import { useState, useRef } from 'react';
import {
  format, startOfMonth, startOfWeek, endOfWeek, endOfMonth, addDays,
  addMonths, subMonths, isSameMonth, isAfter, parseISO, getYear, setYear, setMonth,
} from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export interface WeekNavProps {
  // null = current week; 'YYYY-MM-DD' = Monday of a specific week.
  value: string | null;
  // If provided (sorted desc), restrict nav/picker to these week-Mondays -
  // same convention as MonthNav's `months`.
  weeks?: string[];
  fetching?: boolean;
  onChange: (monday: string | null) => void;
  // Which edge the 288px dropdown hangs from. Defaults to 'right', which
  // suits a control sitting on the right of the page; a caller anchored near
  // the left edge (that would push the panel off-screen) passes 'left'.
  align?: 'left' | 'right';
  // 'hero' is white-on-transparent, for sitting directly on a bold solid-
  // color field instead of a white/dark card - same contract as MonthNav's,
  // for the common case of the two swapping places behind one Month/Week
  // switch. Only the trigger row changes: the dropdown is always a normal
  // card, since it floats over page content.
  variant?: 'default' | 'hero';
}

type View = 'weeks' | 'months' | 'years';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS_PER_PAGE = 12;

function mondayOf(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 });
}

function toStr(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function currentWeekMonday(): string {
  return toStr(mondayOf(new Date()));
}

function formatWeekRange(mondayStr: string): string {
  const mon = parseISO(mondayStr);
  return `${format(mon, 'MMM d')} – ${format(addDays(mon, 6), 'MMM d')}`;
}

function shiftWeek(mondayStr: string, deltaWeeks: number): string {
  return toStr(addDays(parseISO(mondayStr), deltaWeeks * 7));
}

function buildWeekRows(month: Date): Date[][] {
  const start = mondayOf(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const rows: Date[][] = [];
  let cur = start;
  while (cur <= end) {
    rows.push(Array.from({ length: 7 }, (_, i) => addDays(cur, i)));
    cur = addDays(cur, 7);
  }
  return rows;
}

function decadeStart(year: number) {
  return Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

export function WeekNav({ value, weeks, fetching = false, onChange, align = 'right', variant = 'default' }: WeekNavProps) {
  const cur = currentWeekMonday();
  const curYM = cur.slice(0, 7);
  const curYear = new Date().getFullYear();
  const displayMonday = value ?? cur;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('weeks');
  const [viewMonth, setViewMonth] = useState<Date>(() => parseISO(displayMonday));
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => { setOpen(false); setView('weeks'); };

  useOutsideClick(containerRef, close, open);

  // ── outer arrows: jump between available weeks, same pattern as MonthNav ───

  let canGoPrev: boolean;
  let canGoNext: boolean;

  if (weeks) {
    const idx = value ? weeks.indexOf(value) : -1;
    canGoPrev = value === null ? weeks.length > 0 : idx < weeks.length - 1;
    canGoNext = value !== null;
  } else {
    canGoPrev = true;
    canGoNext = value !== null;
  }

  const goPrev = () => {
    if (weeks) {
      const idx = value ? weeks.indexOf(value) : -1;
      if (value === null) { if (weeks.length) onChange(weeks[0]); }
      else if (idx < weeks.length - 1) onChange(weeks[idx + 1]);
    } else {
      onChange(shiftWeek(displayMonday, -1));
    }
  };

  const goNext = () => {
    if (weeks) {
      const idx = value ? weeks.indexOf(value) : -1;
      onChange(idx <= 0 ? null : weeks[idx - 1]);
    } else {
      const nxt = shiftWeek(displayMonday, 1);
      onChange(nxt >= cur ? null : nxt);
    }
  };

  // ── weeks view ───────────────────────────────────────────────────────────────

  const openPicker = () => {
    if (fetching) return;
    setViewMonth(parseISO(displayMonday));
    setView('weeks');
    setOpen(o => !o);
  };

  const isWeekAvailable = (monday: Date) => {
    const mstr = toStr(monday);
    if (mstr > cur) return false;
    if (weeks && mstr < cur && !weeks.includes(mstr)) return false;
    return true;
  };

  const isWeekSelected = (monday: Date) => toStr(monday) === displayMonday;
  const isCurrentWeek = (monday: Date) => toStr(monday) === cur;

  const selectWeek = (monday: Date) => {
    if (!isWeekAvailable(monday)) return;
    const mstr = toStr(monday);
    onChange(mstr >= cur ? null : mstr);
    close();
  };

  const handlePrevMonth = () => setViewMonth(m => subMonths(m, 1));
  const handleNextMonth = () => setViewMonth(m => addMonths(m, 1));
  const nextMonthDisabled = isSameMonth(viewMonth, new Date()) || isAfter(viewMonth, new Date());

  // ── months / years views - same jump-to-month affordance as MonthNav, but
  // picking a month here just moves the weeks-view calendar there instead of
  // completing the selection, since the user still needs to pick a week. ──────

  const monthYM = (year: number, idx: number) => `${year}-${String(idx + 1).padStart(2, '0')}`;

  const isMonthAvailable = (year: number, idx: number) => {
    const ym = monthYM(year, idx);
    if (ym > curYM) return false;
    if (weeks && ym < curYM) return weeks.some(w => w.startsWith(ym));
    return true;
  };

  const isMonthSelected = (year: number, idx: number) => monthYM(year, idx) === format(viewMonth, 'yyyy-MM');
  const isCurrentMonth = (year: number, idx: number) => monthYM(year, idx) === curYM;

  const isYearAvailable = (year: number) => {
    if (year > curYear) return false;
    if (weeks) return weeks.some(w => parseInt(w.split('-')[0], 10) === year) || year === curYear;
    return true;
  };
  const isYearSelected = (year: number) => getYear(viewMonth) === year;

  const selectMonth = (year: number, idx: number) => {
    if (!isMonthAvailable(year, idx)) return;
    setViewMonth(m => setMonth(setYear(m, year), idx));
    setView('weeks');
  };

  const selectYear = (year: number) => {
    if (!isYearAvailable(year)) return;
    setViewMonth(m => setYear(m, year));
    setView('months');
  };

  const pgStart = decadeStart(getYear(viewMonth));

  const handlePickerPrev = () => {
    if (view === 'weeks') return handlePrevMonth();
    if (view === 'months') setViewMonth(m => setYear(m, getYear(m) - 1));
    else setViewMonth(m => setYear(m, decadeStart(getYear(m)) - 1));
  };
  const handlePickerNext = () => {
    if (view === 'weeks') return handleNextMonth();
    if (view === 'months') setViewMonth(m => setYear(m, getYear(m) + 1));
    else setViewMonth(m => setYear(m, decadeStart(getYear(m)) + YEARS_PER_PAGE));
  };

  const pickerPrevDisabled = view === 'weeks'
    ? false
    : view === 'months'
    ? (weeks ? !weeks.some(w => parseInt(w.split('-')[0], 10) < getYear(viewMonth)) : getYear(viewMonth) <= 2020)
    : (weeks ? !weeks.some(w => parseInt(w.split('-')[0], 10) < pgStart) : pgStart <= 2020);

  const pickerNextDisabled = view === 'weeks'
    ? nextMonthDisabled
    : view === 'months'
    ? getYear(viewMonth) >= curYear
    : pgStart + YEARS_PER_PAGE > curYear;

  const headerLabel =
    view === 'weeks'  ? format(viewMonth, 'MMMM yyyy') :
    view === 'months' ? String(getYear(viewMonth)) :
    `${pgStart} – ${pgStart + YEARS_PER_PAGE - 1}`;

  const handleHeaderClick = () => {
    if (view === 'weeks') setView('months');
    else if (view === 'months') setView('years');
    // years view header isn't clickable further - matches MonthNav
  };

  const btnCls = 'w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed';
  const gridBtnCls = (avail: boolean, sel: boolean, today: boolean) => `
    py-2 rounded-lg text-xs font-medium transition
    ${!avail
      ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
      : sel
      ? 'text-white shadow-sm'
      : today
      ? 'text-(--premium-red) dark:text-red-400 ring-1 ring-(--premium-red)/40 dark:ring-red-500/40'
      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'}
  `;

  const triggerBtnCls = variant === 'hero'
    ? 'w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition disabled:opacity-30 disabled:cursor-not-allowed'
    : btnCls;
  const triggerLabelCls = variant === 'hero'
    ? 'font-heading font-bold text-sm text-white min-w-[130px] text-center px-2 py-1 rounded-lg hover:bg-white/15 transition select-none'
    : 'text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[130px] text-center px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition select-none';

  const rows = buildWeekRows(viewMonth);

  return (
    // inline-block, not a bare block div - see MonthNav's identical comment:
    // a plain <div> stretches to its parent's full width outside a flex/
    // inline context, which pulls the picker's `right-0` away from the
    // compact prev/label/next row and toward this div's own stretched edge.
    <div ref={containerRef} className="relative inline-block">

      {/* Outer row: prev — label — next */}
      <div className={`flex items-center gap-1 ${variant === 'hero' ? 'bg-white/15 rounded-lg p-0.5' : ''}`}>
        <button onClick={goPrev} disabled={!canGoPrev || fetching} className={triggerBtnCls}>
          <FiChevronLeft size={14} />
        </button>
        <button onClick={openPicker} className={triggerLabelCls}>
          {fetching ? '…' : formatWeekRange(displayMonday)}
        </button>
        <button onClick={goNext} disabled={!canGoNext || fetching} className={triggerBtnCls}>
          <FiChevronRight size={14} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className={`absolute z-50 mt-2 ${align === 'left' ? 'left-0' : 'right-0'} w-72 bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden`}>

          {/* Picker header - shared by all three views, click cycles weeks -> months -> years */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <button onClick={handlePickerPrev} disabled={pickerPrevDisabled} className={btnCls}>
              <FiChevronLeft size={14} />
            </button>
            <button
              onClick={handleHeaderClick}
              disabled={view === 'years'}
              className="text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-(--premium-red) dark:hover:text-red-400 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition select-none disabled:hover:text-gray-800 dark:disabled:hover:text-gray-100 disabled:cursor-default"
            >
              {headerLabel}
            </button>
            <button onClick={handlePickerNext} disabled={pickerNextDisabled} className={btnCls}>
              <FiChevronRight size={14} />
            </button>
          </div>

          {/* Weeks view - a month calendar grid where a whole row (week) is the selectable unit */}
          {view === 'weeks' && (
            <div className="px-3 pb-3">
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-300 dark:text-gray-600 py-1 tracking-wide uppercase">
                    {d}
                  </div>
                ))}
              </div>
              <div className="space-y-0.5">
                {rows.map((row, ri) => {
                  const monday = row[0];
                  const avail = isWeekAvailable(monday);
                  const sel = isWeekSelected(monday);
                  const todayWeek = isCurrentWeek(monday);
                  return (
                    <button
                      key={ri}
                      onClick={() => selectWeek(monday)}
                      disabled={!avail}
                      className={`
                        w-full grid grid-cols-7 rounded-lg py-1 transition
                        ${!avail
                          ? 'cursor-not-allowed'
                          : sel
                          ? 'shadow-sm'
                          : todayWeek
                          ? 'ring-1 ring-(--premium-red)/40 dark:ring-red-500/40'
                          : 'hover:bg-gray-100 dark:hover:bg-white/5'}
                      `}
                      style={sel && avail ? { backgroundColor: 'var(--premium-red)' } : {}}
                    >
                      {row.map((day, di) => {
                        const inMonth = isSameMonth(day, viewMonth);
                        return (
                          <span
                            key={di}
                            className={`
                              text-xs font-medium text-center
                              ${!avail
                                ? 'text-gray-200 dark:text-gray-700'
                                : sel
                                ? 'text-white'
                                : todayWeek
                                ? 'text-(--premium-red) dark:text-red-400'
                                : inMonth
                                ? 'text-gray-700 dark:text-gray-200'
                                : 'text-gray-300 dark:text-gray-600'}
                            `}
                          >
                            {format(day, 'd')}
                          </span>
                        );
                      })}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Months view - picking a month jumps the weeks-view calendar there,
              it does not complete the selection (the user still needs a week). */}
          {view === 'months' && (
            <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
              {MONTH_LABELS.map((label, idx) => {
                const year = getYear(viewMonth);
                const avail = isMonthAvailable(year, idx);
                const sel = isMonthSelected(year, idx);
                const today = isCurrentMonth(year, idx);
                return (
                  <button
                    key={label}
                    onClick={() => selectMonth(year, idx)}
                    disabled={!avail}
                    className={gridBtnCls(avail, sel, today)}
                    style={sel && avail ? { backgroundColor: 'var(--premium-red)' } : {}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Years view */}
          {view === 'years' && (
            <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
              {Array.from({ length: YEARS_PER_PAGE }, (_, i) => pgStart + i).map(year => {
                const avail = isYearAvailable(year);
                const sel = isYearSelected(year);
                const today = year === curYear;
                return (
                  <button
                    key={year}
                    onClick={() => selectYear(year)}
                    disabled={!avail}
                    className={gridBtnCls(avail, sel, today)}
                    style={sel && avail ? { backgroundColor: 'var(--premium-red)' } : {}}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
            <button
              onClick={() => { onChange(null); close(); }}
              disabled={value === null}
              className="text-xs font-semibold transition hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--premium-red)' }}
            >
              Current week
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
