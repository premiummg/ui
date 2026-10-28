import { useEffect } from 'react';

// Anything that marks itself as a form error: FieldError and the error Alert
// carry data-form-error, an invalid control carries aria-invalid.
const ERROR_SELECTOR = '[data-form-error], [aria-invalid="true"]';
const CONTROL_SELECTOR = 'input:not([type="hidden"]), select, textarea, [role="combobox"]';
// Sticky headers cover the top of the viewport, so an error tucked right
// under one counts as out of sight.
const TOP_MARGIN = 96;

function isShown(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

function isInView(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top >= TOP_MARGIN && rect.bottom <= window.innerHeight;
}

// The control an error message belongs to: the first enabled control in the
// closest ancestor that holds one (FieldError renders right under its input).
function controlFor(el: HTMLElement): HTMLElement | null {
  if (el.matches(CONTROL_SELECTOR)) return el;
  if (!el.hasAttribute('data-field-error')) return null;
  let node: HTMLElement | null = el.parentElement;
  for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
    const control = node.querySelector<HTMLElement>(`${CONTROL_SELECTOR}:not([disabled])`);
    if (control) return control;
  }
  return null;
}

function reveal(el: HTMLElement) {
  const control = controlFor(el);
  const target = control ?? el;
  if (!isInView(target)) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (control && document.activeElement !== control) control.focus({ preventScroll: true });
}

// Mount once near the app root. Whenever a form error newly appears anywhere
// on the page (a validation message, an invalid field, an error alert), the
// first one in document order is scrolled into view and, when it belongs to a
// field, that field is focused. An error that is already showing is left
// alone, so editing a field never makes the page jump.
export function useScrollToErrors() {
  useEffect(() => {
    let current = new Set<Element>(Array.from(document.querySelectorAll(ERROR_SELECTOR)));
    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = () => {
      const all = Array.from(document.querySelectorAll<HTMLElement>(ERROR_SELECTOR)).filter(isShown);
      const fresh = all.filter((el) => !current.has(el));
      current = new Set(all);
      if (fresh.length) reveal(fresh[0]);
    };

    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(check, 50);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-invalid'],
    });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);
}
