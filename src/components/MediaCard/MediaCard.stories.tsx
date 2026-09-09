import type { Meta, StoryObj } from '@storybook/react';
import { MediaCard } from './MediaCard';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
      '<rect width="400" height="400" fill="#1A2C6E"/>' +
      '<text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="28" ' +
      'text-anchor="middle" dominant-baseline="middle">ADULTS</text></svg>',
  );

const meta: Meta<typeof MediaCard> = {
  title: 'Components/MediaCard',
  component: MediaCard,
  parameters: {
    docs: {
      description: {
        component:
          'A square photo, a title, a colored eyebrow line, and a body line - a program/category ' +
          'tile. Pass `onClick` to make the whole tile a real button with a hover lift.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof MediaCard>;

export const Static: Story = {
  render: () => (
    <div style={{ maxWidth: 260 }}>
      <MediaCard imageSrc={PLACEHOLDER} imageAlt="Adult" eyebrow="Ages 14+" title="Adult">
        All levels welcomed. Strength, discipline, and real self-defense, on your own schedule.
      </MediaCard>
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div style={{ maxWidth: 260 }}>
      <MediaCard imageSrc={PLACEHOLDER} imageAlt="Adult" eyebrow="Ages 14+" title="Adult" onClick={() => alert('go to contact')}>
        All levels welcomed. Strength, discipline, and real self-defense, on your own schedule.
      </MediaCard>
    </div>
  ),
};

export const Grid: Story = {
  render: () => {
    const items = [
      { name: 'Beginner', ages: 'Ages 6-13', body: 'New to judo. Falling safely, balance, and the first throws.' },
      { name: 'Intermediate', ages: 'Ages 8-13', body: 'A few years of experience, sharpening technique.' },
      { name: 'Elite', ages: 'Ages 13+', body: 'The competitive program.' },
      { name: 'Adult', ages: 'Ages 14+', body: 'All levels welcomed, on your own schedule.' },
    ];
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ background: '#fff', padding: 24 }}>
        {items.map(p => (
          <MediaCard key={p.name} imageSrc={PLACEHOLDER} imageAlt={p.name} eyebrow={p.ages} title={p.name} onClick={() => {}}>
            {p.body}
          </MediaCard>
        ))}
      </div>
    );
  },
};
