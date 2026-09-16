import { useState, useMemo } from 'react';
import {
  format, startOfMonth, startOfWeek, addDays, addMonths, subMonths,
  isSameDay, isSameMonth, parseISO, isValid, endOfWeek, endOfMonth,
  setMonth, setYear, getYear, getMonth, isAfter, isBefore, startOfDay,
} from 'date-fns';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { usePopover } from '../../hooks/usePopover';
import { POPOVER_PANEL } from '../../lib/popoverPanel';

export interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
  // 'yyyy-MM-dd' - already taken, shown struck-through and unselectable.
  unavailableDates?: string[];
}

type View = 'days' | 'months' | 'years';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS_PER_PAGE = 12;

function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days: Date[] = [];
  let cur = start;
  while (cur <= end) { days.push(cur); cur = addDays(cur, 1); }
  return days;
}

function yearPageStart(year: number) {
  return Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

export function DatePicker({ value, onChange, disabled, placeholder = 'Select date', id, className = '', maxDate, minDate, unavailableDates }: DatePickerProps) {
  const [view, setView] = useState<View>('days');
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const p = value ? parseISO(value) : null;
    return p && isValid(p) ? p : new Date();
  });
  const { open, setOpen, ref: containerRef } = usePopover<HTMLDivElement>(() => setView('days'));

  const selected: Date | null = value && isValid(parseISO(value)) ? parseISO(value) : null;
  const today = new Date();
  const yearStart = yearPageStart(getYear(viewMonth));

  const unavailableSet = unavailableDates ? new Set(unavailableDates) : null;
  function isDayUnavailable(day: Date) {
    return unavailableSet ? unavailableSet.has(format(day, 'yyyy-MM-dd')) : false;
  }
  function isDayDisabled(day: Date) {
    if (maxDate && isAfter(startOfDay(day), startOfDay(maxDate))) return true;
    if (minDate && isBefore(startOfDay(day), startOfDay(minDate))) return true;
    if (isDayUnavailable(day)) return true;
    return false;
  }
  function isMonthDisabled(idx: number) {
    const y = getYear(viewMonth);
    if (maxDate && (y > getYear(maxDate) || (y === getYear(maxDate) && idx > getMonth(maxDate)))) return true;
    if (minDate && (y < getYear(minDate) || (y === getYear(minDate) && idx < getMonth(minDate)))) return true;
    return false;
  }
  function isYearDisabled(year: number) {
    if (maxDate && year > getYear(maxDate)) return true;
    if (minDate && year < getYear(minDate)) return true;
    return false;
  }
  // Compares (year, month) as a single ordinal so the boundary check holds
  // across year edges too - separate year/month comparisons ANDed together
  // (the previous approach) only work while viewMonth and the min/maxDate
  // share a year, and silently flip to "enabled" once viewMonth is paged
  // into a different year than the bound.
  const ym = (d: Date) => getYear(d) * 12 + getMonth(d);
  const nextDisabled =
    view === 'days'   ? (maxDate ? ym(viewMonth) >= ym(maxDate) : false) :
    view === 'months' ? (maxDate ? getYear(viewMonth) >= getYear(maxDate) : false) :
    (maxDate ? yearStart + YEARS_PER_PAGE > getYear(maxDate) : false);
  const prevDisabled =
    view === 'days'   ? (minDate ? ym(viewMonth) <= ym(minDate) : false) :
    view === 'months' ? (minDate ? getYear(viewMonth) <= getYear(minDate) : false) :
    (minDate ? yearStart <= yearPageStart(getYear(minDate)) : false);


  function toggle() {
    if (disabled) return;
    if (!open && selected) setViewMonth(selected);
    setOpen(o => !o);
    if (open) setView('days');
  }

  function selectDay(day: Date) {
    onChange(format(day, 'yyyy-MM-dd'));
    setOpen(false);
    setView('days');
  }

  function selectMonth(monthIdx: number) {
    setViewMonth(m => setMonth(m, monthIdx));
    setView('days');
  }

  function selectYear(year: number) {
    setViewMonth(m => setYear(m, year));
    setView('months');
  }

  function handlePrev() {
    if (view === 'days')   setViewMonth(m => subMonths(m, 1));
    if (view === 'months') setViewMonth(m => setYear(m, getYear(m) - 1));
    if (view === 'years')  setViewMonth(m => setYear(m, getYear(m) - YEARS_PER_PAGE));
  }

  function handleNext() {
    if (view === 'days')   setViewMonth(m => addMonths(m, 1));
    if (view === 'months') setViewMonth(m => setYear(m, getYear(m) + 1));
    if (view === 'years')  setViewMonth(m => setYear(m, getYear(m) + YEARS_PER_PAGE));
  }

  function handleHeaderClick() {
    setView(v => v === 'days' ? 'months' : v === 'months' ? 'years' : 'years');
  }

  // Memoized on viewMonth - otherwise this calendar-grid math reruns on
  // every render while the dropdown happens to be open, not just when
  // viewMonth actually changes.
  const calendarDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);

  const headerLabel =
    view === 'days'   ? format(viewMonth, 'MMMM yyyy') :
    view === 'months' ? format(viewMonth, 'yyyy') :
    `${yearStart} – ${yearStart + YEARS_PER_PAGE - 1}`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>

      {/* Trigger */}
      <button
        id={id}
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm
          border bg-white dark:bg-(--premium-dark-grey) transition-all duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${open
            ? 'border-(--premium-red) ring-2 ring-(--premium-red)/20'
            : 'border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30'}
        `}
      >
        <span className={`truncate ${selected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
          {selected ? format(selected, 'MMM d, yyyy') : placeholder}
        </span>
        <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 shrink-0">
          {selected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={e => { e.stopPropagation(); onChange(''); }}
              onKeyDown={e => e.key === 'Enter' && onChange('')}
              className="p-0.5 rounded-lg hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <FiX size={12} />
            </span>
          )}
          <FiCalendar size={13} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute mt-2 left-0 w-72 bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 ${POPOVER_PANEL} overflow-hidden`}>

          {/* Month/year nav */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={prevDisabled}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleHeaderClick}
              className="text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-(--premium-red) dark:hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 select-none"
            >
              {headerLabel}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={nextDisabled}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <FiChevronRight size={14} />
            </button>
          </div>

          {/* Days view */}
          {view === 'days' && (
            <div className="px-3 pb-3">
              {/* Day labels */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-300 dark:text-gray-600 py-1 tracking-wide uppercase">
                    {d}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {calendarDays.map((day, i) => {
                  const isSel    = selected ? isSameDay(day, selected) : false;
                  const isT      = isSameDay(day, today);
                  const inMonth  = isSameMonth(day, viewMonth);
                  const unavail  = isDayUnavailable(day);
                  const isFuture = isDayDisabled(day);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isFuture}
                      onClick={() => !isFuture && selectDay(day)}
                      title={unavail ? 'Already submitted' : undefined}
                      className={`
                        w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-100
                        ${unavail
                          ? 'text-gray-400 dark:text-gray-500 line-through decoration-gray-300 dark:decoration-gray-600 cursor-not-allowed'
                          : isFuture
                          ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                          : isSel
                          ? 'text-white shadow-sm'
                          : isT
                          ? 'text-(--premium-red) dark:text-red-400 font-semibold ring-1 ring-(--premium-red)/40 dark:ring-red-500/40'
                          : inMonth
                          ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                          : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-white/5'}
                      `}
                      style={isSel && !isFuture ? { backgroundColor: 'var(--premium-red)' } : {}}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Months view */}
          {view === 'months' && (
            <div className="grid grid-cols-3 gap-1.5 px-4 pb-4">
              {MONTH_LABELS.map((label, idx) => {
                const isSel    = selected && isSameMonth(selected, setMonth(viewMonth, idx)) && getYear(selected) === getYear(viewMonth);
                const isT      = isSameMonth(today, setMonth(viewMonth, idx)) && getYear(today) === getYear(viewMonth);
                const isFuture = isMonthDisabled(idx);
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={isFuture}
                    onClick={() => !isFuture && selectMonth(idx)}
                    className={`
                      py-2 rounded-lg text-xs font-medium transition
                      ${isFuture
                        ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                        : isSel
                        ? 'text-white shadow-sm'
                        : isT
                        ? 'text-(--premium-red) dark:text-red-400 ring-1 ring-(--premium-red)/40'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'}
                    `}
                    style={isSel && !isFuture ? { backgroundColor: 'var(--premium-red)' } : {}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Years view */}
          {view === 'years' && (
            <div className="grid grid-cols-3 gap-1.5 px-4 pb-4">
              {Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearStart + i).map(year => {
                const isSel    = selected && getYear(selected) === year;
                const isT      = getYear(today) === year;
                const isFuture = isYearDisabled(year);
                return (
                  <button
                    key={year}
                    type="button"
                    disabled={isFuture}
                    onClick={() => !isFuture && selectYear(year)}
                    className={`
                      py-2 rounded-lg text-xs font-medium transition
                      ${isFuture
                        ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                        : isSel
                        ? 'text-white shadow-sm'
                        : isT
                        ? 'text-(--premium-red) dark:text-red-400 ring-1 ring-(--premium-red)/40'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'}
                    `}
                    style={isSel && !isFuture ? { backgroundColor: 'var(--premium-red)' } : {}}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); setView('days'); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => selectDay(today)}
              className="text-xs font-semibold transition hover:opacity-80"
              style={{ color: 'var(--premium-red)' }}
            >
              Today
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
