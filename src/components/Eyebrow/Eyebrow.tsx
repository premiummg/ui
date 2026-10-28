import { ReactNode } from 'react';

// red / white / amber are the colored callouts; muted / subtle / onColor are
// the neutral ones an app reaches for most (a table's column header, a small
// label over a field, a label sitting on a red hero band).
export type EyebrowTone = 'red' | 'white' | 'amber' | 'muted' | 'subtle' | 'onColor';

export interface EyebrowProps {
  // Always one short line of micro-caps label text, never a composition
  // slot - `text` shows up as a plain text field in Storybook's Controls
  // panel, where `children` would show up as an opaque JSX prop.
  text: ReactNode;
  tone?: EyebrowTone;
  // The element it renders as - a <p> by default; `th` for a table's column
  // header, `span` inline in a row, `div` for a calendar's weekday cell.
  as?: 'p' | 'span' | 'div' | 'th';
  // Layout around it only (margin, padding, alignment, a size override like
  // `text-[9px]`) - the tone owns the color.
  className?: string;
}

const TONES: Record<EyebrowTone, string> = {
  red: 'text-(--premium-red)',
  white: 'text-white/60',
  amber: 'text-[#FAAD00]',
  muted: 'text-gray-400 dark:text-gray-500',
  subtle: 'text-gray-500 dark:text-gray-400',
  onColor: 'text-white/70',
};

// The small uppercase micro-caps label above a section title. `white` and
// `onColor` are for sitting on a dark/solid-color field, `amber` for a callout,
// `red` (the default) for a plain light/dark surface, `muted`/`subtle` for
// quiet neutral labels and table column headers.
export function Eyebrow({ text, tone = 'red', as: Tag = 'p', className = '' }: EyebrowProps) {
  return <Tag className={`pmg-eyebrow ${TONES[tone]}${className ? ` ${className}` : ''}`}>{text}</Tag>;
}
