import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortableColumnHeader } from './SortableColumnHeader';

function renderInTable(ui: React.ReactElement) {
  return render(<table><thead><tr>{ui}</tr></thead></table>);
}

describe('SortableColumnHeader', () => {
  test('renders as a <th> with the label', () => {
    renderInTable(<SortableColumnHeader col="name" label="Name" sortBy="name" sortDir="asc" onSort={() => {}} />);
    expect(screen.getByRole('columnheader')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  test('clicking calls onSort with the column key', async () => {
    const onSort = vi.fn();
    renderInTable(<SortableColumnHeader col="name" label="Name" sortBy="date" sortDir="asc" onSort={onSort} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSort).toHaveBeenCalledWith('name');
  });

  test('the active column highlights in brand red', () => {
    renderInTable(<SortableColumnHeader col="name" label="Name" sortBy="name" sortDir="asc" onSort={() => {}} />);
    expect(screen.getByRole('button').className).toContain('text-(--premium-red)');
  });
});
