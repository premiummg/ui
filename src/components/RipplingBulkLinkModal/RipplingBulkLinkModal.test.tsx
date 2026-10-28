import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, Toaster } from '../Toaster';
import { RipplingBulkLinkModal, RipplingBulkLinkModalLabels } from './RipplingBulkLinkModal';
import type { RipplingBulkSuggestions } from '../RipplingBulk/types';

const labels: RipplingBulkLinkModalLabels = {
  heading: 'Match with Rippling',
  body: 'Review the suggestions.',
  loading: 'Finding matches',
  loadError: 'Could not load the matches',
  retry: 'Try again',
  summary: (a, b, c) => `${a} suggested, ${b} with no match, ${c} free`,
  nothingToMatch: 'Everyone is linked',
  selectAll: (n) => `Select all (${n})`,
  colEmployee: 'Employee',
  colWorker: 'Rippling worker',
  colMatch: 'Match',
  high: 'High',
  possible: 'Possible',
  reasons: { email: 'Same email', name: 'Same name' },
  workerStatus: { ACTIVE: 'Active' },
  skipCodes: { worker_taken: 'Taken by someone else' },
  replacesId: (id) => `Replaces ${id}`,
  noMatchHeading: (n) => `No match (${n})`,
  noMatchHint: 'Search by hand',
  findInRippling: 'Find in Rippling',
  change: 'Change',
  changeTitle: 'Pick another worker',
  link: (n) => `Link ${n} selected`,
  linking: 'Linking',
  close: 'Close',
  done: 'Done',
  resultLinked: (n) => `${n} linked`,
  resultSkipped: (n) => `${n} could not be linked`,
  linkError: 'Could not link',
};

const linkOneLabels = {
  heading: 'Find in Rippling', body: (n: string) => `For ${n}`, searchPlaceholder: 'Search', loading: 'Loading', loadError: 'Could not load',
  retry: 'Retry', noMatches: 'No matches', moreResults: (n: number) => `+${n}`, link: 'Link', linking: 'Linking', close: 'Close',
  linkedToast: (n: string) => `Linked ${n}`, linkError: 'Could not link',
};

function suggestion(id: string, worker: string, confidence: 'high' | 'possible') {
  return {
    employee_id: id, employee_name: `Emp ${id}`, employee_email: `${id}@x.com`, previous_rippling_id: null,
    worker_id: worker, worker_name: `Worker ${worker}`, worker_email: `${worker}@r.com`, worker_title: 'Taper', worker_status: 'ACTIVE',
    confidence, reasons: ['email', 'name'],
  };
}

const DATA: RipplingBulkSuggestions = {
  suggestions: [suggestion('e1', 'w1', 'high'), suggestion('e2', 'w2', 'possible')],
  unmatched: [{ employee_id: 'e3', employee_name: 'Emp e3', employee_email: 'e3@x.com' }],
  unlinked_workers: 5,
  free_worker_ids: ['w1', 'w2', 'w9'],
};

function renderModal(over: Partial<React.ComponentProps<typeof RipplingBulkLinkModal>> = {}) {
  const props = {
    loadSuggestions: vi.fn().mockResolvedValue(DATA),
    onLinkBulk: vi.fn().mockResolvedValue({ linked: [{ employee_id: 'e1', worker_id: 'w1' }], skipped: [] }),
    linkOne: {
      loadCandidates: vi.fn().mockResolvedValue([{ worker_id: 'w9', name: 'Zed Free', email: 'zed@r.com' }]),
      onLink: vi.fn().mockResolvedValue(undefined),
      labels: linkOneLabels,
    },
    onLinked: vi.fn(),
    onClose: vi.fn(),
    labels,
    ...over,
  };
  render(<ToastProvider><RipplingBulkLinkModal {...props} /><Toaster /></ToastProvider>);
  return props;
}

describe('RipplingBulkLinkModal', () => {
  test('confident matches start ticked and doubtful ones do not', async () => {
    renderModal();
    await screen.findByText('Emp e1');
    expect(screen.getByRole('button', { name: 'Link 1 selected' })).toBeInTheDocument();
    expect(screen.getByText('5 free', { exact: false })).toBeInTheDocument();
    expect(screen.getAllByText('Same email · Same name')).toHaveLength(2);
  });

  test('linking sends only the ticked pairs, reports and closes when nothing was skipped', async () => {
    const props = renderModal();
    await userEvent.click(await screen.findByRole('button', { name: 'Link 1 selected' }));
    await waitFor(() => expect(props.onLinkBulk).toHaveBeenCalledWith([{ employee_id: 'e1', worker_id: 'w1' }]));
    expect(props.onLinked).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  test('skipped pairs are named with their reason and the dialog stays open', async () => {
    const props = renderModal({ onLinkBulk: vi.fn().mockResolvedValue({ linked: [], skipped: [{ employee_id: 'e1', code: 'worker_taken' }] }) });
    await userEvent.click(await screen.findByRole('button', { name: 'Link 1 selected' }));
    expect(await screen.findByText('Emp e1')).toBeInTheDocument();
    expect(screen.getByText('Taken by someone else')).toBeInTheDocument();
    expect(screen.getByText('0 linked', { exact: false })).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test('a failed bulk link shows the default error and stays open', async () => {
    const props = renderModal({ onLinkBulk: vi.fn().mockRejectedValue(new Error('x')) });
    await userEvent.click(await screen.findByRole('button', { name: 'Link 1 selected' }));
    expect(await screen.findByText('Could not link')).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test('select all ticks everyone, a second click clears them', async () => {
    renderModal();
    await userEvent.click(await screen.findByLabelText('Select all (2)'));
    expect(screen.getByRole('button', { name: 'Link 2 selected' })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Select all (2)'));
    expect(screen.getByRole('button', { name: 'Link 0 selected' })).toBeDisabled();
  });

  test('matching one by hand offers only free workers, links, and moves the employee out of the lists', async () => {
    const props = renderModal();
    await userEvent.click(await screen.findByRole('button', { name: 'Find in Rippling' }));
    // The search is filled with the employee name; clear it to see the free worker.
    const search = await screen.findByPlaceholderText('Search');
    await userEvent.clear(search);
    expect(await screen.findByText('Zed Free')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Link' }));
    await waitFor(() => expect(props.linkOne.onLink).toHaveBeenCalledWith('e3', expect.objectContaining({ worker_id: 'w9' })));
    await waitFor(() => expect(screen.queryByText('No match (1)')).not.toBeInTheDocument());
    expect(props.onLinked).toHaveBeenCalled();
  });

  test('a worker linked by hand to someone else sends whoever was suggested that worker back to no match', async () => {
    const props = renderModal({
      linkOne: {
        loadCandidates: vi.fn().mockResolvedValue([{ worker_id: 'w2', name: 'Worker w2', email: 'w2@r.com' }]),
        onLink: vi.fn().mockResolvedValue(undefined),
        labels: linkOneLabels,
      },
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Find in Rippling' }));
    const search = await screen.findByPlaceholderText('Search');
    await userEvent.clear(search);
    const dialog = (await screen.findByText('Find in Rippling', { selector: 'h3' })).closest('div')!.parentElement!;
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Link' }));
    // e2 was suggested w2: it leaves the suggestions and joins the ones with no match, e3 is done.
    expect(await screen.findByLabelText('Select all (1)')).toBeInTheDocument();
    expect(screen.queryByText('Possible')).not.toBeInTheDocument();
    expect(screen.getAllByText('Emp e2')).toHaveLength(1);
    expect(screen.queryByText('Emp e3')).not.toBeInTheDocument();
    expect(props.onLinked).toHaveBeenCalled();
  });

  test('a failed load offers a retry; nothing to match says so', async () => {
    const loadSuggestions = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ suggestions: [], unmatched: [], unlinked_workers: 0, free_worker_ids: [] });
    renderModal({ loadSuggestions });
    expect(await screen.findByText('Could not load the matches')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Everyone is linked')).toBeInTheDocument();
  });
});
