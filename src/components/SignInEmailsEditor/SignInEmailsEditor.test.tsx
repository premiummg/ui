import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignInEmailsEditor, ExtraEmailsInput } from './SignInEmailsEditor';

const emails = [
  { id: 'a', email: 'ana@x.com', is_primary: true },
  { id: 'b', email: 'ana@gmail.com', is_primary: false },
];

describe('SignInEmailsEditor', () => {
  test('marks the primary and offers the others primary or removal', () => {
    const onSetPrimary = vi.fn();
    const onRemove = vi.fn();
    render(<SignInEmailsEditor emails={emails} onSetPrimary={onSetPrimary} onRemove={onRemove} newEmail="" onNewEmailChange={() => {}} onAdd={() => {}} />);
    expect(screen.getByText('Primary')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Make primary' }));
    expect(onSetPrimary).toHaveBeenCalledWith('b');
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledWith('b');
    expect(screen.getByRole('button', { name: /Add/ })).toBeDisabled();
  });

  test('Enter in the add field adds the email without submitting a form', () => {
    const onAdd = vi.fn();
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SignInEmailsEditor emails={[]} onSetPrimary={() => {}} onRemove={() => {}} newEmail="new@x.com" onNewEmailChange={() => {}} onAdd={onAdd} error="Taken" />
      </form>,
    );
    fireEvent.keyDown(screen.getByLabelText('Add another email'), { key: 'Enter' });
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Taken')).toBeInTheDocument();
  });
});

describe('ExtraEmailsInput', () => {
  test('edits, adds and removes rows, keeping one', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ExtraEmailsInput emails={['a@x.com']} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Additional email 1'), { target: { value: 'b@x.com' } });
    expect(onChange).toHaveBeenLastCalledWith(['b@x.com']);
    fireEvent.click(screen.getByRole('button', { name: 'Add another email' }));
    expect(onChange).toHaveBeenLastCalledWith(['a@x.com', '']);
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onChange).toHaveBeenLastCalledWith(['']);
    rerender(<ExtraEmailsInput emails={['a@x.com', 'c@x.com']} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    expect(onChange).toHaveBeenLastCalledWith(['c@x.com']);
  });
});
