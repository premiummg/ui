import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilePill } from './FilePill';

describe('FilePill', () => {
  test('shows the file name', () => {
    render(<FilePill name="invoice.pdf" onRemove={() => {}} />);
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
  });

  test('clicking remove calls onRemove', async () => {
    const onRemove = vi.fn();
    render(<FilePill name="invoice.pdf" onRemove={onRemove} />);
    await userEvent.click(screen.getByLabelText('Remove invoice.pdf'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
