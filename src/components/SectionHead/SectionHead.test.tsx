import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHead } from './SectionHead';

describe('SectionHead', () => {
  test('renders eyebrow, title and sub', () => {
    render(<SectionHead eyebrow="Our approach" title="Built with heart" sub="Every project, every time." />);
    expect(screen.getByText('Our approach')).toBeInTheDocument();
    expect(screen.getByText('Built with heart')).toBeInTheDocument();
    expect(screen.getByText('Every project, every time.')).toBeInTheDocument();
  });

  test('renders no sub paragraph when none is given', () => {
    render(<SectionHead eyebrow="Our approach" title="Built with heart" />);
    expect(screen.queryByText('Every project, every time.')).not.toBeInTheDocument();
  });

  test('tone="dark" switches the title and sub to white/translucent-white', () => {
    render(<SectionHead eyebrow="Our approach" title="Built with heart" sub="Every project." tone="dark" />);
    expect(screen.getByText('Built with heart').className).toContain('text-white');
    expect(screen.getByText('Every project.').className).toContain('text-white/70');
  });
});
