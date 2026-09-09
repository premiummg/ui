import type { Meta, StoryObj } from '@storybook/react';
import { PortraitFigure } from './PortraitFigure';

const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="625"><rect width="100%" height="100%" fill="#3A3A3A"/></svg>',
);

const meta: Meta<typeof PortraitFigure> = {
  title: 'Components/PortraitFigure',
  component: PortraitFigure,
  args: { imageSrc: PLACEHOLDER, name: 'Denis Collin', role: 'Founder' },
  decorators: [Story => <div className="max-w-xs"><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof PortraitFigure>;

export const Red: Story = {};
export const CustomColor: Story = { args: { color: '#1A2C6E' } };
