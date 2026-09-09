import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  test('renders the label, value and hint', () => {
    render(<StatCard label="Hours this week" value="38.2" hint="this week" />);
    expect(screen.getByText('Hours this week')).toBeInTheDocument();
    expect(screen.getByText('38.2')).toBeInTheDocument();
    expect(screen.getByText('this week')).toBeInTheDocument();
  });

  test('renders as a plain div (no button role) when there is no onClick', () => {
    render(<StatCard label="Hours this week" value="38.2" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders as a real button, and fires onClick, when one is given', async () => {
    const onClick = vi.fn();
    render(<StatCard label="Pending" value="3" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('accent="amber" uses the hi-vis stripe class instead of the inline red background', () => {
    const { container: amber } = render(<StatCard label="Flagged" value="2" accent="amber" />);
    const { container: normal } = render(<StatCard label="Hours" value="38" />);
    expect(amber.querySelector('.pmg-stripe')).toBeInTheDocument();
    expect(normal.querySelector('.pmg-stripe')).not.toBeInTheDocument();
  });
});
