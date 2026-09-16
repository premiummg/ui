import type { Meta, StoryObj } from '@storybook/react';
import { NewsTicker } from './NewsTicker';

const meta: Meta<typeof NewsTicker> = {
  title: 'Components/NewsTicker',
  component: NewsTicker,
  args: {
    items: [
      { id: 1, title: 'New parking policy effective September 1', important: false },
      { id: 2, title: 'Q3 all-hands moved to the Dieppe head office', important: true },
      { id: 3, title: 'Benefits enrollment closes Friday', important: false },
      { id: 4, title: 'Site safety audit results published', important: false },
    ],
  },
  parameters: {
    docs: {
      description: {
        component: 'Hover the strip to pause the scroll and read (or click) a headline.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof NewsTicker>;

export const Default: Story = {};

export const CustomLabel: Story = {
  args: { label: 'Announcements' },
};

export const WithLinks: Story = {
  args: {
    items: [
      { id: 1, title: 'New parking policy effective September 1', href: '#' },
      { id: 2, title: 'Q3 all-hands moved to the Dieppe head office', important: true, href: '#' },
      { id: 3, title: 'Benefits enrollment closes Friday' },
    ],
  },
};
