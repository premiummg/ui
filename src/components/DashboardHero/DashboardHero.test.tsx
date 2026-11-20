import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHero } from './DashboardHero';

describe('DashboardHero', () => {
  test('shows the eyebrow, greeting and subtitle', () => {
    render(<DashboardHero eyebrow="Monday" title="Welcome back, Ana" subtitle="3 news" />);
    expect(screen.getByRole('heading', { name: 'Welcome back, Ana' })).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('3 news')).toBeInTheDocument();
  });
});
