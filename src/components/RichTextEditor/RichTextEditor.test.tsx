import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

// What the editor puts in the page is sanitized like the read view: a stored row from before the backend sanitized it,
// or plain text that holds a tag, must not run in the editor of whoever opens it.
describe('RichTextEditor', () => {
  test('an event handler in the stored value never reaches the editor', () => {
    const { container } = render(<RichTextEditor value={'<p>Hi</p><img src="x" onerror="alert(1)">'} onChange={vi.fn()} />);
    const editor = container.querySelector('[contenteditable]')!;
    expect(editor.innerHTML).not.toMatch(/onerror/);
    expect(editor.textContent).toContain('Hi');
  });

  test('plain text with a half open tag is not turned into an element', () => {
    const { container } = render(<RichTextEditor value={'line one\n<img src=x onerror=alert(1)//'} onChange={vi.fn()} />);
    const editor = container.querySelector('[contenteditable]')!;
    expect(editor.querySelector('img[onerror]')).toBeNull();
    expect(editor.innerHTML).not.toMatch(/onerror=/);
  });
});
