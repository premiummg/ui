import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PremiumMark } from './PremiumMark';

describe('PremiumMark', () => {
  test('is hidden from screen readers unless it has a title', () => {
    const { container } = render(<PremiumMark />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  test('exposes the title as an accessible image', () => {
    render(<PremiumMark title="Premium" />);
    expect(screen.getByRole('img', { name: 'Premium' })).toBeInTheDocument();
  });

  test('takes its size as the rendered height and follows the text color', () => {
    const { container } = render(<PremiumMark size={16} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });
});
