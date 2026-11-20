import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterToggleButton } from './FilterToggleButton';

describe('FilterToggleButton', () => {
  test('says how many filters are on and toggles', async () => {
    const onClick = vi.fn();
    render(<FilterToggleButton open={false} count={2} onClick={onClick} />);
    const button = screen.getByRole('button', { name: /Filters/ });
    expect(button).toHaveTextContent('2');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  test('shows no count when nothing is filtered', () => {
    render(<FilterToggleButton open count={0} onClick={() => {}} label="Filtres" />);
    expect(screen.getByRole('button', { name: 'Filtres' })).toHaveAttribute('aria-expanded', 'true');
  });
});
