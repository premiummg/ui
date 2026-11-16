import { ReactNode } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Eyebrow, EyebrowTone } from '../Eyebrow';
import { SiteButton } from '../SiteButton';
import { AcadianStar } from '../Flags';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

// Give `href` for an action that goes somewhere (it renders a real link, so
// it can be opened in a new tab and followed by a crawler), `onClick` for one
// that does something on the page. With both, `onClick` is called for a plain
// click instead of a page load - the hook for a client-side router.
export interface HeroAction {
  label: ReactNode;
  onClick?: () => void;
  href?: string;
}

export type HeroSize = 'default' | 'compact';

export type HeroOverlay = 'scrim' | 'acadian';

export interface HeroProps {
  eyebrow: string;
  eyebrowTone?: EyebrowTone;
  title: ReactNode;
  sub?: string;
  // Both optional, and independent of each other:
  //   - imageSrc alone -> a plain image hero.
  //   - videoSrc alone -> the video plays with no poster attribute (the
  //     browser just shows black, then its own first frame, until it loads).
  //   - both -> imageSrc becomes the video's poster, shown until the clip is
  //     ready and again for any visitor who prefers reduced motion (the
  //     video is skipped entirely then, so that visitor never downloads it).
  //   - neither -> a plain dark field behind the copy, no media at all.
  imageSrc?: string;
  videoSrc?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  // A small line under the actions - a service area, a phone number, etc.
  caption?: ReactNode;
  // 'scrim' (default): a plain black gradient, heavier on the left where the
  // words sit. 'acadian': the same idea colored Acadian blue-to-red, with
  // the flag's own gold star blended into the blue side - for a bilingual
  // Maritime brand whose own logo already wraps this flag around it,
  // instead of a generic dark wash borrowed from elsewhere.
  overlay?: HeroOverlay;
  // Premium's own 45deg wedge (BRAND.md pg. 16) is a signature device
  // specific to that brand - off by default so a different brand (a sister
  // company, a client site) doesn't inherit it by accident. Turn it on only
  // for a genuinely Premium-branded page.
  wedge?: boolean;
  // A breadcrumb or back link above the eyebrow, for a hero that opens an
  // inner page (a service, an article) rather than the home page.
  breadcrumb?: ReactNode;
  // Anything after the caption: a row of certification badges, a phone
  // number block. Sits inside the same text column, on the same scrim.
  children?: ReactNode;
  // 'compact' trims the vertical padding for an inner page's hero, where the
  // page's own content should start sooner than on the home page.
  size?: HeroSize;
  className?: string;
}

const PADDING: Record<HeroSize, string> = {
  default: 'py-24 md:py-32',
  compact: 'py-16 md:py-20',
};

function ActionButton({ action, variant }: { action: HeroAction; variant: 'primary' | 'onDark' }) {
  const label = variant === 'primary' ? <>{action.label} <FiArrowRight size={16} /></> : action.label;
  if (action.href !== undefined) {
    return <SiteButton variant={variant} href={action.href} onNavigate={action.onClick}>{label}</SiteButton>;
  }
  return <SiteButton variant={variant} onClick={action.onClick}>{label}</SiteButton>;
}

// A full-bleed landing-page hero: optional image/video background with a
// legibility scrim, eyebrow + headline + subhead, up to two CTAs, an
// optional caption line. The headline is deliberately NOT wrapped in a
// reveal-on-scroll animation anywhere this is used - it's the largest
// contentful paint on the page, and hiding it pending a scroll observer is
// the wrong tradeoff for the single most important paint on the page.
export function Hero({
  eyebrow, eyebrowTone = 'amber', title, sub, imageSrc, videoSrc,
  primaryAction, secondaryAction, caption, overlay = 'scrim', wedge = false,
  breadcrumb, children, size = 'default', className = '',
}: HeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const showVideo = videoSrc && !reducedMotion;

  return (
    <header className={`relative bg-(--premium-black) overflow-hidden ${className}`}>
      {showVideo ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay muted loop playsInline preload="metadata"
          poster={imageSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : imageSrc ? (
        <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : null}

      {/* The headline has to clear contrast on a moving background, and a
          moving background has no fixed contrast ratio - so the type gets
          its own ground rather than being trusted to the frame underneath.
          Heavier on the left where the words are, lighter on the right
          where the shot should still read as a shot. */}
      {overlay === 'acadian' ? (
        <>
          <div className="absolute inset-0 bg-linear-to-r from-[#001B4D]/90 via-[#1A2C6E]/60 to-[#ED2939]/55" />
          {/* The star lives IN the overlay, not on top of it - part of the
              same colored material as the scrim rather than a UI badge
              sitting over the video. Left, not right: on the real flag the
              star sits IN the blue band, and the scrim runs blue on the
              left fading to red on the right. mix-blend-screen, not
              overlay: overlay's effect flips direction with the base color
              (it darkens over the dark blue side, lightens over the
              lighter red side) - screen only ever adds light, so the same
              gold reads consistently over either color. */}
          <AcadianStar className="hidden sm:block absolute -left-10 -top-16 w-80 h-80 md:w-100 md:h-100 opacity-25 mix-blend-screen pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/70 to-black/40" />
      )}
      {/* The industrial hatch reads as Premium's own material (BRAND.md pg.
          16, the same device as .pmg-bars) - right under the scrim's plain
          black gradient, but not under the Acadian one, which is already its
          own two-colour material and gains nothing from a second texture
          layered on top of it. */}
      {overlay !== 'acadian' && <div className="absolute inset-0 pmg-texture text-white" />}

      {wedge && (
        // ONE 45deg edge, not a floating rhombus: the square is much larger
        // than the band and anchored past the corner, so all four vertices
        // fall outside the frame and only a single straight edge crosses.
        // The hatch inside is counter-rotated - .pmg-bars draws at 45deg, so
        // an element already rotated 45deg would otherwise render it
        // vertical, the one angle the brand book doesn't permit.
        <div
          className="absolute hidden md:block w-300 h-300 overflow-hidden"
          style={{ right: '-760px', bottom: '-760px', transform: 'rotate(45deg)', backgroundColor: 'var(--premium-red-dark)', opacity: 0.88 }}
        >
          <div className="pmg-bars" style={{ position: 'absolute', left: '-30%', top: '-30%', width: '160%', height: '160%', transform: 'rotate(-45deg)' }} />
        </div>
      )}

      <div className={`relative max-w-6xl mx-auto px-6 ${PADDING[size]}`}>
        <div className="max-w-2xl">
          {breadcrumb && <div className="text-sm text-white/80 mb-6">{breadcrumb}</div>}
          <Eyebrow tone={eyebrowTone} text={eyebrow} />
          <h1 className="font-heading font-black text-4xl md:text-[54px] leading-[1.05] text-white mt-4">
            {title}
          </h1>
          {sub && <p className="text-lg text-white/80 mt-6 max-w-xl leading-relaxed">{sub}</p>}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap items-center gap-3 mt-9">
              {primaryAction && <ActionButton action={primaryAction} variant="primary" />}
              {secondaryAction && <ActionButton action={secondaryAction} variant="onDark" />}
            </div>
          )}
          {caption && <div className="inline-flex items-center gap-2 text-xs text-white/50 mt-8">{caption}</div>}
          {children && <div className="mt-10">{children}</div>}
        </div>
      </div>
    </header>
  );
}
