import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchPicker, PickerGroup } from './SearchPicker';

const groups: PickerGroup[] = [
  { label: 'Projects', items: [
    { id: '1', label: 'Northgate Tower', sub: 'PRJ-100' },
    { id: '2', label: 'Riverside Commons', sub: 'PRJ-101' },
  ] },
];

describe('SearchPicker', () => {
  test('shows the placeholder when nothing is selected', () => {
    render(<SearchPicker groups={groups} placeholder="Search projects…" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search projects…')).toBeInTheDocument();
  });

  test('focusing opens the dropdown with every item, grouped', async () => {
    render(<SearchPicker groups={groups} placeholder="Search projects…" onChange={() => {}} />);
    await userEvent.click(screen.getByPlaceholderText('Search projects…'));
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Northgate Tower')).toBeInTheDocument();
    expect(screen.getByText('Riverside Commons')).toBeInTheDocument();
  });

  test('typing filters by label or sub', async () => {
    render(<SearchPicker groups={groups} placeholder="Search projects…" onChange={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText('Search projects…'), 'river');
    expect(screen.getByText('Riverside Commons')).toBeInTheDocument();
    expect(screen.queryByText('Northgate Tower')).not.toBeInTheDocument();
  });

  test('typing something nobody matches shows the empty text', async () => {
    render(<SearchPicker groups={groups} placeholder="Search projects…" emptyText="Nothing found" onChange={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText('Search projects…'), 'zzz');
    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });

  test('picking an item calls onChange with it', async () => {
    const onChange = vi.fn();
    render(<SearchPicker groups={groups} placeholder="Search projects…" onChange={onChange} />);
    await userEvent.click(screen.getByPlaceholderText('Search projects…'));
    await userEvent.click(screen.getByText('Northgate Tower'));
    expect(onChange).toHaveBeenCalledWith(groups[0].items[0]);
  });

  test('a controlled value collapses to a chip with a clear button', async () => {
    const onChange = vi.fn();
    render(<SearchPicker groups={groups} placeholder="Search projects…" value={groups[0].items[0]} onChange={onChange} />);
    expect(screen.getByText('Northgate Tower')).toBeInTheDocument();
    expect(screen.getByText('PRJ-100')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Clear selection'));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
