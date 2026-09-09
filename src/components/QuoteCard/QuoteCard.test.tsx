import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuoteCard } from './QuoteCard';

describe('QuoteCard', () => {
  test('renders the quote and the name', () => {
    render(<QuoteCard quote="Called them for a quote and they showed up without hesitation." name="Kris J." />);
    expect(screen.getByText('Called them for a quote and they showed up without hesitation.')).toBeInTheDocument();
    expect(screen.getByText('Kris J.')).toBeInTheDocument();
  });
});
