import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    docs: {
      description: {
        component:
          'Optional `title` + `description` cover the shape every real confirm/edit modal already ' +
          'hand-rolls (an <h3>, sometimes a <p> under it). `children` still renders under them for ' +
          'the actual body - a form, a confirm/cancel row.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

// The most common real shape: title + description + a confirm/cancel row.
export const ConfirmDelete: Story = {
  args: {
    onClose: () => {},
    title: 'Delete this employee?',
    description: 'This cannot be undone.',
  },
  render: (args) => (
    <Modal {...args}>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: 'var(--premium-red)' }}>
          Delete
        </button>
        <button className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/20 text-sm font-medium text-gray-600 dark:text-gray-300">
          Cancel
        </button>
      </div>
    </Modal>
  ),
};

// Title with no description - the looser mb-4 spacing, straight into the body.
export const TitleOnly: Story = {
  args: { onClose: () => {}, title: 'Manage Companies' },
  render: (args) => (
    <Modal {...args}>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add, rename, or remove companies here.</p>
    </Modal>
  ),
};

// Fully custom header - no title/description at all, built by hand in
// children instead, for a modal whose header doesn't fit that shape.
export const CustomChildren: Story = {
  args: { onClose: () => {} },
  render: (args) => (
    <Modal {...args}>
      <h2 className="font-heading font-bold text-lg mb-2">Custom header</h2>
      <p className="text-sm text-gray-500">Built entirely in children, title/description both omitted.</p>
    </Modal>
  ),
};

export const WideMaxWidth: Story = { args: { ...ConfirmDelete.args, maxWidth: 'max-w-lg' }, render: ConfirmDelete.render };
