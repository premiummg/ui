import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';

const PANEL_WIDTH = 224; // w-56
const VIEWPORT_MARGIN = 8;

// A click/mousedown outside either the trigger or the portaled panel closes
// the dropdown - two refs, not one, since the panel isn't a DOM descendant of
// the trigger once portaled (see the component doc comment below) and a
// click on one of its options would otherwise register as "outside".
function useOutsideClick(
  triggerRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
) {
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const inside =
        (triggerRef.current && triggerRef.current.contains(target)) ||
        (panelRef.current && panelRef.current.contains(target));
      if (!inside) onOutsideRef.current();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [triggerRef, panelRef]);
}

export interface PhoneCountrySelectOption {
  value?: string;
  label: string;
  divider?: boolean;
}

export interface PhoneCountrySelectIconProps {
  country?: string;
  label?: string;
  'aria-hidden'?: boolean;
}

export interface PhoneCountrySelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: PhoneCountrySelectOption[];
  disabled?: boolean;
  readOnly?: boolean;
  iconComponent: ComponentType<PhoneCountrySelectIconProps>;
}

// Drop-in `countrySelectComponent` for react-phone-number-input's PhoneInput
// - replaces its default bare <select>. The native select's own dropdown
// popup can't be themed (always a light OS background), capped in height, or
// forced to always open downward (Chrome flips it upward when there isn't
// room below), which made a ~240-country list unreadable in dark mode and
// able to swallow the whole screen - this renders the same option list as an
// ordinary positioned panel instead, fully under this component's control.
// Consumers only need the option/value/onChange/iconComponent shape below,
// so this has no dependency on react-phone-number-input itself.
//
// The panel is portaled to <body> rather than nested under the trigger -
// PhoneInput's own container is typically styled with `overflow: hidden` (to
// clip the flag box/input into one rounded pill), which would silently clip
// this panel down to zero visible height too if it stayed in that subtree,
// making it look like the dropdown never opened at all.
export function PhoneCountrySelect({ value, onChange, options, disabled, readOnly, iconComponent: Icon }: PhoneCountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useOutsideClick(triggerRef, panelRef, () => setOpen(false));

  useLayoutEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // On a narrow/resized viewport, anchoring to the trigger's left edge
      // as-is can push the panel past the right edge of the screen - clamp
      // it back in instead of letting it run off-screen.
      const maxLeft = window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN;
      const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft));
      setCoords({ top: rect.bottom + 4, left });
    }
    updatePosition();
    // The portal's fixed coordinates are a snapshot from open-time - track
    // every scroll (capture: true also catches an inner scrollable ancestor,
    // not just the window) so the panel keeps following the trigger instead
    // of drifting out of alignment until the next reposition.
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const selected = useMemo(() => options.find(o => !o.divider && (o.value || 'ZZ') === (value || 'ZZ')), [options, value]);

  function select(optionValue: string) {
    onChange(optionValue === 'ZZ' ? undefined : optionValue);
    setOpen(false);
  }

  return (
    <div ref={triggerRef} className="PhoneInputCountry relative">
      <button
        type="button"
        disabled={disabled || readOnly}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 disabled:cursor-not-allowed"
      >
        {selected && <Icon aria-hidden country={selected.value} label={selected.label} />}
        <span className="PhoneInputCountrySelectArrow" />
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            style={{ top: coords.top, left: coords.left }}
            className="no-scrollbar fixed z-50 max-h-60 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-(--premium-dark-grey)"
          >
            {options.map(option =>
              option.divider ? (
                <div key="divider" className="my-1 h-px bg-gray-100 dark:bg-white/10" />
              ) : (
                <button
                  key={option.value || 'ZZ'}
                  type="button"
                  role="option"
                  aria-selected={(option.value || 'ZZ') === (value || 'ZZ')}
                  onClick={() => select(option.value || 'ZZ')}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-white/5 ${
                    (option.value || 'ZZ') === (value || 'ZZ') ? 'bg-gray-50 dark:bg-white/5' : ''
                  }`}
                >
                  {option.value && <Icon aria-hidden country={option.value} label={option.label} />}
                  <span className="truncate text-gray-700 dark:text-gray-200">{option.label}</span>
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
