import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider } from '../Toaster';
import { RipplingFillModal } from './RipplingFillModal';

const meta: Meta<typeof RipplingFillModal> = {
  title: 'Components/RipplingFillModal',
  component: RipplingFillModal,
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
  args: {
    loadFields: async () => ({ phone: '506-555-0100', birthday: '1990-01-02' }),
    onFill: async () => {},
    onClose: () => {},
    fieldLabel: (f: string) => f,
    labels: {
      heading: 'Fill missing info from Rippling',
      body: "Compares this record against Rippling's and shows only the fields it's missing.",
      loading: 'Checking Rippling...',
      loadError: "Couldn't load this employee's Rippling data",
      retry: 'Try again',
      nothingMissing: 'Nothing to fill.',
      fill: 'Fill',
      filling: 'Filling...',
      close: 'Close',
      filledToast: (n: number) => `Filled ${n} field${n === 1 ? '' : 's'} from Rippling.`,
      fillError: "Couldn't fill these fields. Try again.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof RipplingFillModal>;

export const Default: Story = {};
export const NothingMissing: Story = { args: { loadFields: async () => ({}) } };
