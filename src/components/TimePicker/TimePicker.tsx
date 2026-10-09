import { useState, useRef, useEffect, useLayoutEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { FiClock, FiX } from 'react-icons/fi';
import { POPOVER_PANEL } from '../../lib/popoverPanel';

// A brand-matched replacement for the native `<input type="time">` - same
// reason DatePicker.tsx exists for dates: the native widget can't be
// restyled to match, so a consumer shouldn't reach for one at all. The
// trigger/footer chrome mirrors DatePicker's (same border/focus/icon
// treatment, same POPOVER_PANEL shadow); the dropdown itself is a 3-wheel
// scroll picker (hour / minute / period) with one center selection band in a
// soft brand-red tint - BRAND.md reserves MAIN red (#E62027) for exactly
// this: "interactive and small-area elements... active states".
//
// Internally everything is tracked as a single `h24` (0..23), never a
// separate hour12 + AM/PM pair - an earlier version kept those two apart and
// flipped AM/PM by comparing the previous committed hour to the new one
// (only flip exactly on 11<->12). That broke the instant a scroll moved more
// than one row per event - a single real mouse-wheel/trackpad tick routinely
// does, hopping straight from e.g. 9 to 12 with nothing ever "settling" on
// 11 in between - so the comparison silently never matched and AM/PM got
// stuck. `h24` has no such blind spot: CyclicWheel already tracks the exact
// number of rows crossed via scrollTop deltas regardless of how big any one
// jump is (see its own comment), so deriving hour12/period from h24 for
// display, and only ever writing h24 itself, can't drift no matter how fast
// or far a single scroll travels.
//
// `value`/`onChange` stay "HH:MM" 24h strings - the same format the native
// input produces - so a consumer's existing time-string handling (parsing,
// validation, submit payloads) needs no changes to adopt this.
//
// Unlike DatePicker, the open dropdown is portaled to <body> and positioned
// with `fixed` (see usePanelPosition) instead of living in place as a plain
// `absolute` child of the trigger. A compact form row is often tight enough
// that the ~230px-tall panel has no room to open without its painted area
// landing on top of real controls a few rows down - a sibling button
// underneath it can end up receiving the click instead of the picker's own
// row. Portaling removes the shared ancestor entirely, so the panel can
// never end up stacked against sibling content it doesn't belong to.

export interface TimePickerProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  clearLabel?: string;
  doneLabel?: string;
}

// Clock punches are rarely typed to the exact minute in practice - stepping
// by 5 means a lot less scrolling to reach a real value than a 60-stop wheel
// would.
const MINUTE_STEP = 5;
const MINUTE_COUNT = 60 / MINUTE_STEP; // 12 stops: :00, :05, ... :55

// Row height and visible-row count are both fixed so a scroll position can
// be read straight off scrollTop (index = round(scrollTop / ITEM_HEIGHT)) -
// no IntersectionObserver or per-item measuring needed.
const ITEM_HEIGHT = 36;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
// Top/bottom padding so the first and last real row can still scroll all
// the way to the center band, same trick every native wheel picker uses.
const WHEEL_PAD = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

// The dropdown is portaled to <body> and positioned with `fixed` from the
// trigger's own bounding rect, rather than living in-place as a plain
// `absolute` child the way DatePicker's does - a compact row can be tight
// enough that the ~230px-tall panel has no room to open without covering
// real, clickable controls a few rows down. A portal sidesteps that
// regardless of the exact layout: it never has to visually share space with
// sibling content in the first place. Height is a fixed estimate, not
// measured - the panel's content (3 wheels + footer) never changes size, so
// there's nothing to measure.
const PANEL_WIDTH = 192; // w-48
const PANEL_GAP = 8; // mt-2
const PANEL_HEIGHT_ESTIMATE = WHEEL_HEIGHT + 49;

// Where the portaled panel should sit for the trigger currently at `rect`,
// clamped to the viewport and flipped above the trigger when there isn't
// room below.
function computePanelPosition(rect: DOMRect) {
  const left = Math.min(Math.max(PANEL_GAP, rect.left), window.innerWidth - PANEL_WIDTH - PANEL_GAP);
  const fitsBelow = rect.bottom + PANEL_GAP + PANEL_HEIGHT_ESTIMATE <= window.innerHeight;
  const top = fitsBelow
    ? rect.bottom + PANEL_GAP
    : Math.max(PANEL_GAP, rect.top - PANEL_GAP - PANEL_HEIGHT_ESTIMATE);
  return { top, left };
}

// Keeps the portaled panel's fixed position following the trigger while
// it's open - re-reads the trigger's rect on every scroll/resize rather than
// once, since `position: fixed` tracks the viewport, not the trigger.
function usePanelPosition(triggerRef: RefObject<HTMLElement | null>, open: boolean) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    function recompute() {
      if (!triggerRef.current) return;
      setPos(computePanelPosition(triggerRef.current.getBoundingClientRect()));
    }
    recompute();
    window.addEventListener('scroll', recompute, true);
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute, true);
      window.removeEventListener('resize', recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return pos;
}

export function parseValue(value: string): { h24: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!m) return null;
  const h24 = Number(m[1]);
  const minute = Number(m[2]);
  if (!Number.isFinite(h24) || !Number.isFinite(minute) || h24 > 23 || minute > 59) return null;
  return { h24, minute };
}

export function toValue(h24: number, minute: number): string {
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function hour12Of(h24: number): number {
  const h = h24 % 12;
  return h === 0 ? 12 : h;
}

export function periodOf(h24: number): 'AM' | 'PM' {
  return h24 < 12 ? 'AM' : 'PM';
}

function formatDisplay(parsed: { h24: number; minute: number } | null): string | null {
  if (!parsed) return null;
  return `${hour12Of(parsed.h24)}:${String(parsed.minute).padStart(2, '0')} ${periodOf(parsed.h24)}`;
}

// One infinitely-scrollable column - hour and minute both use this.
//
// The "infinite" feel is the standard tripled-list trick: render the option
// list three times back to back, let the browser scroll freely across all
// three, and whenever the settled position lands in the first or third copy,
// instantly (no animation) re-center the same logical row back into the
// middle copy - invisible to look at since every copy renders identically,
// but it means there's always room left to keep scrolling either direction.
// `rawRef` is the real, never-clamped step counter driving all of this; the
// physical scrollTop the browser reports is just a window onto it. Crucially
// it accumulates by DELTA on every scroll event, so it stays exactly correct
// no matter how many rows a single scroll jump crosses (a real mouse wheel
// or trackpad tick routinely moves more than one row at once) - nothing here
// depends on ever having "seen" an intermediate row to know it was passed.
function CyclicWheel({ length, index, format, onSettle }: {
  length: number;
  index: number; // current logical index, 0..length-1, controlled by the parent
  format: (i: number) => string;
  // newIndex: the logical index now selected. wraps: how many full laps were
  // crossed to get there (±1 for an ordinary one-step wrap, 0 most of the
  // time, but correctly larger if a single fling crossed more than one).
  onSettle: (newIndex: number, wraps: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rawRef = useRef(length + index); // starts centered in the middle copy
  const lastPhysical = useRef(rawRef.current);
  const [liveRaw, setLiveRaw] = useState(rawRef.current);

  // Mount: snap to the starting position with no animation.
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = rawRef.current * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The parent changed `index` from outside this wheel (e.g. the minute
  // wheel just cascaded an hour bump into this one) - follow it without the
  // jump reading as a glitch, since we're still just re-centering into an
  // equivalent copy, not actually moving anywhere the eye can tell.
  useEffect(() => {
    const currentLogical = ((rawRef.current % length) + length) % length;
    if (currentLogical === index) return;
    rawRef.current = length + index;
    lastPhysical.current = rawRef.current;
    setLiveRaw(rawRef.current);
    if (ref.current) ref.current.scrollTop = rawRef.current * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, length]);

  function settleAt(rawValue: number, animate: boolean) {
    const logical = ((rawValue % length) + length) % length;
    // Home copy (the middle third) is where raw === length + logical with
    // no net wrap - comparing against that baseline is what "wraps" means.
    const wraps = Math.floor(rawValue / length) - 1;
    rawRef.current = length + logical;
    lastPhysical.current = rawRef.current;
    setLiveRaw(rawRef.current);
    ref.current?.scrollTo({ top: rawRef.current * ITEM_HEIGHT, behavior: animate ? 'smooth' : 'auto' });
    onSettle(logical, wraps);
  }

  function handleScroll() {
    const el = ref.current;
    if (!el) return;
    const physical = Math.round(el.scrollTop / ITEM_HEIGHT);
    rawRef.current += physical - lastPhysical.current;
    lastPhysical.current = physical;
    setLiveRaw(rawRef.current);

    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => settleAt(rawRef.current, false), 120);
  }

  useEffect(() => () => { if (settleTimer.current) clearTimeout(settleTimer.current); }, []);

  // Touch already drag-scrolls this div for free (that's just what a
  // touchscreen does to any scrollable element) - a mouse has no equivalent,
  // so this reproduces the same gesture with mouse events: press, drag up or
  // down, and scrollTop follows the pointer 1:1 until release. It feeds the
  // exact same scrollTop the browser would set itself, so handleScroll above
  // (debounce, snap-to-center, settle) needs no separate path for it.
  const dragStart = useRef<{ y: number; scrollTop: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  // A mouseup after an actual drag still fires a click on whatever row ended
  // up under the pointer - without this, releasing the drag would immediately
  // re-select that row and undo the snap-to-center the drag itself just did.
  // A real click (press+release with no real movement) clears this on its
  // own mousedown, so it's unaffected.
  const didDrag = useRef(false);

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    e.preventDefault(); // don't let the drag select the row labels as text
    dragStart.current = { y: e.clientY, scrollTop: ref.current.scrollTop };
    didDrag.current = false;
    setDragging(true);
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragStart.current || !ref.current) return;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dy) > 3) didDrag.current = true;
      // Dragging down (positive dy) reveals earlier rows, same direction a
      // touch drag moves content - so it SUBTRACTS from scrollTop.
      ref.current.scrollTop = dragStart.current.scrollTop - dy;
    }
    function handleMouseUp() {
      dragStart.current = null;
      setDragging(false);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const tripled = Array.from({ length: length * 3 }, (_, physicalIdx) => physicalIdx % length);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      className={`flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ height: WHEEL_HEIGHT }}
    >
      <div style={{ height: WHEEL_PAD }} />
      {tripled.map((logicalValue, physicalIdx) => {
        const distance = Math.abs(physicalIdx - liveRaw);
        return (
          <button
            key={physicalIdx}
            type="button"
            onClick={() => { if (!didDrag.current) settleAt(physicalIdx, true); }}
            className={`w-full flex items-center justify-center font-heading tabular-nums transition-all duration-150 snap-center ${
              distance === 0
                ? 'text-[#E62027] dark:text-red-400 font-bold text-base'
                : distance === 1
                ? 'text-gray-400 dark:text-gray-500 text-sm'
                : 'text-gray-300 dark:text-gray-600 text-sm'
            }`}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
          >
            {format(logicalValue)}
          </button>
        );
      })}
      <div style={{ height: WHEEL_PAD }} />
    </div>
  );
}

// AM/PM is a pure display of h24, not independent state - clicking either
// one jumps straight to the equivalent hour in that half of the day
// (h24 % 12, +12 for PM), so it can never fall out of sync with the hour
// wheel the way tracking it separately did before.
function PeriodColumn({ h24, onPick }: { h24: number; onPick: (period: 'AM' | 'PM') => void }) {
  const current = periodOf(h24);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory" style={{ height: WHEEL_HEIGHT }}>
      <div style={{ height: WHEEL_PAD }} />
      {(['AM', 'PM'] as const).map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className={`w-full flex items-center justify-center font-heading tabular-nums transition-all duration-150 snap-center ${
            p === current
              ? 'text-[#E62027] dark:text-red-400 font-bold text-base'
              : 'text-gray-300 dark:text-gray-600 text-sm'
          }`}
          style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
        >
          {p}
        </button>
      ))}
      <div style={{ height: WHEEL_PAD }} />
    </div>
  );
}

export function TimePicker({
  value, onChange, disabled, placeholder = '--:-- --', id, className = '',
  clearLabel = 'Clear', doneLabel = 'Done',
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pos = usePanelPosition(containerRef, open);

  // Not this package's own useOutsideClick/usePopover here: those only take
  // one ref, and the panel is no longer a DOM descendant of containerRef
  // once it's portaled - a click inside it would otherwise read as "outside"
  // and close itself mid-click. This checks both the trigger and the
  // portaled panel.
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const parsed = parseValue(value);
  // Nothing picked yet starts the wheel at 9:00 AM rather than midnight -
  // the common start of a work day, so there's usually less to scroll.
  const h24 = parsed?.h24 ?? 9;
  const minute = parsed?.minute ?? 0;

  function commit(nextH24: number, nextMinute: number) {
    onChange(toValue(((nextH24 % 24) + 24) % 24, nextMinute));
  }

  const display = formatDisplay(parsed);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
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
        <span className={`truncate font-heading tabular-nums ${display ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
          {display ?? placeholder}
        </span>
        <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 shrink-0">
          {display && !disabled && (
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
          <FiClock size={13} />
        </span>
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: PANEL_WIDTH }}
          className={`bg-white dark:bg-(--premium-dark-grey) border border-gray-100 dark:border-white/10 ${POPOVER_PANEL} overflow-hidden`}
        >
          <div className="relative flex" style={{ height: WHEEL_HEIGHT }}>
            {/* The one center band every wheel reads its selection against -
                a soft brand-red tint, not a solid fill: BRAND.md reserves a
                SOLID red field for large areas (and the deeper SECONDARY red
                at that); this is a tint, the same family as a badge or an
                icon-tile background, so MAIN red at low opacity is the right
                call. Hex-literal opacity, never `var(--premium-red)/10` -
                BRAND.md: a bare var() can't be decomposed for the alpha. */}
            <div
              className="absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-xl pointer-events-none bg-[#E62027]/10 dark:bg-[#E62027]/15 ring-1 ring-[#E62027]/20"
              style={{ height: ITEM_HEIGHT }}
            />
            <CyclicWheel
              length={24}
              index={h24}
              format={i => String(hour12Of(i))}
              onSettle={newH24 => commit(newH24, minute)}
            />
            <CyclicWheel
              length={MINUTE_COUNT}
              // A value from outside this component (e.g. a native
              // `<input type="time">` it's replacing) can land on a
              // non-multiple-of-5 minute - round it to the nearest stop
              // rather than crashing the wheel on an out-of-range index.
              index={Math.round(minute / MINUTE_STEP) % MINUTE_COUNT}
              format={i => String(i * MINUTE_STEP).padStart(2, '0')}
              onSettle={(newIndex, wraps) => commit(h24 + wraps, newIndex * MINUTE_STEP)}
            />
            <PeriodColumn h24={h24} onPick={p => commit((h24 % 12) + (p === 'PM' ? 12 : 0), minute)} />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              {clearLabel}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold transition hover:opacity-80"
              style={{ color: 'var(--premium-red)' }}
            >
              {doneLabel}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
