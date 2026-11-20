import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonHeader } from './PersonHeader';

describe('PersonHeader', () => {
  test('shows the name, role, status, email, phone and actions', () => {
    render(
      <PersonHeader
        photo={<span>photo</span>}
        name="Ana Ruiz"
        roleLabel="Worker"
        active
        email="ana@premiummg.ca"
        phone="+15065550100"
        actions={<button>Edit</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Ana Ruiz' })).toBeInTheDocument();
    expect(screen.getByText('Worker')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ana@premiummg.ca/ })).toHaveAttribute('href', 'mailto:ana@premiummg.ca');
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /506/ })).toHaveAttribute('href', 'tel:+15065550100');
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  test('says when the email is hidden and when the account is off everywhere', () => {
    render(
      <PersonHeader
        photo={null}
        name="Luis"
        roleLabel="Worker"
        active={false}
        email={null}
        inactiveEverywhere={{ label: 'Deactivated everywhere', hint: 'Cannot sign in to any app.' }}
      />,
    );
    expect(screen.getByText('Restricted')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Deactivated everywhere')).toBeInTheDocument();
    expect(screen.getByText('Cannot sign in to any app.')).toBeInTheDocument();
  });
});
