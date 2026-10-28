import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackModal, type FeedbackModalLabels } from './FeedbackModal';

const labels: FeedbackModalLabels = {
  heading: 'Send feedback',
  intro: 'Tell us what works, what does not, or what you would like to see. It goes to the admins, who will see your name and can reply to you unless you send it anonymously.',
  messageLabel: 'Your feedback',
  messagePlaceholder: 'What is on your mind?',
  messageRequired: 'Write your feedback first.',
  imagesLabel: 'Images (optional)',
  addImages: 'Add images',
  removeImage: 'Remove image',
  imageTooLarge: 'An image is over 10 MB.',
  tooManyImages: 'You can attach up to 5 images.',
  unsupportedImage: 'That file is not a supported image.',
  anonymousLabel: 'Send anonymously',
  anonymousNote: 'Your name is not shared and nothing links this feedback to you. The admins will not be able to contact you or reply.',
  sendError: 'Could not send your feedback.',
  cancel: 'Cancel',
  sending: 'Sending…',
  send: 'Send feedback',
  sentToast: 'Thanks, your feedback was sent',
};

const meta: Meta<typeof FeedbackModal> = {
  title: 'Components/FeedbackModal',
  component: FeedbackModal,
  args: { labels, onClose: () => {}, onSend: async () => {} },
};
export default meta;

type Story = StoryObj<typeof FeedbackModal>;

export const Default: Story = {};

export const FailingSend: Story = {
  args: {
    onSend: async () => {
      throw new Error('There is nobody to send feedback to yet');
    },
  },
};
