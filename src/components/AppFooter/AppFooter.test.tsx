import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFooter } from './AppFooter';

describe('AppFooter', () => {
  test('shows the copyright and the links it is given', () => {
    render(<AppFooter copyright="© 2026 Premium MG. All rights reserved."><a href="/terms">Terms</a></AppFooter>);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Premium MG. All rights reserved.');
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
  });

  test('works with no links', () => {
    render(<AppFooter copyright="© 2026" />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
