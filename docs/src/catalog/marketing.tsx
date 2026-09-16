import type { ComponentDoc } from '../components/doc/ComponentBlock';
import { FramedPreview } from '../components/doc/Section';
import { demosFromModule } from '../lib/renderStory';

import * as HeroStories from '../../../src/components/Hero/Hero.stories';
import * as SiteButtonStories from '../../../src/components/SiteButton/SiteButton.stories';
import * as SiteFooterStories from '../../../src/components/SiteFooter/SiteFooter.stories';
import * as FeatureCardStories from '../../../src/components/FeatureCard/FeatureCard.stories';
import * as NumberedCardStories from '../../../src/components/NumberedCard/NumberedCard.stories';
import * as QuoteCardStories from '../../../src/components/QuoteCard/QuoteCard.stories';
import * as StatBlockStories from '../../../src/components/StatBlock/StatBlock.stories';
import * as MediaCardStories from '../../../src/components/MediaCard/MediaCard.stories';
import * as EyebrowStories from '../../../src/components/Eyebrow/Eyebrow.stories';
import * as SectionHeadStories from '../../../src/components/SectionHead/SectionHead.stories';
import * as PortraitFigureStories from '../../../src/components/PortraitFigure/PortraitFigure.stories';
import * as RevealStories from '../../../src/components/Reveal/Reveal.stories';

const frame = (demos: { label: string; node: React.ReactNode }[], height?: number) =>
  demos.map(d => ({ ...d, node: <FramedPreview height={height}>{d.node}</FramedPreview> }));

export const marketing: ComponentDoc[] = [
  {
    name: 'Hero',
    summary: 'A full-bleed landing-page hero: eyebrow + headline + subhead, up to two SiteButton actions, an optional caption line.',
    notes: 'imageSrc and videoSrc are both optional and independent - image alone, video alone, both (the image becomes the video’s poster, and what a prefers-reduced-motion visitor gets instead of ever downloading the video), or neither. overlay: "scrim" (plain black + the industrial texture hatch) or "acadian" (the flag’s own gradient + gold star). wedge (off by default) is Premium’s own 45deg brand device - opt in only for a genuinely Premium-branded page, not a sister brand or client site.',
    demos: frame(demosFromModule(HeroStories), 340),
    wide: true,
  },
  {
    name: 'SiteButton',
    summary: 'A landing-page button - distinct from Button, which is scoped to app chrome (a dashboard, a form, a table, always on a plain white/dark surface).',
    notes: 'variant: primary / ghost / onRed / onDark, the last two inverting so a button never disappears against its own colored section (Button has no equivalent, since app chrome never needs it). Always one size (Button’s own lg), since a marketing page’s CTAs don’t need Button’s xs-xl range.',
    demos: demosFromModule(SiteButtonStories),
  },
  {
    name: 'SiteFooter',
    summary: 'The dark marketing-site footer shell: a responsive column grid on Premium Black, a copyright bar below a hairline.',
    notes: 'Ships the real grid/bar structure since that part is genuinely the same across most marketing sites - only the column content (services listed, contact details, a newsletter form’s own state) is composed in via children/FooterColumn.',
    demos: frame(demosFromModule(SiteFooterStories), 340),
    wide: true,
  },
  {
    name: 'FeatureCard',
    summary: 'An icon (centered in its own slot) + bold title + one line of body copy - the "why us" tile from a landing page’s features grid.',
    notes: 'align: "left" (default, stacked) / "center" (icon and text all centered).',
    demos: demosFromModule(FeatureCardStories),
  },
  {
    name: 'NumberedCard',
    summary: 'A numbered process step ("01 Contact and evaluation"), one corner cut at the brand’s 45deg angle.',
    notes: 'color defaults to Premium red and is selectable for a sister brand - its dark-mode figure color is derived from whatever color is given via color-mix(), so a custom color still gets a readable dark counterpart.',
    demos: demosFromModule(NumberedCardStories),
  },
  {
    name: 'QuoteCard',
    summary: 'A customer quote with the brand’s own .pmg-bracket corner mark instead of a generic quotation glyph.',
    notes: 'Render several side by side, not in a carousel - nothing should slide sideways while it’s being read.',
    demos: demosFromModule(QuoteCardStories),
  },
  {
    name: 'StatBlock',
    summary: 'One big centered figure with a short label underneath (e.g. "56% / Openness to new ideas") - a headline number a marketing page leads with.',
    notes: 'Not the dashboard StatCard - a different, unrelated component that happens to share the word "stat". color defaults to Premium’s secondary red.',
    demos: demosFromModule(StatBlockStories),
  },
  {
    name: 'MediaCard',
    summary: 'A square photo over a title, a colored eyebrow line, and a body line - a program/category tile.',
    notes: 'Renders as a real <button> with a hover lift when onClick is given, a plain non-interactive card otherwise.',
    demos: demosFromModule(MediaCardStories),
  },
  {
    name: 'Eyebrow',
    summary: 'The small uppercase micro-caps label above a marketing section title. text, not children.',
    notes: 'tone: red (default) / white (on a dark/solid field) / amber. White is deliberately text-white/60, not full white - alone it can read as faded, but it always sits above a bold white headline in real use (see the White demo below), which is what the dimmer eyebrow is actually for.',
    demos: demosFromModule(EyebrowStories),
  },
  {
    name: 'SectionHead',
    summary: 'A marketing-page section heading: Eyebrow + headline + optional subhead.',
    notes: 'tone="dark" for sitting on a solid dark/color field, center for a centered layout.',
    demos: demosFromModule(SectionHeadStories),
  },
  {
    name: 'PortraitFigure',
    summary: 'A team-member/founder photo with a name+role tag cut into its corner at the brand’s own 45deg angle.',
    notes: 'color defaults to Premium’s secondary red, same as ColorField - any CSS color works for a sister brand.',
    demos: demosFromModule(PortraitFigureStories),
  },
  {
    name: 'Reveal',
    summary: 'Fades a section in, once, the first time it scrolls into view - the standard landing-page "reveal on scroll" treatment.',
    notes: 'motion-safe: respects prefers-reduced-motion; a deadman-switch timeout reveals the content anyway if IntersectionObserver never fires, so a landing page’s copy is never silently invisible. This panel already has it in view, so both demos below render already-settled - scroll one out of view and back into a real page to see the transition itself.',
    demos: demosFromModule(RevealStories),
  },
];
