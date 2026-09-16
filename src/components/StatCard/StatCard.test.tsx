import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiTrendingUp } from 'react-icons/fi';
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

  test('renders the icon when given', () => {
    const { container } = render(<StatCard label="Hours this month" value="142.5" icon={FiTrendingUp} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('hint accepts a real element, not just a caption string', () => {
    render(<StatCard label="Hours this month" value="142.5" hint={<button>Change period</button>} />);
    expect(screen.getByRole('button', { name: 'Change period' })).toBeInTheDocument();
  });

  test('does not clip its own overflow, so a real dropdown in hint (MonthNav/WeekNav) can render past its edges', () => {
    const { container } = render(<StatCard label="Hours this month" value="142.5" hint="September 2026" />);
    expect(container.firstChild).not.toHaveClass('overflow-hidden');
  });

  test('tone="amber" uses the hi-vis stripe class instead of the inline red background', () => {
    const { container: amber } = render(<StatCard label="Flagged" value="2" tone="amber" />);
    const { container: normal } = render(<StatCard label="Hours" value="38" />);
    expect(amber.querySelector('.pmg-stripe')).toBeInTheDocument();
    expect(normal.querySelector('.pmg-stripe')).not.toBeInTheDocument();
  });
});
