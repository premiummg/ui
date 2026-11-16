import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CredentialBadges } from './CredentialBadges';

const ITEMS = [
  { src: '/ul.jpg', name: 'UL Certified', href: 'https://www.ul.com/' },
  { src: '/cor.jpg', name: 'COR' },
];

describe('CredentialBadges', () => {
  test('names every mark in its alt text', () => {
    render(<CredentialBadges items={ITEMS} />);
    expect(screen.getByAltText('UL Certified')).toHaveAttribute('src', '/ul.jpg');
    expect(screen.getByAltText('COR')).toBeInTheDocument();
  });

  test('a mark with href links to the issuing body in a new tab; one without is not a link', () => {
    render(<CredentialBadges items={ITEMS} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://www.ul.com/');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('bordered adds a hairline to each plate', () => {
    const { container } = render(<CredentialBadges items={ITEMS} bordered />);
    expect(container.innerHTML).toContain('border-gray-200');
  });
});
