import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  test('is named by its label and reports the new value when clicked', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} label="Open in a new tab" />);
    await userEvent.click(screen.getByLabelText('Open in a new tab'));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  test('clicking the label text also toggles it', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked onChange={onChange} label="Required" />);
    await userEvent.click(screen.getByText('Required'));
    expect(onChange).toHaveBeenCalledWith(false, expect.anything());
  });

  test('disabled does not toggle', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} label="Locked" disabled />);
    await userEvent.click(screen.getByLabelText('Locked'));
    expect(onChange).not.toHaveBeenCalled();
  });

  test('without a label it is a bare box that still carries its aria-label', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} aria-label="Select Ana" />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Ana' }));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  test('shows a hint under the label', () => {
    render(<Checkbox checked onChange={() => {}} label="Quebec flag" hint="Shows the fleur-de-lis" />);
    expect(screen.getByText('Shows the fleur-de-lis')).toBeInTheDocument();
  });

  test('indeterminate sets the mixed state on the box', () => {
    render(<Checkbox checked={false} onChange={() => {}} aria-label="All" indeterminate />);
    expect((screen.getByRole('checkbox', { name: 'All' }) as HTMLInputElement).indeterminate).toBe(true);
  });
});
