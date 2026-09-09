import type { Meta, StoryObj } from '@storybook/react';
import { FiArrowRight } from 'react-icons/fi';
import { ColorField } from './ColorField';
import { Eyebrow } from '../Eyebrow';
import { SiteButton } from '../SiteButton';

const meta: Meta<typeof ColorField> = {
  title: 'Components/ColorField',
  component: ColorField,
  parameters: {
    docs: {
      description: {
        component:
          'The color is the only thing that changes between brands - the device itself (solid ' +
          'field + diagonal bars) stays the same. See `Red` (Premium\'s own default) and `Blue` ' +
          '(a sister brand\'s color, same component) below.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ColorField>;

function CtaContent() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <Eyebrow tone="white" text="Prochaine étape" />
      <h2 className="font-heading font-black text-3xl md:text-4xl text-white leading-[1.1] mt-3">
        Envoyez-nous les plans. Recevez un montant.
      </h2>
      <p className="text-white/75 mt-4">
        Consultation et évaluation du site gratuites au Canada atlantique / dans les Maritimes, y compris le Labrador et Ottawa.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-9">
        <SiteButton variant="onRed">
          Obtenez votre estimation <FiArrowRight size={16} />
        </SiteButton>
        <p className="text-sm text-white/70">
          ou appelez le <span className="font-heading font-bold text-white">+1 866 531 5402</span>
        </p>
      </div>
    </div>
  );
}

// Premium's own color - the default when `color` is omitted.
export const Red: Story = {
  render: () => (
    <ColorField>
      <CtaContent />
    </ColorField>
  ),
};

// The same component, a sister brand's color (Otoshi's navy) - nothing else
// changes.
export const Blue: Story = {
  render: () => (
    <ColorField color="#1A2C6E">
      <CtaContent />
    </ColorField>
  ),
};
