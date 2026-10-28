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

  test('neutral tones, a custom element and layout classes', () => {
    render(
      <table><thead><tr><Eyebrow as="th" tone="muted" className="px-5 text-left" text="Name" /></tr></thead></table>,
    );
    const th = screen.getByText('Name');
    expect(th.tagName).toBe('TH');
    expect(th.className).toContain('pmg-eyebrow');
    expect(th.className).toContain('text-gray-400');
    expect(th.className).toContain('px-5');
  });
});
