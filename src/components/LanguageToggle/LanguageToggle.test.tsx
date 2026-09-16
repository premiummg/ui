import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageToggle } from './LanguageToggle';

const names = { en: 'English', fr: 'Acadian French' };

describe('LanguageToggle', () => {
  test('renders both languages, always, with the active one marked aria-pressed', () => {
    render(<LanguageToggle lang="en" onChange={() => {}} names={names} />);
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('FR')).toBeInTheDocument();
    expect(screen.getByLabelText('English')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Acadian French')).toHaveAttribute('aria-pressed', 'false');
  });

  test('clicking the inactive language calls onChange with it', async () => {
    const onChange = vi.fn();
    render(<LanguageToggle lang="en" onChange={onChange} names={names} />);
    await userEvent.click(screen.getByLabelText('Acadian French'));
    expect(onChange).toHaveBeenCalledWith('fr');
  });

  test('the active option is visually filled, the inactive one is not', () => {
    render(<LanguageToggle lang="fr" onChange={() => {}} names={names} />);
    expect(screen.getByLabelText('Acadian French').className).toContain('bg-(--premium-black)');
    expect(screen.getByLabelText('English').className).not.toContain('bg-(--premium-black)');
  });

  test('shows the Acadian flag by default, and Quebec\'s when quebecFlag is set', () => {
    const acadian = render(<LanguageToggle lang="fr" onChange={() => {}} names={names} />);
    expect(acadian.getByLabelText('Acadian French').querySelector('svg path')?.getAttribute('fill')).toBe('#002395');
    acadian.unmount();

    const quebec = render(<LanguageToggle lang="fr" onChange={() => {}} names={names} quebecFlag />);
    expect(quebec.getByLabelText('Acadian French').querySelector('svg path')?.getAttribute('fill')).toBe('#003DA5');
  });
});
