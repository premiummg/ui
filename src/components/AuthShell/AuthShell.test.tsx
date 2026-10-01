import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthShell, AuthError } from '.';

const labels = {
  toggleDarkMode: 'Toggle dark mode',
  footer: (year: number) => `© ${year} Premium MG - Built with Heart`,
};

describe('AuthShell', () => {
  test('renders the eyebrow text and children', () => {
    render(
      <AuthShell eyebrow="Sign in" isDark={false} onToggleDarkMode={() => {}} labels={labels}>
        form goes here
      </AuthShell>,
    );
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('form goes here')).toBeInTheDocument();
  });

  test('renders the translated footer for the current year', () => {
    render(
      <AuthShell eyebrow="Sign in" isDark={false} onToggleDarkMode={() => {}} labels={labels}>
        content
      </AuthShell>,
    );
    expect(screen.getByText(`© ${new Date().getFullYear()} Premium MG - Built with Heart`)).toBeInTheDocument();
  });

  test('the dark-mode toggle calls onToggleDarkMode - state is the consumer\'s, not its own', async () => {
    const onToggleDarkMode = vi.fn();
    render(
      <AuthShell eyebrow="Sign in" isDark={false} onToggleDarkMode={onToggleDarkMode} labels={labels}>
        content
      </AuthShell>,
    );
    await userEvent.click(screen.getByLabelText('Toggle dark mode'));
    expect(onToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  test('passes lang through to the logo (defaults to "en")', () => {
    const { rerender } = render(
      <AuthShell eyebrow="Sign in" isDark={false} onToggleDarkMode={() => {}} labels={labels}>
        content
      </AuthShell>,
    );
    let img = screen.getByAltText('Premium Management Group') as HTMLImageElement;
    expect(img.src).toContain('stacked-light');
    expect(img.src).not.toContain('stacked-light-fr');

    rerender(
      <AuthShell eyebrow="Sign in" isDark={false} onToggleDarkMode={() => {}} labels={labels} lang="fr">
        content
      </AuthShell>,
    );
    img = screen.getByAltText('Premium Management Group') as HTMLImageElement;
    expect(img.src).toContain('stacked-light-fr');
  });

  test('omitting onLangChange shows no language toggle - a sign-in flow with no navbar has nowhere else to put one', () => {
    render(
      <AuthShell eyebrow="Sign in" isDark={false} onToggleDarkMode={() => {}} labels={labels}>
        content
      </AuthShell>,
    );
    expect(screen.queryByLabelText('English')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Français')).not.toBeInTheDocument();
  });

  test('passing onLangChange shows the EN/FR toggle and calls it with the other language', async () => {
    const onLangChange = vi.fn();
    render(
      <AuthShell eyebrow="Sign in" isDark={false} onToggleDarkMode={() => {}} labels={labels} lang="en" onLangChange={onLangChange}>
        content
      </AuthShell>,
    );
    await userEvent.click(screen.getByLabelText('Français'));
    expect(onLangChange).toHaveBeenCalledWith('fr');
  });
});

describe('AuthError', () => {
  test('renders the message', () => {
    render(<AuthError message="Incorrect email or password." />);
    expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument();
  });
});
