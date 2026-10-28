import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  test('with href it is a real link, and a plain click goes through onClick instead of reloading', async () => {
    const onClick = vi.fn();
    render(<NavTile icon={FiUsers} label="Employees" description="Manage team members" href="/employees" onClick={onClick} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/employees');
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('with href, a modified click is left to the browser (new tab)', async () => {
    const onClick = vi.fn();
    render(<NavTile icon={FiUsers} label="Employees" description="Manage team members" href="/employees" onClick={onClick} />);
    fireEvent.click(screen.getByRole('link'), { ctrlKey: true });
    expect(onClick).not.toHaveBeenCalled();
  });
});
