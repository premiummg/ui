import { describe, expect, test, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePopover } from './usePopover';

function mousedownOn(target: EventTarget) {
  const event = new MouseEvent('mousedown', { bubbles: true });
  Object.defineProperty(event, 'target', { value: target });
  document.dispatchEvent(event);
}

describe('usePopover', () => {
  test('starts closed, and setOpen(true) opens it', () => {
    const { result } = renderHook(() => usePopover());
    expect(result.current.open).toBe(false);
    act(() => result.current.setOpen(true));
    expect(result.current.open).toBe(true);
  });

  test('an outside mousedown closes it while open', () => {
    const { result } = renderHook(() => usePopover());
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);
    (result.current.ref as any).current = inside;

    act(() => result.current.setOpen(true));
    act(() => mousedownOn(outside));
    expect(result.current.open).toBe(false);
  });

  test('close() and an outside click both run the onClose side effect', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => usePopover(onClose));
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);
    (result.current.ref as any).current = inside;

    act(() => result.current.setOpen(true));
    act(() => result.current.close());
    expect(onClose).toHaveBeenCalledTimes(1);

    act(() => result.current.setOpen(true));
    act(() => mousedownOn(outside));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
