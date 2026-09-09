import type { ComponentDoc } from '../components/doc/ComponentBlock';
import { FramedPreview } from '../components/doc/Section';
import { demosFromModule } from '../lib/renderStory';

import * as AuthShellStories from '../../../src/components/AuthShell/AuthShell.stories';
import * as PremiumLogoStories from '../../../src/components/PremiumLogo/PremiumLogo.stories';

const frame = (demos: { label: string; node: React.ReactNode }[], height?: number, center?: boolean) =>
  demos.map(d => ({ ...d, node: <FramedPreview height={height} center={center}>{d.node}</FramedPreview> }));

export const authShell: ComponentDoc[] = [
  {
    name: 'AuthShell',
    summary: 'The shared page shell for a sign-in flow (sign in, two-factor, set new password, ...): centered card, brand band, dark-mode toggle, footer line.',
    notes: 'Built on PremiumLogo and useDarkMode from this same package. AuthError is the red inline error banner for inside it.',
    demos: frame(demosFromModule(AuthShellStories), 480, true),
    propsKey: 'AuthShell',
    wide: true,
  },
  {
    name: 'PremiumLogo',
    summary: 'The Premium wordmark itself, bundled as inline assets - no files to copy into a consuming app’s public/.',
    notes: 'size: sm/md/lg/xl. variant: stacked/horizontal. mode="auto" (default) watches html.dark and swaps artwork with the theme; mode="light"/"dark" pins it instead, for a surface whose own color is fixed regardless of theme (a solid-red band, a footer that’s always Premium Black).',
    demos: demosFromModule(PremiumLogoStories),
  },
];
