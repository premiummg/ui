import { describe, expect, test } from 'vitest';
import { imageFileFromTransfer } from './richTextImages';

const file = (name: string, type: string) => new File(['x'], name, { type });

// A DataTransfer stand-in with just the two lists the helper reads.
const transfer = (items: { kind: string; type: string; file?: File }[], files: File[]) =>
  ({
    items: items.map((i) => ({ kind: i.kind, type: i.type, getAsFile: () => i.file ?? null })),
    files,
  }) as unknown as DataTransfer;

describe('imageFileFromTransfer', () => {
  test('finds a screenshot or "Copy image" in the items', () => {
    const png = file('image.png', 'image/png');
    expect(imageFileFromTransfer(transfer([{ kind: 'file', type: 'image/png', file: png }], []))).toBe(png);
  });

  test('finds a file copied in the file manager, which only arrives in files', () => {
    const png = file('horizontal-dark.png', 'image/png');
    expect(imageFileFromTransfer(transfer([{ kind: 'string', type: 'text/plain' }], [png]))).toBe(png);
  });

  test('reads the extension when the browser gives the file no type', () => {
    const jpg = file('photo.JPG', '');
    expect(imageFileFromTransfer(transfer([], [jpg]))).toBe(jpg);
  });

  test('ignores non-image files and an empty transfer', () => {
    expect(imageFileFromTransfer(transfer([], [file('notes.pdf', 'application/pdf')]))).toBeNull();
    expect(imageFileFromTransfer(null)).toBeNull();
  });
});
