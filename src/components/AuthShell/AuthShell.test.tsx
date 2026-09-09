import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthShell, AuthError } from '.';

describe('AuthShell', () => {
  test('renders the eyebrow text and children', () => {
    render(<AuthShell eyebrow="Sign in">form goes here</AuthShell>);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('form goes here')).toBeInTheDocument();
  });

  test('the dark-mode toggle flips html.dark', async () => {
    document.documentElement.classList.remove('dark');
    render(<AuthShell eyebrow="Sign in">content</AuthShell>);
    await userEvent.click(screen.getByLabelText('Toggle dark mode'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    document.documentElement.classList.remove('dark');
  });
});

describe('AuthError', () => {
  test('renders the message', () => {
    render(<AuthError message="Incorrect email or password." />);
    expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument();
  });
});
