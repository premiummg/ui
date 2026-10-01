import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MfaSetupPanel, MfaSetupPanelLabels } from './MfaSetupPanel';

const labels: MfaSetupPanelLabels = {
  heading: 'Two-factor authentication',
  active: 'Active',
  notConfigured: 'Not configured',
  mandatoryTitle: 'MFA is mandatory for your role',
  mandatoryBody: 'Set it up below before you can continue.',
  subtitle: 'Adds a second verification step when signing in.',
  notSetUp: 'Not set up',
  notSetUpHint: 'Protect your account with an authenticator app.',
  loading: 'Loading…',
  enable: 'Enable MFA',
  activeOnAccount: 'Active on your account',
  requiredEverySignIn: 'Required every sign-in',
  disableMfa: 'Disable MFA',
  confirmDisable: 'Are you sure?',
  disabling: 'Disabling…',
  yesDisable: 'Yes, disable MFA',
  cancel: 'Cancel',
  step1: 'Step 1',
  scanWith: 'Scan with',
  orGoogleAuthenticator: 'or Google Authenticator.',
  cantScan: "Can't scan? Enter code manually",
  step2: 'Step 2',
  enterCode: 'Enter the 6-digit code to confirm',
  verifying: 'Verifying…',
  activate: 'Activate MFA',
  activatedNotice: 'MFA activated successfully.',
  setupFailed: 'Could not start MFA setup.',
  disableFailed: 'Could not disable MFA.',
  invalidCode: 'Invalid code.',
};

describe('MfaSetupPanel', () => {
  test('not-enabled state shows Enable MFA and starts setup on click', async () => {
    const onStartSetup = vi.fn().mockResolvedValue({ qrCode: 'data:image/png;base64,abc', secret: 'SECRET123' });
    render(<MfaSetupPanel labels={labels} enabled={false} mandatory={false} onStartSetup={onStartSetup} onConfirmCode={vi.fn()} onDisable={vi.fn()} />);
    expect(screen.getByText('Not configured')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Enable MFA'));
    expect(onStartSetup).toHaveBeenCalledTimes(1);
    expect(await screen.findByAltText('MFA QR code')).toHaveAttribute('src', 'data:image/png;base64,abc');
    expect(screen.getByText('SECRET123')).toBeInTheDocument();
  });

  test('shows the mandatory banner only when mandatory is true', () => {
    const { rerender } = render(
      <MfaSetupPanel labels={labels} enabled={false} mandatory={false} onStartSetup={vi.fn()} onConfirmCode={vi.fn()} onDisable={vi.fn()} />,
    );
    expect(screen.queryByText('MFA is mandatory for your role')).not.toBeInTheDocument();
    rerender(<MfaSetupPanel labels={labels} enabled={false} mandatory onStartSetup={vi.fn()} onConfirmCode={vi.fn()} onDisable={vi.fn()} />);
    expect(screen.getByText('MFA is mandatory for your role')).toBeInTheDocument();
  });

  test('entering a 6-digit code and confirming calls onConfirmCode, then shows the activated state', async () => {
    const onStartSetup = vi.fn().mockResolvedValue({ qrCode: 'qr.png', secret: 'SECRET' });
    const onConfirmCode = vi.fn().mockResolvedValue(undefined);
    render(<MfaSetupPanel labels={labels} enabled={false} mandatory={false} onStartSetup={onStartSetup} onConfirmCode={onConfirmCode} onDisable={vi.fn()} />);
    await userEvent.click(screen.getByText('Enable MFA'));
    await screen.findByAltText('MFA QR code');
    await userEvent.type(screen.getByPlaceholderText('000000'), '123456');
    await userEvent.click(screen.getByText('Activate MFA'));
    expect(onConfirmCode).toHaveBeenCalledWith('123456');
    expect(await screen.findByText('MFA activated successfully.')).toBeInTheDocument();
  });

  test('already-enabled state requires a confirm step before calling onDisable', async () => {
    const onDisable = vi.fn().mockResolvedValue(undefined);
    render(<MfaSetupPanel labels={labels} enabled mandatory={false} onStartSetup={vi.fn()} onConfirmCode={vi.fn()} onDisable={onDisable} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Disable MFA'));
    expect(onDisable).not.toHaveBeenCalled();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Yes, disable MFA'));
    expect(onDisable).toHaveBeenCalledTimes(1);
  });

  test('a setup failure shows the error without advancing past idle', async () => {
    const onStartSetup = vi.fn().mockRejectedValue(new Error('Network down'));
    render(<MfaSetupPanel labels={labels} enabled={false} mandatory={false} onStartSetup={onStartSetup} onConfirmCode={vi.fn()} onDisable={vi.fn()} />);
    await userEvent.click(screen.getByText('Enable MFA'));
    expect(await screen.findByText('Network down')).toBeInTheDocument();
    expect(screen.queryByAltText('MFA QR code')).not.toBeInTheDocument();
  });
});
