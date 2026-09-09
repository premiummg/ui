import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';

describe('Layout', () => {
  test('renders children inside <main>', () => {
    render(<Layout>page content</Layout>);
    const main = screen.getByText('page content').closest('main');
    expect(main).toBeInTheDocument();
  });

  test('renders the given navbar above main', () => {
    render(<Layout navbar={<nav>My App Navbar</nav>}>page content</Layout>);
    expect(screen.getByText('My App Navbar')).toBeInTheDocument();
  });

  test('renders with no navbar at all when none is given', () => {
    const { container } = render(<Layout>page content</Layout>);
    expect(container.querySelector('nav')).not.toBeInTheDocument();
  });
});
