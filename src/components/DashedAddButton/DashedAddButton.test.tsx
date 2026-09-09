import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashedAddButton } from './DashedAddButton';

describe('DashedAddButton', () => {
  test('renders the label and fires onClick', async () => {
    const onClick = vi.fn();
    render(<DashedAddButton label="Add line item" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: /Add line item/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled does not fire onClick', async () => {
    const onClick = vi.fn();
    render(<DashedAddButton label="Add line item" onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
