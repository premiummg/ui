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
    function scrollEl(container: HTMLElement) {
      // The one direct child of the outer relative wrapper that scrolls -
      // same element ScrollableTable itself attaches the ref to.
      return container.querySelector('.overflow-auto') as HTMLDivElement;
    }

    test('a drag past the threshold pans the content and suppresses the click underneath', () => {
      const onClick = vi.fn();
      const { container } = render(
        <ScrollableTable dragToScroll>
          <div onClick={onClick}>content</div>
        </ScrollableTable>,
      );
      const el = scrollEl(container);
      Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true });

      fireEvent(el, Object.assign(pointerEvent('pointerdown'), { pointerType: 'mouse', button: 0, clientX: 100, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointermove'), { pointerType: 'mouse', clientX: 70, pointerId: 1 })); // 30px left, past the 5px threshold
      expect(el.scrollLeft).toBe(30); // dragging left (content follows the pointer) scrolls right
      fireEvent(el, Object.assign(pointerEvent('pointerup'), { pointerType: 'mouse', pointerId: 1 }));

      fireEvent.click(screen.getByText('content'));
      expect(onClick).not.toHaveBeenCalled();
    });

    test('a tiny movement below the threshold is still just a click', () => {
      const onClick = vi.fn();
      const { container } = render(
        <ScrollableTable dragToScroll>
          <div onClick={onClick}>content</div>
        </ScrollableTable>,
      );
      const el = scrollEl(container);
      Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true });

      fireEvent(el, Object.assign(pointerEvent('pointerdown'), { pointerType: 'mouse', button: 0, clientX: 100, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointermove'), { pointerType: 'mouse', clientX: 98, pointerId: 1 })); // 2px, under threshold
      fireEvent(el, Object.assign(pointerEvent('pointerup'), { pointerType: 'mouse', pointerId: 1 }));

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
      Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true });

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
      Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true });

      fireEvent(el, Object.assign(pointerEvent('pointerdown'), { pointerType: 'touch', button: 0, clientX: 100, pointerId: 1 }));
      fireEvent(el, Object.assign(pointerEvent('pointermove'), { pointerType: 'touch', clientX: 50, pointerId: 1 }));

      expect(el.scrollLeft).toBe(0);
    });
  });
});
