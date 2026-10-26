import { afterEach, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { usePopoverSide } from './usePopoverSide';

// jsdom has no layout, so the trigger's position, the panel's width and the
// viewport width are stubbed.
function Harness({ preferred }: { preferred: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null);
  const { side, panelRef } = usePopoverSide(true, ref, preferred);
  return (
    <div ref={ref} data-testid="trigger">
      <div ref={panelRef} data-testid="panel" data-side={side} />
    </div>
  );
}

function stub({ left, right, width, viewport }: { left: number; right: number; width: number; viewport: number }) {
  Element.prototype.getBoundingClientRect = function () {
    return { left, right, top: 0, bottom: 0, width: right - left, height: 0, x: left, y: 0, toJSON: () => ({}) } as DOMRect;
  };
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => width });
  Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: viewport });
}

const original = Element.prototype.getBoundingClientRect;
afterEach(() => {
  Element.prototype.getBoundingClientRect = original;
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 0 });
  Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1024 });
});

describe('usePopoverSide', () => {
  test('keeps the preferred side when the panel fits there', () => {
    stub({ left: 700, right: 736, width: 256, viewport: 1024 });
    render(<Harness preferred="right" />);
    expect(screen.getByTestId('panel')).toHaveAttribute('data-side', 'right');
  });

  test('a right-hanging panel that would run off the left edge flips to the left side', () => {
    stub({ left: 100, right: 136, width: 256, viewport: 1024 });
    render(<Harness preferred="right" />);
    expect(screen.getByTestId('panel')).toHaveAttribute('data-side', 'left');
  });

  test('a left-hanging panel that would run off the right edge flips to the right side', () => {
    stub({ left: 900, right: 936, width: 256, viewport: 1024 });
    render(<Harness preferred="left" />);
    expect(screen.getByTestId('panel')).toHaveAttribute('data-side', 'right');
  });

  test('when it fits on neither side it keeps the preferred one', () => {
    stub({ left: 100, right: 136, width: 256, viewport: 300 });
    render(<Harness preferred="right" />);
    expect(screen.getByTestId('panel')).toHaveAttribute('data-side', 'right');
  });
});
