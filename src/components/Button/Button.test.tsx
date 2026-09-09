import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  test('renders children and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('defaults to type="button" so it never submits a parent form by accident', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('disabled button does not fire onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('onColor variant applies the white-pill classes, not btn-primary', () => {
    render(<Button variant="onColor">Add employee</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-white');
    expect(btn.className).not.toContain('btn-primary');
  });

  test('secondary variant applies the neutral outline classes, not btn-primary', () => {
    render(<Button variant="secondary">Cancel</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('border-gray-200');
    expect(btn.className).not.toContain('btn-primary');
  });

  test('xs size applies the compact padding/text classes', () => {
    render(<Button size="xs">Reorder</Button>);
    expect(screen.getByRole('button').className).toContain('text-xs');
  });

  test('lg size matches SiteButton\'s own hero-CTA padding', () => {
    render(<Button size="lg">Get an estimate</Button>);
    expect(screen.getByRole('button').className).toContain('px-6');
  });

  test('xl size steps up once more from lg', () => {
    render(<Button size="xl">Get an estimate</Button>);
    expect(screen.getByRole('button').className).toContain('text-base');
  });
});
