import type { Meta, StoryObj } from '@storybook/react';
import { CredentialBadges } from './CredentialBadges';

const mark = (text: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#fff"/>` +
      `<text x="50%" y="50%" fill="#A51E26" font-family="sans-serif" font-weight="700" font-size="26" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`,
  );

const ITEMS = [
  { src: mark('UL'), name: 'UL Certified', href: 'https://www.ul.com/' },
  { src: mark('FCIA'), name: 'FCIA', href: 'https://www.fcia.org/' },
  { src: mark('COR'), name: 'COR', href: 'https://nbcsa.ca/programs/cor/' },
  { src: mark('NFCA'), name: 'NFCA', href: 'https://nfca.memberclicks.net/' },
];

const meta: Meta<typeof CredentialBadges> = {
  title: 'Components/CredentialBadges',
  component: CredentialBadges,
  args: { items: ITEMS },
  parameters: {
    docs: {
      description: {
        component:
          'Certification marks on fixed white plates, never recoloured, each named in its alt text and ' +
          'linked to the issuing body. Use `bordered` on a white or light-grey surface.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof CredentialBadges>;

export const OnDark: Story = {
  args: { size: 'lg' },
  decorators: [Story => <div className="p-6 bg-(--premium-black)"><Story /></div>],
};
export const OnLight: Story = { args: { bordered: true } };
