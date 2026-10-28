import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipientPickerModal, RecipientPickerLabels } from './RecipientPickerModal';

const labels: RecipientPickerLabels = {
  heading: 'Who is it for?',
  searchLabel: 'Search people',
  searchPlaceholder: 'Name or division',
  selectAll: 'Select all',
  clearAll: 'Clear all',
  selectedCount: (n) => `${n} selected`,
  empty: 'Nobody found',
  cont: 'Continue',
  cancel: 'Cancel',
};

const people = [
  { id: '1', name: 'Ada Lovelace', sub: 'Drywall' },
  { id: '2', name: 'Grace Hopper', sub: 'PMGS' },
];

describe('RecipientPickerModal', () => {
  test('continue stays disabled until someone is ticked, then hands back the picks', async () => {
    const onContinue = vi.fn();
    render(<RecipientPickerModal people={people} onClose={vi.fn()} onContinue={onContinue} labels={labels} />);
    expect(screen.getByText('Continue')).toBeDisabled();
    await userEvent.click(screen.getByLabelText(/Grace Hopper/));
    await userEvent.click(screen.getByText('Continue'));
    expect(onContinue).toHaveBeenCalledWith([people[1]]);
  });

  test('select all only takes what the search leaves visible', async () => {
    const onContinue = vi.fn();
    render(<RecipientPickerModal people={people} onClose={vi.fn()} onContinue={onContinue} labels={labels} />);
    await userEvent.type(screen.getByLabelText('Search people'), 'ada');
    await userEvent.click(screen.getByText('Select all'));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Continue'));
    expect(onContinue).toHaveBeenCalledWith([people[0]]);
  });

  test('shows the empty text when nothing matches', async () => {
    render(<RecipientPickerModal people={people} onClose={vi.fn()} onContinue={vi.fn()} labels={labels} />);
    await userEvent.type(screen.getByLabelText('Search people'), 'zzz');
    expect(screen.getByText('Nobody found')).toBeInTheDocument();
  });
});
