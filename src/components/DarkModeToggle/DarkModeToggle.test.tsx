import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DarkModeToggle } from './DarkModeToggle';

describe('DarkModeToggle', () => {
  test('shows a moon (switch-to-dark) when currently light', () => {
    const { container } = render(<DarkModeToggle isDark={false} onToggle={() => {}} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('clicking calls onToggle', async () => {
    const onToggle = vi.fn();
    render(<DarkModeToggle isDark={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByLabelText('Toggle dark mode'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('ariaLabel overrides the default aria-label', () => {
    render(<DarkModeToggle isDark={false} onToggle={() => {}} ariaLabel="Basculer le mode sombre" />);
    expect(screen.getByLabelText('Basculer le mode sombre')).toBeInTheDocument();
  });
});
