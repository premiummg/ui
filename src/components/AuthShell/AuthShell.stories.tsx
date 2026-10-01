import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AuthShell } from './AuthShell';
import { AuthError } from './AuthError';

const meta: Meta<typeof AuthShell> = {
  title: 'Components/AuthShell',
  component: AuthShell,
};
export default meta;

type Story = StoryObj<typeof AuthShell>;

const labels = {
  toggleDarkMode: 'Toggle dark mode',
  footer: (year: number) => `© ${year} Premium MG - Built with Heart`,
};

// A real `useDarkMode()`-backed consumer manages this itself - the story
// stands in with local state so the toggle button has something to flip.
function Demo({ eyebrow, children, lang }: { eyebrow: string; children: React.ReactNode; lang?: 'en' | 'fr' }) {
  const [isDark, setIsDark] = useState(false);
  return (
    <AuthShell eyebrow={eyebrow} isDark={isDark} onToggleDarkMode={() => setIsDark(d => !d)} labels={labels} lang={lang}>
      {children}
    </AuthShell>
  );
}

export const SignIn: Story = {
  render: () => (
    <Demo eyebrow="Sign in">
      <div className="space-y-4">
        <input className="input-field w-full" placeholder="Email" />
        <input className="input-field w-full" type="password" placeholder="Password" />
        <button className="btn-primary w-full py-2.5">Sign in</button>
      </div>
    </Demo>
  ),
};

export const WithError: Story = {
  render: () => (
    <Demo eyebrow="Sign in">
      <div className="space-y-4">
        <AuthError message="Incorrect email or password." />
        <input className="input-field w-full" placeholder="Email" />
        <input className="input-field w-full" type="password" placeholder="Password" />
        <button className="btn-primary w-full py-2.5">Sign in</button>
      </div>
    </Demo>
  ),
};

export const TwoFactor: Story = {
  render: () => (
    <Demo eyebrow="Two-factor authentication">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code from your authenticator app.</p>
        <input className="input-field w-full text-center tracking-[0.5em]" placeholder="000000" maxLength={6} />
        <button className="btn-primary w-full py-2.5">Verify</button>
      </div>
    </Demo>
  ),
};

// lang="fr" swaps PremiumLogo's own artwork to the French asset - same `Lang`
// a bilingual consumer's LanguageToggle already drives elsewhere.
export const French: Story = {
  render: () => (
    <Demo eyebrow="Se connecter" lang="fr">
      <div className="space-y-4">
        <input className="input-field w-full" placeholder="Courriel" />
        <input className="input-field w-full" type="password" placeholder="Mot de passe" />
        <button className="btn-primary w-full py-2.5">Se connecter</button>
      </div>
    </Demo>
  ),
};
