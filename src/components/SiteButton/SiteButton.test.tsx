import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteButton } from './SiteButton';

describe('SiteButton', () => {
  test('renders children and fires onClick', async () => {
    const onClick = vi.fn();
    render(<SiteButton onClick={onClick}>Get an estimate</SiteButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Get an estimate' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('defaults to type="button"', () => {
    render(<SiteButton>Get an estimate</SiteButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('defaults to the primary variant', () => {
    render(<SiteButton>Get an estimate</SiteButton>);
    expect(screen.getByRole('button').className).toContain('bg-(--premium-red)');
  });

  test('onRed and onDark invert away from the solid-red look', () => {
    const { rerender } = render(<SiteButton variant="onRed">Get an estimate</SiteButton>);
    expect(screen.getByRole('button').className).toContain('bg-white');
    rerender(<SiteButton variant="onDark">Get an estimate</SiteButton>);
    expect(screen.getByRole('button').className).not.toContain('bg-(--premium-red)');
  });
});
