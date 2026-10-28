import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, Toaster } from '../Toaster';
import { RipplingLinkModal, RipplingCandidate, RipplingLinkModalLabels } from './RipplingLinkModal';

const labels: RipplingLinkModalLabels = {
  heading: 'Find in Rippling',
  body: (n) => `Link ${n}`,
  searchPlaceholder: 'Search',
  loading: 'Loading',
  loadError: 'Could not load',
  retry: 'Try again',
  noMatches: 'No matches',
  moreResults: (n) => `+${n} more`,
  link: 'Link',
  linking: 'Linking',
  close: 'Close',
  linkedToast: (n) => `Linked to ${n}`,
  linkError: 'Could not link',
};

const ANA: RipplingCandidate = { worker_id: 'w1', name: 'Ana Ruiz', email: 'ana@x.com', title: 'Taper', status: 'ACTIVE' };
const BRUNO: RipplingCandidate = { worker_id: 'w2', name: 'Bruno Diaz', email: 'bruno@x.com' };

function renderModal(over: Partial<React.ComponentProps<typeof RipplingLinkModal>> = {}) {
  const props = {
    employeeName: '',
    loadCandidates: vi.fn().mockResolvedValue([ANA, BRUNO]),
    onLink: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
    labels,
    ...over,
  };
  render(
    <ToastProvider>
      <RipplingLinkModal {...props} />
      <Toaster />
    </ToastProvider>,
  );
  return props;
}

describe('RipplingLinkModal', () => {
  test('lists the workers and starts the search with the employee name', async () => {
    renderModal({ employeeName: 'Ana' });
    expect(await screen.findByText('Ana Ruiz')).toBeInTheDocument();
    expect(screen.queryByText('Bruno Diaz')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    expect(screen.getByText(/ana@x.com/)).toBeInTheDocument();
  });

  test('linking calls onLink, reports it, calls onLinked and closes', async () => {
    const props = renderModal({ onLinked: vi.fn() });
    await userEvent.click((await screen.findAllByRole('button', { name: 'Link' }))[0]);
    await waitFor(() => expect(props.onLink).toHaveBeenCalledWith(ANA));
    expect(props.onLinked).toHaveBeenCalledWith(ANA);
    expect(props.onClose).toHaveBeenCalled();
    expect(await screen.findByText('Linked to Ana Ruiz')).toBeInTheDocument();
  });

  test('a failed link stays open and shows the message the app gives, else the default', async () => {
    const props = renderModal({ onLink: vi.fn().mockRejectedValue(new Error('taken')), errorMessage: (e) => (e as Error).message });
    await userEvent.click((await screen.findAllByRole('button', { name: 'Link' }))[0]);
    expect(await screen.findByText('taken')).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test('without an errorMessage the default text is used', async () => {
    renderModal({ onLink: vi.fn().mockRejectedValue(new Error('x')) });
    await userEvent.click((await screen.findAllByRole('button', { name: 'Link' }))[0]);
    expect(await screen.findByText('Could not link')).toBeInTheDocument();
  });

  test('a failed load offers a retry that loads again', async () => {
    const loadCandidates = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce([ANA]);
    renderModal({ loadCandidates });
    expect(await screen.findByText('Could not load')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Ana Ruiz')).toBeInTheDocument();
    expect(screen.queryByText('Could not load')).not.toBeInTheDocument();
  });

  test('onlyWorkerIds narrows the offer, and an empty result says so', async () => {
    renderModal({ onlyWorkerIds: new Set(['w2']) });
    expect(await screen.findByText('Bruno Diaz')).toBeInTheDocument();
    expect(screen.queryByText('Ana Ruiz')).not.toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Search'), 'zzz');
    expect(await screen.findByText('No matches')).toBeInTheDocument();
  });

  test('more than 50 matches show 50 and say how many are hidden', async () => {
    const many = Array.from({ length: 53 }, (_, i) => ({ worker_id: `w${i}`, name: `Worker ${i}`, email: `w${i}@x.com` }));
    renderModal({ loadCandidates: vi.fn().mockResolvedValue(many) });
    expect(await screen.findByText('+3 more')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Link' })).toHaveLength(50);
  });
});
