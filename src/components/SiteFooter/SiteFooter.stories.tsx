import type { Meta, StoryObj } from '@storybook/react';
import { FiPhone, FiMail } from 'react-icons/fi';
import { SiteFooter, FooterColumn } from './SiteFooter';

const meta: Meta<typeof SiteFooter> = {
  title: 'Components/SiteFooter',
  component: SiteFooter,
  parameters: {
    docs: {
      description: {
        component:
          'The shell only - a real footer\'s content (which services are listed, the contact ' +
          'details, a newsletter form\'s own state) is composed in via `children`/`FooterColumn`, ' +
          'the same way a real `Navbar`\'s nav items are.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof SiteFooter>;

export const FourColumns: Story = {
  render: () => (
    <SiteFooter
      copyright={`© ${new Date().getFullYear()} Premium MG. All rights reserved.`}
      legalLinks={
        <>
          <button className="hover:text-white/80 transition">Terms</button>
          <button className="hover:text-white/80 transition">Privacy</button>
        </>
      }
    >
      <FooterColumn>
        <p className="font-heading font-black text-white text-lg mb-5">PREMIUM</p>
        <p className="text-sm leading-relaxed">123 Main St, Moncton, NB</p>
        <p className="pmg-eyebrow text-white/40 mt-6 mb-2">Service area</p>
        <p className="text-sm leading-relaxed">Atlantic Canada / the Maritimes</p>
      </FooterColumn>

      <FooterColumn label="Services">
        <ul className="space-y-2.5 text-sm">
          <li><button className="hover:text-white transition">Framing</button></li>
          <li><button className="hover:text-white transition">Drywall</button></li>
          <li><button className="hover:text-white transition">Painting</button></li>
        </ul>
      </FooterColumn>

      <FooterColumn label="Contact">
        <ul className="space-y-2.5 text-sm">
          <li><a href="tel:+18665315402" className="inline-flex items-center gap-2 hover:text-white transition"><FiPhone size={14} /> +1 866 531 5402</a></li>
          <li><a href="mailto:info@premiummg.ca" className="inline-flex items-center gap-2 hover:text-white transition"><FiMail size={14} /> info@premiummg.ca</a></li>
        </ul>
      </FooterColumn>

      <FooterColumn label="Newsletter">
        <p className="text-sm leading-relaxed mb-4">Get project tips and company news.</p>
        <div className="flex gap-2">
          <input placeholder="Email address" className="min-w-0 flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/40 transition" />
          <button className="shrink-0 px-3.5 py-2 rounded-lg bg-(--premium-red) hover:bg-(--premium-red-dark) text-white text-sm font-heading font-bold transition">Sign up</button>
        </div>
      </FooterColumn>
    </SiteFooter>
  ),
};
