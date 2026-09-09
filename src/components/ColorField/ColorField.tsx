import { ReactNode } from 'react';

export interface ColorFieldProps {
  // Any CSS color - a hex value, a CSS var, whatever the calling brand uses.
  // Defaults to Premium's own SECONDARY red (#A51E26/--premium-red-dark) -
  // every full-bleed red panel in the brand book itself fills with this, not
  // MAIN red, which vibrates at large sizes.
  color?: string;
  // The diagonal bars' own color, independent of the field. Defaults to the
  // brand book's own semi-transparent white (`.pmg-bars`, pg. 16) - correct
  // for a dark-enough field, but a sister brand on a pale field color needs
  // the bars in something other than white to still read as a highlight
  // rather than disappearing into it.
  barsColor?: string;
  className?: string;
  children: ReactNode;
}

// A bold solid-color field with the 45deg diagonal bars running through it -
// "solid blocks of color that command attention and create visual hierarchy"
// (BRAND.md pg. 16). Premium's own use of this is always red, but the field
// itself is just a color decision: a sister brand (Otoshi's navy, say) gets
// the same device with its own color, not a second component. Compose the
// content inside with `Eyebrow` (`tone="white"`) and `SiteButton`
// (`variant="onRed"` reads correctly on any dark-enough field color).
export function ColorField({ color = 'var(--premium-red-dark)', barsColor, className = '', children }: ColorFieldProps) {
  return (
    <div className={`relative overflow-hidden text-white ${className}`} style={{ backgroundColor: color }}>
      <div
        className={`absolute inset-0 pointer-events-none ${barsColor ? '' : 'pmg-bars'}`}
        style={barsColor ? {
          backgroundImage: `repeating-linear-gradient(var(--pmg-angle), ${barsColor} 0px, ${barsColor} 2px, transparent 2px, transparent 12px)`,
        } : undefined}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
