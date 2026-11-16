import { ReactNode } from 'react';

export interface StatBandItem {
  // The figure exactly as it should read ("75+", "4", "[000]+"). A string,
  // not a number: the brand writes "75+", and a figure is never animated
  // up from zero here (a number that is wrong for 800ms, against a brand
  // whose first pillar is Precision).
  value: string;
  label: ReactNode;
  // Hi-vis amber instead of white: the "attention, not alarm" channel - for
  // a figure that still has to be confirmed, or the one to look at first.
  highlight?: boolean;
  // A small line under the label (a "[ to confirm ]" chip, a source).
  note?: ReactNode;
}

export interface StatBandProps {
  items: StatBandItem[];
  // Spoken name of the band, since it has no visible heading of its own.
  label?: string;
  className?: string;
}

// The row of headline figures that sits right under a hero - years in
// business, projects completed, certifications - on Premium Black with the
// industrial hatch and a MAIN red rule on top. Figures are Montserrat
// (`.pmg-figure`), the brand's typeface for "large numbers and data
// displays" (pg. 14). Wraps from five across to two per row on a phone
// without a breakpoint per count: each figure takes at least 140px.
export function StatBand({ items, label, className = '' }: StatBandProps) {
  return (
    <section
      aria-label={label}
      className={`relative overflow-hidden bg-(--premium-black) border-t-[3px] border-(--premium-red) ${className}`}
    >
      <div className="absolute inset-0 pmg-texture text-white pointer-events-none" />
      <ul className="relative max-w-6xl mx-auto px-6 py-10 grid gap-8 grid-cols-[repeat(auto-fit,minmax(min(140px,100%),1fr))]">
        {items.map((item, i) => (
          <li key={i} className="flex flex-col gap-2.5">
            <p className={`pmg-figure font-black text-4xl md:text-5xl leading-none ${item.highlight ? 'text-(--premium-orange)' : 'text-white'}`}>
              {item.value}
            </p>
            <p className="text-sm leading-snug text-white/80">{item.label}</p>
            {item.note && <div className="text-xs text-white/70">{item.note}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
