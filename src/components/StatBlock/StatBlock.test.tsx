import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBlock } from './StatBlock';

describe('StatBlock', () => {
  test('renders the value and label', () => {
    render(<StatBlock value="56%" label="Openness to new ideas" />);
    expect(screen.getByText('56%')).toBeInTheDocument();
    expect(screen.getByText('Openness to new ideas')).toBeInTheDocument();
  });

  test('defaults to the brand secondary red, overridable', () => {
    const { getByText, rerender } = render(<StatBlock value="56%" label="l" />);
    expect(getByText('56%')).toHaveStyle({ color: 'var(--premium-red-dark)' });
    rerender(<StatBlock value="56%" label="l" color="#7A2E2E" />);
    expect(getByText('56%')).toHaveStyle({ color: '#7A2E2E' });
  });
});
