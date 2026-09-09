import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  test('renders title, count and actions', () => {
    render(
      <PageHeader
        backLabel="Dashboard"
        onBack={() => {}}
        title="Employees"
        count={15}
        actions={<button>Add employee</button>}
      />,
    );
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add employee' })).toBeInTheDocument();
  });

  test('renders with no count and no actions', () => {
    render(<PageHeader title="Employees" />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('renders the back link and calls onBack when clicked', async () => {
    const onBack = vi.fn();
    render(<PageHeader backLabel="Dashboard" onBack={onBack} title="Employees" />);
    await userEvent.click(screen.getByRole('button', { name: /Dashboard/ }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('renders no back link when onBack is omitted', () => {
    render(<PageHeader title="Profile" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('countColor overrides the count figure\'s default color', () => {
    render(<PageHeader title="Employees" count={15} countColor="#1A2C6E" />);
    expect(screen.getByText('15')).toHaveStyle({ color: '#1A2C6E' });
  });

  test('children replaces the title/count/actions row entirely', () => {
    render(
      <PageHeader backLabel="Employees" onBack={() => {}}>
        <p>Kris Jenkins</p>
      </PageHeader>,
    );
    expect(screen.getByText('Kris Jenkins')).toBeInTheDocument();
  });
});
