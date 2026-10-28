import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider } from '../Toaster';
import { RipplingLinkModal } from './RipplingLinkModal';

const meta: Meta<typeof RipplingLinkModal> = {
  title: 'Components/RipplingLinkModal',
  component: RipplingLinkModal,
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
  args: {
    employeeName: 'Ana',
    loadCandidates: async () => [
      { worker_id: 'w1', name: 'Ana Ruiz', email: 'ana@premiummg.ca', title: 'Taper', status: 'ACTIVE' },
      { worker_id: 'w2', name: 'Anabel Cruz', email: 'anabel@premiummg.ca' },
    ],
    onLink: async () => {},
    onClose: () => {},
    labels: {
      heading: 'Find in Rippling',
      body: (n: string) => `Search Rippling's worker list to link ${n} to the right account.`,
      searchPlaceholder: 'Search name or email...',
      loading: 'Loading...',
      loadError: 'Could not load Rippling workers',
      retry: 'Try again',
      noMatches: 'No Rippling workers match this search.',
      moreResults: (n: number) => `+${n} more, narrow your search to see them`,
      link: 'Link',
      linking: 'Linking...',
      close: 'Close',
      linkedToast: (n: string) => `Linked to ${n} in Rippling.`,
      linkError: 'Could not link this employee to Rippling.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof RipplingLinkModal>;

export const Default: Story = {};
export const LoadFails: Story = { args: { loadCandidates: async () => { throw new Error('down'); } } };
