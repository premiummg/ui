import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm, LoginFormLabels } from './LoginForm';

const labels: LoginFormLabels = {
  title: 'Sign in',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  requiredFields: 'Please enter your email and password.',
  loginFailed: 'Login failed',
  submit: 'Sign in',
  submitting: 'Signing in…',
  trailer: 'Having trouble? Contact your system administrator.',
};

async function fillAndSubmit(email = 'jane@premiummg.ca', password = 'hunter2') {
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginForm', () => {
  test('renders the title, fields and trailer', () => {
    render(<LoginForm labels={labels} onLogin={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Having trouble? Contact your system administrator.')).toBeInTheDocument();
  });

  test('omitting labels.trailer shows no trailer line', () => {
    const { trailer, ...withoutTrailer } = labels;
    render(<LoginForm labels={withoutTrailer} onLogin={vi.fn()} />);
    expect(screen.queryByText('Having trouble? Contact your system administrator.')).not.toBeInTheDocument();
  });

  test('empty fields block submit without calling onLogin', async () => {
    const onLogin = vi.fn();
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    // Fires the form's submit event directly rather than clicking the
    // button - a real click would also trip the <input type="email">'s own
    // native constraint validation, which is a separate guard from (and
    // would otherwise mask) this component's own required-fields check.
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form')!);
    expect(onLogin).not.toHaveBeenCalled();
    expect(await screen.findByText('Please enter your email and password.')).toBeInTheDocument();
  });

  test('a malformed email is rejected by the custom validation too (not just the native input type)', async () => {
    const onLogin = vi.fn();
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'hunter2' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form')!);
    expect(onLogin).not.toHaveBeenCalled();
    expect(await screen.findByText('Please enter your email and password.')).toBeInTheDocument();
  });

  test('a valid submit calls onLogin with the trimmed email and password', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    await userEvent.type(screen.getByLabelText('Email'), '  jane@premiummg.ca  ');
    await userEvent.type(screen.getByLabelText('Password'), 'hunter2');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onLogin).toHaveBeenCalledWith('jane@premiummg.ca', 'hunter2');
  });

  test('a rejection with a message shows that message', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Incorrect email or password.'));
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    await fillAndSubmit();
    expect(await screen.findByText('Incorrect email or password.')).toBeInTheDocument();
  });

  test('a rejection with no message falls back to labels.loginFailed', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error());
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    await fillAndSubmit();
    expect(await screen.findByText('Login failed')).toBeInTheDocument();
  });

  test('reads an axios-shaped response.data.error message', async () => {
    const onLogin = vi.fn().mockRejectedValue({ response: { status: 401, data: { error: 'Invalid credentials' } } });
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    await fillAndSubmit();
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  test('a non-transient rejection (e.g. 401) does not retry', async () => {
    const onLogin = vi.fn().mockRejectedValue({ status: 401, message: 'Invalid credentials' });
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    await fillAndSubmit();
    await screen.findByText('Invalid credentials');
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  test('a transient 503-shaped rejection is retried once, silently, and succeeds', async () => {
    const onLogin = vi.fn()
      .mockRejectedValueOnce({ status: 503 })
      .mockResolvedValueOnce(undefined);
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    await fillAndSubmit();
    await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('Login failed')).not.toBeInTheDocument();
  }, 10_000);

  test('a transient error that fails again on retry surfaces that second error', async () => {
    const onLogin = vi.fn()
      .mockRejectedValueOnce({ response: { status: 502 } })
      .mockRejectedValueOnce(new Error('Still down'));
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    await fillAndSubmit();
    expect(await screen.findByText('Still down', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(onLogin).toHaveBeenCalledTimes(2);
  }, 10_000);

  test('shows labels.submitting while the request is in flight', async () => {
    let resolveLogin: () => void;
    const onLogin = vi.fn(() => new Promise<void>(resolve => { resolveLogin = resolve; }));
    render(<LoginForm labels={labels} onLogin={onLogin} />);
    await fillAndSubmit();
    expect(await screen.findByText('Signing in…')).toBeInTheDocument();
    resolveLogin!();
  });
});
