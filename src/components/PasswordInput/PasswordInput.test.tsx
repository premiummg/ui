import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  test('defaults to a masked password field', () => {
    render(<PasswordInput label="Password" registration={{ name: 'password' }} />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  test('the eye toggle reveals and re-hides the value', async () => {
    render(<PasswordInput label="Password" registration={{ name: 'password' }} />);
    const toggle = screen.getByLabelText('Show password');
    await userEvent.click(toggle);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByLabelText('Hide password'));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  test('renders the error instead of the hint when both are given', () => {
    render(
      <PasswordInput
        label="Password"
        registration={{ name: 'password' }}
        error="Too short"
        hint={<span>At least 8 characters</span>}
      />,
    );
    expect(screen.getByText('Too short')).toBeInTheDocument();
    expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument();
  });
});
