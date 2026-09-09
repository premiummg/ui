import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Eyebrow } from './Eyebrow';

describe('Eyebrow', () => {
  test('renders its text', () => {
    render(<Eyebrow text="Our approach" />);
    expect(screen.getByText('Our approach')).toBeInTheDocument();
  });

  test('defaults to the red tone', () => {
    render(<Eyebrow text="Our approach" />);
    expect(screen.getByText('Our approach').className).toContain('text-(--premium-red)');
  });

  test('white and amber tones apply their own color', () => {
    const { rerender } = render(<Eyebrow tone="white" text="Label" />);
    expect(screen.getByText('Label').className).toContain('text-white/60');
    rerender(<Eyebrow tone="amber" text="Label" />);
    expect(screen.getByText('Label').className).toContain('text-[#FAAD00]');
  });
});
