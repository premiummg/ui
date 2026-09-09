import { describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useOutsideClick } from './useOutsideClick';

function mousedownOn(target: EventTarget) {
  const event = new MouseEvent('mousedown', { bubbles: true });
  Object.defineProperty(event, 'target', { value: target });
  document.dispatchEvent(event);
}

describe('useOutsideClick', () => {
  test('fires onOutside when the mousedown target is outside the ref', () => {
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);
    const ref = createRef<HTMLElement>();
    (ref as any).current = inside;
    const onOutside = vi.fn();

    renderHook(() => useOutsideClick(ref, onOutside));
    mousedownOn(outside);
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  test('does not fire when the mousedown target is inside the ref', () => {
    const inside = document.createElement('div');
    document.body.append(inside);
    const ref = createRef<HTMLElement>();
    (ref as any).current = inside;
    const onOutside = vi.fn();

    renderHook(() => useOutsideClick(ref, onOutside));
    mousedownOn(inside);
    expect(onOutside).not.toHaveBeenCalled();
  });

  test('does not attach a listener when enabled=false', () => {
    const outside = document.createElement('div');
    document.body.append(outside);
    const ref = createRef<HTMLElement>();
    const onOutside = vi.fn();

    renderHook(() => useOutsideClick(ref, onOutside, false));
    mousedownOn(outside);
    expect(onOutside).not.toHaveBeenCalled();
  });
});
