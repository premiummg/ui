import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  test('is a real input with the field style by default, and passes events through', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);
    const el = screen.getByRole('textbox', { name: 'Name' });
    expect(el).toHaveClass('input-field');
    await userEvent.type(el, 'Ana');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  test('a className replaces the default style, and invalid marks it', () => {
    render(<Input aria-label="Qty" className="compact" invalid />);
    const el = screen.getByRole('textbox', { name: 'Qty' });
    expect(el).toHaveClass('compact');
    expect(el).not.toHaveClass('input-field');
    expect(el).toHaveAttribute('aria-invalid', 'true');
  });

  test('passes type and ref through', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input aria-label="Hours" type="number" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('spinbutton', { name: 'Hours' }));
  });
});
