import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): never {
  throw new Error('Storybook demo error');
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
};
export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

export const DefaultFallback: Story = {
  args: { children: <Bomb /> },
};

export const CustomFallback: Story = {
  args: { children: <Bomb />, fallback: <p className="p-8">Custom fallback content.</p> },
};

// A sister brand's own palette on the same shell - color/barsColor take any
// CSS color, independent of each other and of light/dark mode.
export const CustomPalette: Story = {
  args: { children: <Bomb />, color: '#1A2C6E', barsColor: '#FFFFFF' },
};
