import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { SiteButton, siteButtonClasses } from './SiteButton';

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

  test('with href it renders a real link, not a button', () => {
    render(<SiteButton href="/contact">Get an estimate</SiteButton>);
    const link = screen.getByRole('link', { name: 'Get an estimate' });
    expect(link).toHaveAttribute('href', '/contact');
    expect(link.className).toContain('bg-(--premium-red)');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('with href and onNavigate, a plain click goes through onNavigate instead of reloading', async () => {
    const onNavigate = vi.fn();
    render(<SiteButton href="/contact" onNavigate={onNavigate}>Get an estimate</SiteButton>);
    await userEvent.click(screen.getByRole('link'));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  test('with href and onNavigate, a modified click is left to the browser (new tab)', () => {
    const onNavigate = vi.fn();
    render(<SiteButton href="/contact" onNavigate={onNavigate}>Get an estimate</SiteButton>);
    fireEvent.click(screen.getByRole('link'), { ctrlKey: true });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test('siteButtonClasses matches what the component renders', () => {
    render(<SiteButton variant="ghost">x</SiteButton>);
    expect(screen.getByRole('button').className).toBe(siteButtonClasses('ghost', ''));
  });
});
