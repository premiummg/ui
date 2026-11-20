import { afterEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

afterEach(() => vi.unstubAllGlobals());

function stubDecode() {
  vi.stubGlobal('createImageBitmap', async () => ({ width: 100, height: 50, close() {} }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage() {},
    getImageData: () => ({ data: new Uint8ClampedArray([1, 2, 3, 255]) }),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,xx');
}

function paste(editor: HTMLElement, clipboardData: Record<string, unknown>) {
  fireEvent.paste(editor, { clipboardData: { getData: () => '', types: [], items: [], files: [], ...clipboardData } });
}

describe('pasting an image', () => {
  test('a file copied in the file manager (only in files, nothing in items) is inserted', async () => {
    stubDecode();
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);
    const editor = screen.getByRole('textbox', { name: /Write here/ });
    paste(editor, { types: ['Files'], files: [new File(['x'], 'horizontal-dark.png', { type: 'image/png' })] });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[onChange.mock.calls.length - 1][0]).toContain('data-resizable-image');
  });

  test('a file whose type and name tell nothing is not guessed at', async () => {
    stubDecode();
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);
    const editor = screen.getByRole('textbox', { name: /Write here/ });
    paste(editor, { types: ['Files'], files: [new File(['x'], 'notes', { type: '' })] });
    await new Promise((r) => setTimeout(r, 50));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('the red hover border of an image', () => {
  test('is not saved with the post when the mouse is over the image as it is saved', async () => {
    stubDecode();
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);
    const editor = screen.getByRole('textbox', { name: /Write here/ });
    paste(editor, { types: ['Files'], files: [new File(['x'], 'a.png', { type: 'image/png' })] });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    // The mouse rests over the image: its border turns red, then something else changes and the body is saved.
    const wrap = editor.querySelector<HTMLElement>('[data-resizable-image]')!;
    fireEvent.mouseEnter(wrap);
    expect(wrap.style.borderColor).not.toBe('transparent');
    fireEvent.input(editor);
    const saved = onChange.mock.calls[onChange.mock.calls.length - 1][0] as string;
    expect(saved).toContain('data-resizable-image');
    expect(saved).not.toMatch(/border-color:\s*(rgb\(230|#e62027)/i);
  });
});

describe('reading a post saved with the red hover border', () => {
  test('it renders without the red border', async () => {
    const { renderRichTextHtml } = await import('./richTextSanitize');
    const saved = '<div data-resizable-image="1" style="position:relative;display:block;width:420px;border:2px solid rgb(230, 32, 39)"><img src="data:image/png;base64,AAAA" alt=""></div>';
    const html = renderRichTextHtml(saved);
    expect(html).toContain('data-resizable-image');
    expect(html).not.toMatch(/230,\s*32,\s*39/);
  });
});
