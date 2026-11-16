import type { Meta, StoryObj } from '@storybook/react';
import { PostCard } from './PostCard';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">' +
      '<rect width="640" height="400" fill="#3A3A3A"/>' +
      '<text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="28" ' +
      'text-anchor="middle" dominant-baseline="middle">SITE PHOTO</text></svg>',
  );

const meta: Meta<typeof PostCard> = {
  title: 'Components/PostCard',
  component: PostCard,
  parameters: {
    docs: {
      description: {
        component:
          'A blog post in a listing. Only the title is the link (stretched over the card). ' +
          'Date and reading time come already worded in the reader\'s language.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof PostCard>;

export const Row: Story = {
  render: () => (
    <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] bg-[#F2F2F2] p-6">
      <PostCard imageSrc={PLACEHOLDER} imageAlt="Fireproofing" category="Project updates" title="Fireproofing structural steel ahead of close-in" excerpt="What a spray-applied fireproofing shift looks like." date="2026-11-10" dateLabel="November 10, 2026" readTime="5 min read" href="#" />
      <PostCard imageSrc={PLACEHOLDER} imageAlt="Lift" category="Site safety" title="Working at height" excerpt="The pre-use routine behind every day of envelope work." date="2026-10-27" dateLabel="October 27, 2026" readTime="4 min read" href="#" />
      <PostCard category="Drywall" title="Sequencing drywall around the trades already on site" excerpt="No photo yet: the placeholder keeps the row even." date="2026-09-01" dateLabel="September 1, 2026" readTime="4 min read" href="#" />
    </div>
  ),
};
