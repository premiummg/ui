import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPill } from './FilterPill';

describe('FilterPill', () => {
  test('active applies the brand red background', () => {
    render(<FilterPill label="Admin" active onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('bg-(--premium-red)');
  });

  test('inactive has no brand red background', () => {
    render(<FilterPill label="Admin" active={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).not.toHaveClass('bg-(--premium-red)');
  });

  test('clicking calls onClick', async () => {
    const onClick = vi.fn();
    render(<FilterPill label="Admin" active={false} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
