import { describe, expect, test, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragReorder, moveItem } from './useDragReorder';

const dragEvent = () => ({ preventDefault: vi.fn() }) as never;

describe('useDragReorder', () => {
  test('dropping a row on another moves it there', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useDragReorder({ enabled: true, onMove }));
    act(() => result.current.rowProps(0).onDragStart());
    act(() => result.current.rowProps(2).onDragOver(dragEvent()));
    expect(result.current.dragOverIndex).toBe(2);
    act(() => result.current.rowProps(2).onDrop());
    expect(onMove).toHaveBeenCalledWith(0, 2);
    expect(result.current.dragIndex).toBeNull();
  });

  test('a drop where it started, or while disabled, does nothing', () => {
    const onMove = vi.fn();
    const { result, rerender } = renderHook(({ enabled }) => useDragReorder({ enabled, onMove }), { initialProps: { enabled: true } });
    act(() => result.current.rowProps(1).onDragStart());
    act(() => result.current.rowProps(1).onDrop());
    rerender({ enabled: false });
    expect(result.current.rowProps(0).draggable).toBe(false);
    act(() => result.current.rowProps(0).onDragStart());
    act(() => result.current.rowProps(2).onDrop());
    expect(onMove).not.toHaveBeenCalled();
  });
});

describe('moveItem', () => {
  test('moves one item', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });
});
