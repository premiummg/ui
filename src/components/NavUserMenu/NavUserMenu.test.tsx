import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavUserMenu, NavMobileSettings } from './NavUserMenu';

describe('NavUserMenu', () => {
  test('opens Profile and Sign out, closing the menu on each', () => {
    const onProfile = vi.fn();
    const onSignOut = vi.fn();
    render(<NavUserMenu name="Ana Ruiz" roleLabel="Admin" onProfile={onProfile} onSignOut={onSignOut} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ana Ruiz/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Profile' }));
    expect(onProfile).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Ana Ruiz/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalled();
  });
});

describe('NavMobileSettings', () => {
  test('shows the extra rows, the language and the dark mode toggle', () => {
    const onToggleDark = vi.fn();
    render(
      <NavMobileSettings lang="en" onLangChange={() => {}} langNames={{ en: 'English', fr: 'French' }} isDark={false} onToggleDark={onToggleDark}>
        <a href="/x">Intranet</a>
      </NavMobileSettings>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByText('Intranet')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }));
    expect(onToggleDark).toHaveBeenCalled();
    expect(screen.queryByText('Language')).toBeNull();
  });
});
