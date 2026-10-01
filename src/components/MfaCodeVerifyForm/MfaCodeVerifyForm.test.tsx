import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MfaCodeVerifyForm, MfaCodeVerifyFormLabels } from './MfaCodeVerifyForm';

const labels: MfaCodeVerifyFormLabels = {
  title: 'Enter your code',
  subtitle: '6-digit code from your authenticator app.',
  codeAriaLabel: 'Six-digit authentication code',
  of: 'of',
  rotate: 'codes rotate every 30 seconds',
  verifying: 'Verifying…',
  verify: 'Verify',
  lostDevice: 'Lost the device?',
  backToSignIn: 'Back to sign in',
  invalidCode: 'Invalid code',
};

function getHiddenInput() {
  return screen.getByLabelText(labels.codeAriaLabel);
}

describe('MfaCodeVerifyForm', () => {
  test('submit is disabled until six digits are entered', async () => {
    render(<MfaCodeVerifyForm labels={labels} onVerify={vi.fn()} onBackToSignIn={vi.fn()} />);
    expect(screen.getByText('Verify').closest('button')).toBeDisabled();
    await userEvent.type(getHiddenInput(), '12345');
    expect(screen.getByText('Verify').closest('button')).toBeDisabled();
    await userEvent.type(getHiddenInput(), '6');
    expect(screen.getByText('Verify').closest('button')).not.toBeDisabled();
  });

  test('non-digit characters are stripped and the code is capped at 6', async () => {
    render(<MfaCodeVerifyForm labels={labels} onVerify={vi.fn()} onBackToSignIn={vi.fn()} />);
    await userEvent.type(getHiddenInput(), '12a3b4c5d6e7');
    expect(getHiddenInput()).toHaveValue('123456');
  });

  test('submitting a full code calls onVerify with it', async () => {
    const onVerify = vi.fn().mockResolvedValue(undefined);
    render(<MfaCodeVerifyForm labels={labels} onVerify={onVerify} onBackToSignIn={vi.fn()} />);
    await userEvent.type(getHiddenInput(), '654321');
    await userEvent.click(screen.getByText('Verify'));
    expect(onVerify).toHaveBeenCalledWith('654321');
  });

  test('a rejection with a message shows that message and clears the code', async () => {
    const onVerify = vi.fn().mockRejectedValue(new Error('That code already expired'));
    render(<MfaCodeVerifyForm labels={labels} onVerify={onVerify} onBackToSignIn={vi.fn()} />);
    await userEvent.type(getHiddenInput(), '111111');
    await userEvent.click(screen.getByText('Verify'));
    expect(await screen.findByText('That code already expired')).toBeInTheDocument();
    expect(getHiddenInput()).toHaveValue('');
  });

  test('a rejection with no message falls back to labels.invalidCode', async () => {
    const onVerify = vi.fn().mockRejectedValue(new Error());
    render(<MfaCodeVerifyForm labels={labels} onVerify={onVerify} onBackToSignIn={vi.fn()} />);
    await userEvent.type(getHiddenInput(), '222222');
    await userEvent.click(screen.getByText('Verify'));
    expect(await screen.findByText('Invalid code')).toBeInTheDocument();
  });

  test('clicking back to sign in calls onBackToSignIn', async () => {
    const onBackToSignIn = vi.fn();
    render(<MfaCodeVerifyForm labels={labels} onVerify={vi.fn()} onBackToSignIn={onBackToSignIn} />);
    await userEvent.click(screen.getByText('Back to sign in'));
    expect(onBackToSignIn).toHaveBeenCalledTimes(1);
  });
});
