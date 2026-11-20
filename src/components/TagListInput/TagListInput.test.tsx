import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagListInput } from './TagListInput';

describe('TagListInput', () => {
  test('adds with Enter or the button, skips blanks and repeats, removes', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagListInput values={['Red']} onChange={onChange} />);
    const input = screen.getByLabelText('Add option…');
    fireEvent.change(input, { target: { value: ' Blue ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(['Red', 'Blue']);
    onChange.mockClear();
    fireEvent.change(input, { target: { value: 'Red' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onChange).not.toHaveBeenCalled();
    rerender(<TagListInput values={['Red', 'Blue']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Red' }));
    expect(onChange).toHaveBeenLastCalledWith(['Blue']);
  });
});
