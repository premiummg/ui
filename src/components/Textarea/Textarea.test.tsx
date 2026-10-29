import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  test('is a real textarea with the field style by default', async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" onChange={onChange} />);
    const el = screen.getByRole('textbox', { name: 'Notes' });
    expect(el).toHaveClass('input-field');
    await userEvent.type(el, 'hi');
    expect(onChange).toHaveBeenCalled();
  });

  test('invalid marks it', () => {
    render(<Textarea aria-label="Notes" invalid />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute('aria-invalid', 'true');
  });
});
