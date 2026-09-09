import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RankBadge } from './RankBadge';

const STYLES = {
  low: 'border border-transparent text-gray-400',
  high: 'border border-transparent bg-(--premium-red) text-white',
};

describe('RankBadge', () => {
  test('renders the value as the label when no label is given', () => {
    render(<RankBadge value="high" styles={STYLES} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  test('renders a custom label instead of the raw value', () => {
    render(<RankBadge value="high" label="High priority" styles={STYLES} />);
    expect(screen.getByText('High priority')).toBeInTheDocument();
    expect(screen.queryByText('high')).not.toBeInTheDocument();
  });

  test('applies the matching step from the styles map', () => {
    render(<RankBadge value="high" styles={STYLES} />);
    expect(screen.getByText('high')).toHaveClass('bg-(--premium-red)');
  });

  test('falls back to a neutral outline pill for a value missing from the map', () => {
    render(<RankBadge value="unknown" styles={STYLES} />);
    const badge = screen.getByText('unknown');
    expect(badge).toHaveClass('border-gray-200');
    expect(badge).not.toHaveClass('bg-(--premium-red)');
  });
});

describe('RankBadge with the built-in `levels` ramp', () => {
  const LEVELS = ['worker', 'foreman', 'finance', 'manager', 'admin'];

  test('the last level gets the filled top step, in the given color', () => {
    render(<RankBadge value="admin" levels={LEVELS} color="#1A2C6E" />);
    const badge = screen.getByText('admin');
    expect(badge.className).toContain('border-transparent');
    expect(badge).toHaveStyle({ backgroundColor: '#1A2C6E' });
  });

  test('the first level gets the lightest outline step', () => {
    render(<RankBadge value="worker" levels={LEVELS} />);
    expect(screen.getByText('worker').className).toContain('border-transparent');
  });

  test('a middle level gets a heavier outline step than the first', () => {
    render(<RankBadge value="manager" levels={LEVELS} />);
    expect(screen.getByText('manager').className).toContain('border-gray-400');
  });

  test('a value not in `levels` falls back to a neutral pill', () => {
    render(<RankBadge value="contractor" levels={LEVELS} />);
    expect(screen.getByText('contractor').className).toContain('border-gray-200');
  });

  test('`styles` takes precedence over `levels` when both are given', () => {
    render(<RankBadge value="admin" levels={LEVELS} styles={{ admin: 'bg-black text-white' }} />);
    expect(screen.getByText('admin')).toHaveClass('bg-black');
  });
});
