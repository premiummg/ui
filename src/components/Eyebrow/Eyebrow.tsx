import { ReactNode } from 'react';

export type EyebrowTone = 'red' | 'white' | 'amber';

export interface EyebrowProps {
  // Always one short line of micro-caps label text, never a composition
  // slot - `text` shows up as a plain text field in Storybook's Controls
  // panel, where `children` would show up as an opaque JSX prop.
  text: ReactNode;
  tone?: EyebrowTone;
}

// The small uppercase micro-caps label above a section title. `white` is for
// sitting on a dark/solid-color field, `amber` for a callout, `red` (the
// default) for a plain light/dark surface.
export function Eyebrow({ text, tone = 'red' }: EyebrowProps) {
  const c = tone === 'white' ? 'text-white/60' : tone === 'amber' ? 'text-[#FAAD00]' : 'text-(--premium-red)';
  return <p className={`pmg-eyebrow ${c}`}>{text}</p>;
}
