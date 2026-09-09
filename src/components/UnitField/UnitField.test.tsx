import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitField, DEFAULT_UNIT_OPTIONS } from './UnitField';

describe('UnitField', () => {
  test('renders a <select> with the default options plus "Other…"', () => {
    render(<UnitField value="pcs" onChange={() => {}} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('pcs');
    expect(screen.getByText('Other…')).toBeInTheDocument();
  });

  test('picking "Other…" switches to a focused text input and clears the value', async () => {
    const onChange = vi.fn();
    render(<UnitField value="pcs" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Other…');
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.getByPlaceholderText('Type unit…')).toBeInTheDocument();
  });

  test('a value outside the options list renders as a pre-filled custom input, not the select', () => {
    render(<UnitField value="pallets" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Type unit…')).toHaveValue('pallets');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('"back to list" returns to the select, defaulting to the first option', async () => {
    const onChange = vi.fn();
    render(<UnitField value="pallets" onChange={onChange} />);
    await userEvent.click(screen.getByTitle('Back to list'));
    expect(onChange).toHaveBeenCalledWith(DEFAULT_UNIT_OPTIONS[0]);
  });

  test('a custom `options` list is honored, including its own first entry on "back to list"', async () => {
    const onChange = vi.fn();
    render(<UnitField value="crates" onChange={onChange} options={['each', 'dozen']} />);
    await userEvent.click(screen.getByTitle('Back to list'));
    expect(onChange).toHaveBeenCalledWith('each');
  });

  test('capitalize defaults on, displaying options title-cased without changing the stored value', () => {
    render(<UnitField value="pcs" onChange={() => {}} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('pcs');
    expect(select.className).toContain('capitalize');
  });

  test('capitalize also applies to the custom-value input by default', () => {
    render(<UnitField value="shipping containers" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Type unit…').className).toContain('capitalize');
  });

  test('capitalize={false} opts out, e.g. for abbreviations that read oddly title-cased', () => {
    render(<UnitField value="kg" onChange={() => {}} capitalize={false} />);
    expect(screen.getByRole('combobox').className).not.toContain('capitalize');
  });
});
