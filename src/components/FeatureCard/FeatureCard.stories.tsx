import type { Meta, StoryObj } from '@storybook/react';
import { FiMapPin, FiAward, FiCheckCircle, FiTag } from 'react-icons/fi';
import { FeatureCard } from './FeatureCard';

const meta: Meta<typeof FeatureCard> = {
  title: 'Components/FeatureCard',
  component: FeatureCard,
  parameters: {
    docs: {
      description: {
        component:
          'A "why us" tile - icon, title, one line of body copy. Pass any react-icons element; ' +
          'its own size and color come along unchanged.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <FeatureCard icon={<FiMapPin size={22} style={{ color: 'var(--premium-red)' }} />} title="Local expertise">
        Based nearby, active across the whole region. Your job is a drive, not a mobilization.
      </FeatureCard>
    </div>
  ),
};

// OtoshiProposalPage's "Community" tile layout - icon centered above
// centered title/body, instead of the default left-aligned stack.
export const Centered: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <FeatureCard icon={<FiMapPin size={22} style={{ color: 'var(--premium-red)' }} />} title="Local expertise" align="center">
        Based nearby, active across the whole region. Your job is a drive, not a mobilization.
      </FeatureCard>
    </div>
  ),
};

export const Grid: Story = {
  render: () => {
    const items = [
      { icon: FiMapPin, title: 'Local expertise', body: 'Based nearby, active across the whole region. Your job is a drive, not a mobilization.' },
      { icon: FiAward, title: 'Licensed and insured', body: 'Fully licensed, bonded, and insured on every job we take on.' },
      { icon: FiCheckCircle, title: 'Free estimates', body: 'A free site visit and evaluation before we commit to a number.' },
      { icon: FiTag, title: 'Transparent pricing', body: 'Quoted from the plans, in writing, before any work begins.' },
    ];
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ background: '#F2F2F2', padding: 24 }}>
        {items.map(({ icon: Icon, title, body }) => (
          <FeatureCard key={title} icon={<Icon size={22} style={{ color: 'var(--premium-red)' }} />} title={title}>
            {body}
          </FeatureCard>
        ))}
      </div>
    );
  },
};
