import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortraitFigure } from './PortraitFigure';

describe('PortraitFigure', () => {
  test('renders the image with a name+role alt, and the name/role text', () => {
    render(<PortraitFigure imageSrc="/denis.jpg" name="Denis Collin" role="Founder" />);
    expect(screen.getByAltText('Denis Collin, Founder')).toBeInTheDocument();
    expect(screen.getByText('Denis Collin')).toBeInTheDocument();
    expect(screen.getByText('Founder')).toBeInTheDocument();
  });

  test('defaults the tag to the Premium secondary red', () => {
    render(<PortraitFigure imageSrc="/denis.jpg" name="Denis Collin" role="Founder" />);
    expect(screen.getByText('Denis Collin').closest('figcaption')).toHaveStyle({ backgroundColor: 'var(--premium-red-dark)' });
  });

  test('a custom color overrides the default', () => {
    render(<PortraitFigure imageSrc="/denis.jpg" name="Denis Collin" role="Founder" color="#1A2C6E" />);
    expect(screen.getByText('Denis Collin').closest('figcaption')).toHaveStyle({ backgroundColor: '#1A2C6E' });
  });
});
