import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from './Toaster';
import { ToastProvider, useToast } from './ToastContext';

const meta: Meta<typeof Toaster> = {
  title: 'Components/Toaster',
  component: Toaster,
  decorators: [Story => <ToastProvider><Story /></ToastProvider>],
  parameters: {
    docs: {
      description: {
        component:
          '`Toaster` takes no props - there is nothing to show in Controls, and that\'s correct, ' +
          'not missing. It reads from `ToastProvider`\'s context and renders whatever toasts are ' +
          'currently active; you trigger one from anywhere by calling `useToast().toast(message, ' +
          'variant)` (or `emitToast(...)` outside React). The four buttons below ARE the control ' +
          'panel for this story, each firing a real toast of its own variant.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Toaster>;

// Each button's own color previews the variant it fires, rather than four
// identical red buttons that only differ by their label text.
const BUTTON_CLASSES: Record<'success' | 'error' | 'warning' | 'info', string> = {
  success: 'bg-green-500 hover:bg-green-600',
  error: 'bg-(--premium-red) hover:bg-(--premium-red-dark)',
  warning: 'bg-(--premium-orange) hover:opacity-90',
  info: 'bg-(--premium-steel-grey) hover:bg-gray-600',
};

export const Default: Story = {
  render: () => {
    function Demo() {
      const { toast } = useToast();
      return (
        <div className="flex gap-2">
          <button className={`${BUTTON_CLASSES.success} rounded-lg px-3 py-2 text-sm font-semibold text-white transition`} onClick={() => toast('Purchase order approved.', 'success')}>Success</button>
          <button className={`${BUTTON_CLASSES.error} rounded-lg px-3 py-2 text-sm font-semibold text-white transition`} onClick={() => toast('Something needs your attention.', 'error')}>Error</button>
          <button className={`${BUTTON_CLASSES.warning} rounded-lg px-3 py-2 text-sm font-semibold text-white transition`} onClick={() => toast('This timesheet is over budget.', 'warning')}>Warning</button>
          <button className={`${BUTTON_CLASSES.info} rounded-lg px-3 py-2 text-sm font-semibold text-white transition`} onClick={() => toast('Backdated timesheets are disabled.', 'info')}>Info</button>
          <Toaster />
        </div>
      );
    }
    return <Demo />;
  },
};
