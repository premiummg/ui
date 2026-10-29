import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  test('is a real select with the field style by default, and passes events through', async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Division" onChange={onChange}><option value="a">A</option><option value="b">B</option></Select>);
    const el = screen.getByRole('combobox', { name: 'Division' });
    expect(el).toHaveClass('input-field');
    await userEvent.selectOptions(el, 'b');
    expect(onChange).toHaveBeenCalled();
  });

  test('a className replaces the default style, and invalid marks it', () => {
    render(<Select aria-label="Filter" className="compact" invalid><option>x</option></Select>);
    const el = screen.getByRole('combobox', { name: 'Filter' });
    expect(el).toHaveClass('compact');
    expect(el).not.toHaveClass('input-field');
    expect(el).toHaveAttribute('aria-invalid', 'true');
  });
});
