import { useState, type DragEvent } from 'react';

// Reordering rows by dragging them: which row is being dragged, which one it is over (to draw the drop line), and
// the drag handlers to spread on each row. Dropping a row on another calls onMove(from, to) with their positions in
// the list on screen; dropping it where it was does nothing. While `enabled` is false the rows do not drag.
export function useDragReorder({ enabled, onMove }: { enabled: boolean; onMove: (from: number, to: number) => void }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function rowProps(i: number) {
    return {
      draggable: enabled,
      onDragStart: () => setDragIndex(i),
      onDragOver: (e: DragEvent) => {
        if (!enabled) return;
        e.preventDefault();
        if (dragIndex !== null && dragIndex !== i) setDragOverIndex(i);
      },
      onDragLeave: () => { if (dragOverIndex === i) setDragOverIndex(null); },
      onDrop: () => {
        if (!enabled) return;
        const from = dragIndex;
        setDragIndex(null);
        setDragOverIndex(null);
        if (from === null || from === i) return;
        onMove(from, i);
      },
      onDragEnd: () => { setDragIndex(null); setDragOverIndex(null); },
    };
  }

  return { dragIndex, dragOverIndex, rowProps };
}

/** The list with the item at `from` moved to `to`. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
