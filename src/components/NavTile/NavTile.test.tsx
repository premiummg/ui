import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiUsers } from 'react-icons/fi';
import { NavTile } from './NavTile';

describe('NavTile', () => {
  test('renders the label and description', () => {
    render(<NavTile icon={FiUsers} label="Employees" description="Manage team members" onClick={() => {}} />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Manage team members')).toBeInTheDocument();
  });

  test('is a real button and fires onClick', async () => {
    const onClick = vi.fn();
    render(<NavTile icon={FiUsers} label="Employees" description="Manage team members" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
