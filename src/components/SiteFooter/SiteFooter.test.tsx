import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter, FooterColumn } from './SiteFooter';

describe('SiteFooter', () => {
  test('renders its column children and the copyright line', () => {
    render(
      <SiteFooter copyright="© 2026 Premium MG">
        <FooterColumn label="Services">
          <p>Framing</p>
        </FooterColumn>
      </SiteFooter>,
    );
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Framing')).toBeInTheDocument();
    expect(screen.getByText('© 2026 Premium MG')).toBeInTheDocument();
  });

  test('renders legalLinks only when given', () => {
    const { rerender } = render(<SiteFooter copyright="c"><div /></SiteFooter>);
    expect(screen.queryByText('Terms')).not.toBeInTheDocument();
    rerender(
      <SiteFooter copyright="c" legalLinks={<button>Terms</button>}>
        <div />
      </SiteFooter>,
    );
    expect(screen.getByText('Terms')).toBeInTheDocument();
  });
});

describe('FooterColumn', () => {
  test('renders without a label', () => {
    render(
      <FooterColumn>
        <p>content</p>
      </FooterColumn>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
