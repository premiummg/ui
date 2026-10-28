import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider } from '../Toaster';
import { RipplingBulkLinkModal } from './RipplingBulkLinkModal';

const single = {
  heading: 'Find in Rippling', body: (n: string) => `Link ${n}`, searchPlaceholder: 'Search name or email...', loading: 'Loading...',
  loadError: 'Could not load', retry: 'Try again', noMatches: 'No matches', moreResults: (n: number) => `+${n} more`, link: 'Link',
  linking: 'Linking...', close: 'Close', linkedToast: (n: string) => `Linked to ${n}`, linkError: 'Could not link',
};

const meta: Meta<typeof RipplingBulkLinkModal> = {
  title: 'Components/RipplingBulkLinkModal',
  component: RipplingBulkLinkModal,
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
  args: {
    loadSuggestions: async () => ({
      suggestions: [
        { employee_id: 'e1', employee_name: 'Ana Ruiz', employee_email: 'ana@premiummg.ca', previous_rippling_id: null, worker_id: 'w1', worker_name: 'Ana Ruiz', worker_email: 'ana.r@gmail.com', worker_title: 'Taper', worker_status: 'ACTIVE', confidence: 'high', reasons: ['name', 'phone'] },
        { employee_id: 'e2', employee_name: 'Bruno Diaz', employee_email: 'bruno@premiummg.ca', previous_rippling_id: 'old-id', worker_id: 'w2', worker_name: 'B. Diaz', worker_email: 'bd@gmail.com', worker_title: null, worker_status: 'HIRED', confidence: 'possible', reasons: ['similar'] },
      ],
      unmatched: [{ employee_id: 'e3', employee_name: 'Cora Vega', employee_email: 'cora@premiummg.ca' }],
      unlinked_workers: 4,
      free_worker_ids: ['w1', 'w2', 'w9'],
    }),
    onLinkBulk: async (links) => ({ linked: links, skipped: [] }),
    linkOne: { loadCandidates: async () => [], onLink: async () => {}, labels: single },
    onLinked: () => {},
    onClose: () => {},
    labels: {
      heading: 'Match with Rippling', body: 'Review the suggested Rippling worker for each employee and link them all at once.', loading: 'Finding matches...',
      loadError: 'Could not load the matches', retry: 'Try again',
      summary: (a: number, b: number, c: number) => `${a} suggested, ${b} with no match, ${c} Rippling workers not linked yet`,
      nothingToMatch: 'Every active employee is already linked.', selectAll: (n: number) => `Select all (${n})`,
      colEmployee: 'Employee', colWorker: 'Rippling worker', colMatch: 'Match', high: 'High', possible: 'Possible',
      reasons: { name: 'Same name', phone: 'Same phone', similar: 'Similar name' }, workerStatus: { ACTIVE: 'Active', HIRED: 'Hired' },
      skipCodes: { worker_taken: 'That worker is linked to someone else' }, replacesId: (id: string) => `Replaces the current ID (${id})`,
      noMatchHeading: (n: number) => `No match found (${n})`, noMatchHint: 'Search Rippling yourself for any of them.',
      findInRippling: 'Find in Rippling', change: 'Change', changeTitle: 'Pick a different Rippling worker',
      link: (n: number) => `Link ${n} selected`, linking: 'Linking...', close: 'Close', done: 'Done',
      resultLinked: (n: number) => `${n} linked`, resultSkipped: (n: number) => `${n} could not be linked`, linkError: 'Could not link the selected employees.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof RipplingBulkLinkModal>;

export const Default: Story = {};
