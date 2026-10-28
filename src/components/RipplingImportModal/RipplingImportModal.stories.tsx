import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider } from '../Toaster';
import { RipplingImportModal } from './RipplingImportModal';

const meta: Meta<typeof RipplingImportModal> = {
  title: 'Components/RipplingImportModal',
  component: RipplingImportModal,
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
  args: {
    loadCandidates: async () => ({
      candidates: [
        { worker_id: 'w1', name: 'Ana Ruiz', email: 'ana@gmail.com', title: 'Taper', status: 'ACTIVE', start_date: '2026-01-05' },
        { worker_id: 'w2', name: 'Bruno Diaz', email: 'bruno@gmail.com', title: null, status: 'HIRED', start_date: null },
      ],
      total_eligible: 2, truncated: 0, skipped_no_email: 0, skipped_known_email: 0, skipped_identity_account: 0, skipped_terminated: 0, skipped_likely_match: 0,
    }),
    onApply: async () => [],
    roles: ['admin', 'manager', 'worker'],
    roleLabel: (r: string) => r,
    divisions: [{ id: 'd1', name: 'Caulking' }],
    managerOptionalRoles: ['admin'],
    renderManagerField: () => <input className="input-field w-full" placeholder="Pick a manager" />,
    formatDate: (iso: string) => iso,
    onImported: () => {},
    onClose: () => {},
    labels: {
      heading: 'Import from Rippling', body: 'Rippling workers who have no account yet.', loading: 'Loading...', loadError: 'Could not load', retry: 'Try again',
      skippedNote: () => '', truncatedNote: (a: number, b: number) => `Showing ${a} of ${b}`, nothingToImport: 'Nothing to import.',
      role: 'Role', division: 'Division', chooseDivision: 'Choose a division', manager: 'Manager', selectAll: (n: number) => `Select all (${n})`,
      colWorker: 'Rippling worker', colRole: 'Role in Rippling', colStart: 'Start', statusLabels: { HIRED: 'Hired, not started' }, inactiveHint: 'Not active',
      create: (n: number) => `Create ${n} account${n === 1 ? '' : 's'}`, creating: 'Creating...', close: 'Close', done: 'Done',
      resultCreated: (n: number) => `${n} created`, resultFailed: (n: number) => `${n} not created`, notEligible: 'Not eligible any more',
      createError: 'Could not create the accounts.', tempPasswordsHeading: 'Temporary passwords, shown once', copyPasswords: 'Copy all', copiedPasswords: 'Copied',
    },
  },
};
export default meta;

type Story = StoryObj<typeof RipplingImportModal>;

export const Default: Story = {};
