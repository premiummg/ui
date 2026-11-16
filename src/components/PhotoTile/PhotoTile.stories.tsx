import type { Meta, StoryObj } from '@storybook/react';
import { PhotoTile } from './PhotoTile';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">' +
      '<rect width="640" height="400" fill="#3A3A3A"/>' +
      '<text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="28" ' +
      'text-anchor="middle" dominant-baseline="middle">SITE PHOTO</text></svg>',
  );

const meta: Meta<typeof PhotoTile> = {
  title: 'Components/PhotoTile',
  component: PhotoTile,
  parameters: {
    docs: {
      description: {
        component:
          'A project photo that fills its grid cell, caption on a rising black gradient. ' +
          '`size="feature"` spans 2x2 from `md` up; the grid decides the row height.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof PhotoTile>;

export const Mosaic: Story = {
  render: () => (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))] auto-rows-[240px] bg-(--premium-black) p-6">
      <PhotoTile imageSrc={PLACEHOLDER} imageAlt="Facade" eyebrow="Commercial Caulking" title="[ Project name, Location ]" size="feature" />
      <PhotoTile imageSrc={PLACEHOLDER} imageAlt="Fireproofing" eyebrow="Fireproofing" title="[ Project name, Location ]" />
      <PhotoTile imageSrc={PLACEHOLDER} imageAlt="Firestop" eyebrow="Firestopping" title="[ Project name, Location ]" />
      <PhotoTile imageSrc={PLACEHOLDER} imageAlt="Lift" eyebrow="Industrial Caulking" title="[ Project name, Location ]" />
      <PhotoTile imageSrc={PLACEHOLDER} imageAlt="Spray" eyebrow="Fireproofing" title="[ Project name, Location ]" />
    </div>
  ),
};
