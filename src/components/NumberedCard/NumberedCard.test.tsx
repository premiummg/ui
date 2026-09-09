import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NumberedCard } from './NumberedCard';

describe('NumberedCard', () => {
  test('zero-pads a numeric step and renders title/body', () => {
    render(
      <NumberedCard number={1} title="Contact and evaluation">
        Free consultation and site evaluation.
      </NumberedCard>,
    );
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('Contact and evaluation')).toBeInTheDocument();
    expect(screen.getByText('Free consultation and site evaluation.')).toBeInTheDocument();
  });

  test('renders a string number as-is, with no padding', () => {
    render(<NumberedCard number="A" title="t">b</NumberedCard>);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('defaults the figure color to the brand red, overridable, with a lightened dark-mode variant', () => {
    const { container, rerender } = render(<NumberedCard number={1} title="t">b</NumberedCard>);
    expect(container.firstChild).toHaveStyle({ '--nc-accent': 'var(--premium-red)' });
    expect(container.firstChild).toHaveStyle({ '--nc-accent-dark': 'color-mix(in srgb, var(--premium-red) 60%, white)' });
    rerender(<NumberedCard number={1} title="t" color="#1A2C6E">b</NumberedCard>);
    expect(container.firstChild).toHaveStyle({ '--nc-accent': '#1A2C6E' });
  });
});
