import type { Meta, StoryObj } from '@storybook/react';
import { AuthShell } from './AuthShell';
import { AuthError } from './AuthError';

const meta: Meta<typeof AuthShell> = {
  title: 'Components/AuthShell',
  component: AuthShell,
};
export default meta;

type Story = StoryObj<typeof AuthShell>;

export const SignIn: Story = {
  args: {
    eyebrow: 'Sign in',
    children: (
      <div className="space-y-4">
        <input className="input-field w-full" placeholder="Email" />
        <input className="input-field w-full" type="password" placeholder="Password" />
        <button className="btn-primary w-full py-2.5">Sign in</button>
      </div>
    ),
  },
};

export const WithError: Story = {
  args: {
    eyebrow: 'Sign in',
    children: (
      <div className="space-y-4">
        <AuthError message="Incorrect email or password." />
        <input className="input-field w-full" placeholder="Email" />
        <input className="input-field w-full" type="password" placeholder="Password" />
        <button className="btn-primary w-full py-2.5">Sign in</button>
      </div>
    ),
  },
};

export const TwoFactor: Story = {
  args: {
    eyebrow: 'Two-factor authentication',
    children: (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code from your authenticator app.</p>
        <input className="input-field w-full text-center tracking-[0.5em]" placeholder="000000" maxLength={6} />
        <button className="btn-primary w-full py-2.5">Verify</button>
      </div>
    ),
  },
};
