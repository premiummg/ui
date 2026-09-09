import type { Meta, StoryObj } from '@storybook/react';
import { FiMapPin } from 'react-icons/fi';
import { Hero } from './Hero';
import heroVideo from './demo/hero-demo.mp4';
import heroPoster from './demo/hero-demo-poster.jpg';

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    docs: {
      description: {
        component:
          'Not wrapped in `Reveal` anywhere it\'s used - it\'s the largest contentful paint on ' +
          'the page. `imageSrc` and `videoSrc` are both optional and independent: `WithVideo` (a ' +
          'real clip, plus the poster image), `PosterOnly` (no `videoSrc` - just the still image, ' +
          'the same path a reduced-motion visitor always gets even when a video IS provided), and ' +
          '`TextOnly` (neither given - a plain dark field behind the copy). `AcadianOverlay` swaps ' +
          'the default black scrim for the flag-colored one with its star blended in - see ' +
          '`/design/otoshi`, where this came from.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Hero>;

const SHARED_ARGS = {
  eyebrow: 'Built with heart',
  title: 'Commercial construction, done right.',
  sub: 'From framing to finish, one crew you can call back next year.',
  primaryAction: { label: 'Get an estimate', onClick: () => {} },
  secondaryAction: { label: 'See our work', onClick: () => {} },
  caption: (
    <>
      <FiMapPin size={13} /> Serving Southern Ontario
    </>
  ),
};

export const WithVideo: Story = {
  args: { ...SHARED_ARGS, imageSrc: heroPoster, videoSrc: heroVideo },
};

export const PosterOnly: Story = {
  args: { ...SHARED_ARGS, imageSrc: heroPoster },
};

export const WithBrandWedge: Story = {
  args: { ...SHARED_ARGS, imageSrc: heroPoster, videoSrc: heroVideo, wedge: true },
};

export const TextOnly: Story = {
  args: { ...SHARED_ARGS },
};

export const AcadianOverlay: Story = {
  args: { ...SHARED_ARGS, imageSrc: heroPoster, videoSrc: heroVideo, overlay: 'acadian' },
};
