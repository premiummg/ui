import type { Meta, StoryObj } from '@storybook/react';
import { QuoteCard } from './QuoteCard';

const meta: Meta<typeof QuoteCard> = {
  title: 'Components/QuoteCard',
  component: QuoteCard,
  parameters: {
    docs: {
      description: {
        component: 'A customer quote with the brand\'s corner bracket instead of a generic quotation mark.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof QuoteCard>;

export const Single: Story = {
  render: () => (
    <div style={{ maxWidth: 340 }}>
      <QuoteCard quote="Called them for a quote and they showed up without hesitation." name="Kris J." />
    </div>
  ),
};

export const Grid: Story = {
  render: () => {
    const items = [
      { quote: 'Called them for a quote and they showed up without hesitation.', name: 'Kris J.' },
      { quote: 'Quality workmanship and a smooth process from start to finish.', name: 'Jaclyn M.' },
      { quote: 'As a bystander during the replumbing of our building, I was impressed.', name: 'John H.' },
      { quote: 'Had caulking done to my house. It gives me peace of mind.', name: 'Brittany G.' },
    ];
    return (
      <div className="grid sm:grid-cols-2 gap-5" style={{ background: '#F2F2F2', padding: 24 }}>
        {items.map(r => (
          <QuoteCard key={r.name} quote={r.quote} name={r.name} />
        ))}
      </div>
    );
  },
};
