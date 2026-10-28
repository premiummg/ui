import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AttachmentImages, ImageAttachmentPicker } from './ImageAttachments';

const strings = {
  addLabel: 'Add images',
  removeLabel: 'Remove image',
  tooLargeLabel: 'An image is over 10 MB.',
  tooManyLabel: 'You can attach up to 5 images.',
  unsupportedLabel: 'That file is not a supported image.',
};

const meta: Meta<typeof ImageAttachmentPicker> = {
  title: 'Components/ImageAttachments',
  component: ImageAttachmentPicker,
};
export default meta;

type Story = StoryObj<typeof ImageAttachmentPicker>;

function Picker({ compact }: { compact?: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  return <ImageAttachmentPicker files={files} onChange={setFiles} strings={strings} compact={compact} />;
}

export const Form: Story = { render: () => <Picker /> };

export const CompactForAComposer: Story = { render: () => <Picker compact /> };

// A tiny inline image stands in for the signed URL an app would resolve.
const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="160" height="100" fill="%23c2272d"/></svg>';

export const ShownWithAMessage: Story = {
  render: () => (
    <AttachmentImages attachments={[{ id: 'a1', name: 'site.png', mimeType: 'image/png' }]} getUrl={async () => placeholder} />
  ),
};
