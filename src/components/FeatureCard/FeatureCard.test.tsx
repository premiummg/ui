import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard', () => {
  test('renders the icon, title, and body', () => {
    render(
      <FeatureCard icon={<svg data-testid="icon" />} title="Local expertise">
        Based nearby, active everywhere.
      </FeatureCard>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Local expertise')).toBeInTheDocument();
    expect(screen.getByText('Based nearby, active everywhere.')).toBeInTheDocument();
  });

  test('defaults to left alignment, no centering classes', () => {
    const { container } = render(
      <FeatureCard icon={<svg />} title="Local expertise">Body</FeatureCard>,
    );
    expect(container.firstChild).not.toHaveClass('items-center');
  });

  test('align="center" centers the icon, title and body', () => {
    const { container } = render(
      <FeatureCard icon={<svg />} title="Local expertise" align="center">Body</FeatureCard>,
    );
    expect(container.firstChild).toHaveClass('items-center', 'text-center');
  });
});
