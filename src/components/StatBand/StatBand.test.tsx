import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBand } from './StatBand';

describe('StatBand', () => {
  test('renders every figure with its label, named for assistive tech', () => {
    render(
      <StatBand
        label="Premium in numbers"
        items={[
          { value: '75+', label: 'Years of combined expertise' },
          { value: '4', label: 'Certifications and memberships' },
        ]}
      />,
    );
    expect(screen.getByRole('region', { name: 'Premium in numbers' })).toBeInTheDocument();
    expect(screen.getByText('75+')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Years of combined expertise')).toBeInTheDocument();
  });

  test('a highlighted figure is amber, the rest white', () => {
    render(<StatBand items={[{ value: '[00]', label: 'a', highlight: true }, { value: '4', label: 'b' }]} />);
    expect(screen.getByText('[00]')).toHaveClass('text-(--premium-orange)');
    expect(screen.getByText('4')).toHaveClass('text-white');
  });

  test('renders a note only when given', () => {
    render(<StatBand items={[{ value: '1', label: 'a', note: 'To confirm' }, { value: '2', label: 'b' }]} />);
    expect(screen.getAllByText('To confirm')).toHaveLength(1);
  });
});
