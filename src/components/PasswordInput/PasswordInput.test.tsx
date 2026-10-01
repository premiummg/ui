import { describe, expect, test, vi } from 'vitest';
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

  test('plain value/onChange mode works without react-hook-form', async () => {
    const onChange = vi.fn();
    render(<PasswordInput label="Password" name="password" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Password'), 'x');
    expect(onChange).toHaveBeenCalled();
  });

  test('plain mode uses `name` for the label/input association, same as registration.name', () => {
    render(<PasswordInput label="Password" name="password" value="secret" onChange={() => {}} />);
    expect(screen.getByLabelText('Password')).toHaveValue('secret');
  });
});
