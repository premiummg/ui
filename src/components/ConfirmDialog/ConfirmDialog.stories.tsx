import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FiTrash2, FiAlertTriangle, FiSave } from 'react-icons/fi';
import { Button } from '../Button';
import { ConfirmDialog } from './ConfirmDialog';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
};
export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

export const Danger: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="danger" onClick={() => setOpen(true)}>Delete employee</Button>
          <ConfirmDialog
            open={open}
            onClose={() => setOpen(false)}
            tone="danger"
            icon={FiTrash2}
            title="Delete this employee?"
            message="This removes their access immediately. Their timesheet history is kept."
            confirmLabel="Delete"
          />
        </>
      );
    }
    return <Demo />;
  },
};

export const NoIcon: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>Sign out</Button>
          <ConfirmDialog
            open={open}
            onClose={() => setOpen(false)}
            title="Sign out?"
            message="You'll need to sign in again to continue."
            confirmLabel="Sign out"
          />
        </>
      );
    }
    return <Demo />;
  },
};

export const Caution: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>Deactivate account</Button>
          <ConfirmDialog
            open={open}
            onClose={() => setOpen(false)}
            tone="caution"
            icon={FiAlertTriangle}
            title="Deactivate this account?"
            message="They can be reactivated later from the same page."
            confirmLabel="Deactivate"
          />
        </>
      );
    }
    return <Demo />;
  },
};

export const CustomActions: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>Close without saving</Button>
          <ConfirmDialog
            open={open}
            onClose={() => setOpen(false)}
            tone="caution"
            icon={FiSave}
            title="Unsaved changes"
            message="You have changes that haven't been saved yet."
            actions={[
              { label: 'Save draft', variant: 'primary', onClick: () => setOpen(false) },
              { label: 'Discard', variant: 'danger', onClick: () => setOpen(false) },
              { label: 'Cancel', variant: 'secondary', onClick: () => setOpen(false) },
            ]}
          />
        </>
      );
    }
    return <Demo />;
  },
};
