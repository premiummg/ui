import type { Meta, StoryObj } from '@storybook/react';
import { AttachmentTile } from './AttachmentTile';

const meta: Meta<typeof AttachmentTile> = {
  title: 'Components/AttachmentTile',
  component: AttachmentTile,
  args: { onDownload: () => {} },
};
export default meta;

type Story = StoryObj<typeof AttachmentTile>;

export const Pdf: Story = {
  args: { name: 'Q3-report.pdf', size: '1.2 MB', type: 'pdf' },
  render: args => <div className="max-w-sm"><AttachmentTile {...args} /></div>,
};

export const ImagePlaceholder: Story = {
  args: { name: 'site-photo.jpg', size: '840 KB', type: 'image' },
  render: args => <div className="max-w-sm"><AttachmentTile {...args} /></div>,
};

export const OtherType: Story = {
  args: { name: 'notes.txt', size: '2 KB', type: 'other' },
  render: args => <div className="max-w-sm"><AttachmentTile {...args} /></div>,
};
