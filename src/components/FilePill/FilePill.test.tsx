import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilePill } from './FilePill';

describe('FilePill', () => {
  test('shows the file name', () => {
    render(<FilePill name="invoice.pdf" onRemove={() => {}} />);
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
  });

  test('shows the size when given, and nothing extra when not', () => {
    const { rerender } = render(<FilePill name="a.pdf" size="1.4 MB" onRemove={() => {}} />);
    expect(screen.getByText('1.4 MB')).toBeInTheDocument();
    rerender(<FilePill name="a.pdf" onRemove={() => {}} />);
    expect(screen.queryByText(/MB/)).not.toBeInTheDocument();
  });

  test('clicking remove calls onRemove', async () => {
    const onRemove = vi.fn();
    render(<FilePill name="invoice.pdf" onRemove={onRemove} />);
    await userEvent.click(screen.getByLabelText('Remove invoice.pdf'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
