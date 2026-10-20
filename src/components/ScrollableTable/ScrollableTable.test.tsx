import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScrollableTable } from './ScrollableTable';

function pointerEvent(type: string, props: Record<string, unknown> = {}) {
  return new Event(type, { bubbles: true, cancelable: true, ...props });
}

describe('ScrollableTable', () => {
  test('renders its children', () => {
    render(
      <ScrollableTable>
        <table><tbody><tr><td>Row</td></tr></tbody></table>
      </ScrollableTable>,
    );
    expect(screen.getByText('Row')).toBeInTheDocument();
  });

  test('shows no nudge buttons when content does not overflow (jsdom reports 0 scroll extent)', () => {
    render(
      <ScrollableTable>
        <div>content</div>
      </ScrollableTable>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  describe('dragToScroll', () => {
    function scrollEl(container: HTMLElement, overflowing = true) {
      // The one direct child of the outer relative wrapper that scrolls -
      // same element ScrollableTable itself attaches the ref to. jsdom
      // reports 0 scroll extent by default (no real layout) - mocked here
      // to a genuinely overflowing (or, opted out, a fitting) table, since
      // the drag only arms at all when there's something to pan.
      const el = container.querySelector('.overflow-auto') as HTMLDivElement;
      Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true });
      Object.defineProperty(el, 'clientWidth', { value: 500, configurable: true });
      Object.defineProperty(el, 'scrollWidth', { value: overflowing ? 1000 : 500, configurable: true });
      return el;
    }

    test('a drag past the threshold pans the content and suppresses the click underneath', () => {
      const onClick = vi.fn();
      const { container } = render(
        <ScrollableTable dragToScroll>
          <div onClick={onClick}>content</div>
        </ScrollableTable>,
      );
      const el = scrollEl(container);

      fireEvent(el, Object.assign(pointerEvent('pointerdown'), { pointerType: 'mouse', button: 0, clientX: 100, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointermove'), { pointerType: 'mouse', clientX: 65, pointerId: 1 })); // 35px left, past the 10px threshold
      expect(el.scrollLeft).toBe(35); // dragging left (content follows the pointer) scrolls right
      fireEvent(el, Object.assign(pointerEvent('pointerup'), { pointerType: 'mouse', pointerId: 1 }));

      fireEvent.click(screen.getByText('content'));
      expect(onClick).not.toHaveBeenCalled();
    });

    // Regression: the threshold used to be 5px, tight enough that an
    // ordinary deliberate click's own involuntary mouse jitter (easily
    // 5-8px) got misread as a drag and swallowed the click meant to fire -
    // this app's Employees table went from "click anywhere in the row" to
    // "only a very precise click on the name link". 8px is exactly that
    // jitter range: past the old threshold, under the current one.
    test('ordinary click jitter (8px) stays a click, not a drag', () => {
      const onClick = vi.fn();
      const { container } = render(
        <ScrollableTable dragToScroll>
          <div onClick={onClick}>content</div>
        </ScrollableTable>,
      );
      const el = scrollEl(container);

      fireEvent(el, Object.assign(pointerEvent('pointerdown'), { pointerType: 'mouse', button: 0, clientX: 100, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointermove'), { pointerType: 'mouse', clientX: 92, pointerId: 1 })); // 8px
      fireEvent(el, Object.assign(pointerEvent('pointerup'), { pointerType: 'mouse', pointerId: 1 }));

      expect(el.scrollLeft).toBe(0); // never panned - stayed under threshold the whole time
      fireEvent.click(screen.getByText('content'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('a table that already fits (nothing to pan) never arms the drag, regardless of movement', () => {
      const onClick = vi.fn();
      const { container } = render(
        <ScrollableTable dragToScroll>
          <div onClick={onClick}>content</div>
        </ScrollableTable>,
      );
      const el = scrollEl(container, /* overflowing */ false);

      fireEvent(el, Object.assign(pointerEvent('pointerdown'), { pointerType: 'mouse', button: 0, clientX: 100, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointermove'), { pointerType: 'mouse', clientX: 50, pointerId: 1 })); // well past the threshold
      fireEvent(el, Object.assign(pointerEvent('pointerup'), { pointerType: 'mouse', pointerId: 1 }));

      expect(el.scrollLeft).toBe(0);
      fireEvent.click(screen.getByText('content'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('off by default - a mouse drag never suppresses the click', () => {
      const onClick = vi.fn();
      const { container } = render(
        <ScrollableTable>
          <div onClick={onClick}>content</div>
        </ScrollableTable>,
      );
      const el = scrollEl(container);

      fireEvent(el, Object.assign(pointerEvent('pointerdown'), { pointerType: 'mouse', button: 0, clientX: 100, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointermove'), { pointerType: 'mouse', clientX: 50, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointerup'), { pointerType: 'mouse', pointerId: 1 }));

      expect(el.scrollLeft).toBe(0);
      fireEvent.click(screen.getByText('content'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('a touch pointer never engages the drag (native scroll handles it)', () => {
      const { container } = render(
        <ScrollableTable dragToScroll>
          <div>content</div>
        </ScrollableTable>,
      );
      const el = scrollEl(container);

      fireEvent(el, Object.assign(pointerEvent('pointerdown'), { pointerType: 'touch', button: 0, clientX: 100, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointermove'), { pointerType: 'touch', clientX: 50, pointerId: 1 }));

      expect(el.scrollLeft).toBe(0);
    });
  });
});
