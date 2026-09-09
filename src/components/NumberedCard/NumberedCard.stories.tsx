import type { Meta, StoryObj } from '@storybook/react';
import { NumberedCard } from './NumberedCard';

const meta: Meta<typeof NumberedCard> = {
  title: 'Components/NumberedCard',
  component: NumberedCard,
  parameters: {
    docs: {
      description: {
        component:
          'A numbered process step, one corner cut at the brand\'s 45deg angle. `color` defaults ' +
          'to Premium red and is selectable for a sister brand.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof NumberedCard>;

export const Steps: Story = {
  render: () => {
    const items = [
      { title: 'Contact and evaluation', body: 'Free consultation and site evaluation. We quote from the plans and visit the building before committing to a number.' },
      { title: 'Proposal and scheduling', body: 'A written quote with a clear scope, then a start date that works around your own schedule.' },
      { title: 'The work, and the walkthrough', body: 'The crew shows up on the day agreed. A final walkthrough before we call it done.' },
    ];
    return (
      <div className="grid md:grid-cols-3 gap-5" style={{ background: '#fff', padding: 24 }}>
        {items.map((p, i) => (
          <NumberedCard key={p.title} number={i + 1} title={p.title}>{p.body}</NumberedCard>
        ))}
      </div>
    );
  },
};

export const CustomColor: Story = {
  render: () => (
    <div style={{ maxWidth: 280, background: '#fff', padding: 24 }}>
      <NumberedCard number={1} title="Try a class" color="#1A2C6E">
        Book a free trial class, no commitment required.
      </NumberedCard>
    </div>
  ),
};
