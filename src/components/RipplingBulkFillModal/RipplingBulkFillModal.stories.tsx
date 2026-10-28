import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider } from '../Toaster';
import { RipplingBulkFillModal } from './RipplingBulkFillModal';
import type { RipplingBulkFillPreview } from '../RipplingBulk/types';

const PREVIEW: RipplingBulkFillPreview = {
  rows: [
    { employee_id: 'e1', employee_name: 'Ana Ruiz', fields: { phone: '506-555-0100', city: 'Moncton' } },
    { employee_id: 'e2', employee_name: 'Bruno Diaz', fields: { phone: '506-555-0199' } },
  ],
  failed: 0, total: 2, truncated: 0,
};

const meta: Meta<typeof RipplingBulkFillModal> = {
  title: 'Components/RipplingBulkFillModal',
  component: RipplingBulkFillModal,
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
  args: {
    loadPreview: async () => PREVIEW,
    onApply: async (ids) => ({ filled: ids.map((id) => ({ employee_id: id, employee_name: id, fields: ['phone'] })), skipped: [] }),
    fieldLabel: (f: string) => f,
    onFilled: () => {},
    onClose: () => {},
    labels: {
      heading: 'Fill missing info from Rippling', body: 'The same as for one employee, for everyone linked at once.', loading: 'Checking Rippling...',
      loadError: 'Could not load', retry: 'Try again', failedNote: (n: number) => `${n} could not be read from Rippling`,
      truncatedNote: (shown: number, total: number) => `Showing ${shown} of ${total}`, nothingMissing: 'Nothing to fill.',
      selectAll: (n: number) => `Select all (${n})`, fieldsCount: (n: number) => `${n} field${n === 1 ? '' : 's'}`,
      fill: (n: number) => `Fill ${n} selected`, filling: 'Filling...', close: 'Close', done: 'Done',
      resultFilled: (n: number) => `${n} filled`, resultSkipped: (n: number) => `${n} skipped`, skipCodes: {}, fillError: 'Could not fill.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof RipplingBulkFillModal>;

export const Default: Story = {};
