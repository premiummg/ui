import { Section, Panel, Spec, Callout } from './components/doc/Section';
import { Swatch } from './components/doc/Swatch';

export function Foundations() {
  return (
    <>
      <Section id="colors" n="01" title="Color"
        note="Straight from the brand book, pg. 12 and 13. The two reds are not interchangeable: MAIN drives interactive elements, SECONDARY fills large areas and hover states - the book's own full-bleed red panels are all SECONDARY, never MAIN, which vibrates at large sizes.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <Swatch hex="#E62027" name="Premium Red MAIN" role="Buttons, links, focus rings, small accents" />
          <Swatch hex="#A51E26" name="Premium Red SECONDARY" role="Hover/pressed states, large red fields - never MAIN for big solid areas" />
          <Swatch hex="#FAAD00" name="Orange-Yellow" role="Hi-vis: flagged, pending, over-budget - attention, not alarm; red stays reserved for destructive/error" />
          <Swatch hex="#3A3A3A" name="Steel Grey" role="Optional industrial surfaces and chrome" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <Swatch hex="#000000" name="Premium Black" role="Anchor, maximum contrast, the app's dark-mode ground" />
          <Swatch hex="#212121" name="Dark Grey" role="Bold text, strong contrast" />
          <Swatch hex="#F2F2F2" name="Light Grey" role="App background, subtle divisions" />
          <Swatch hex="#FFFFFF" name="Premium White" role="Cards and surfaces" />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Tints of MAIN red, for soft backgrounds (badges, icon tiles, hover fills):</p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          <Swatch hex="#FEF5F5" name="brand-50" role="" />
          <Swatch hex="#FDEBEC" name="brand-100" role="" />
          <Swatch hex="#FAD7D8" name="brand-200" role="" />
          <Swatch hex="#F7B8BA" name="brand-300" role="" />
          <Swatch hex="#F18488" name="brand-400" role="" />
        </div>
        <Spec>brand-50…400 (tints) · brand-500 = brand-600 = MAIN · brand-700 = SECONDARY · brand-800/900 (darker, rare) · brand-black/dark/steel/grey/orange</Spec>
      </Section>

      <Section id="typography" n="02" title="Typography"
        note="Montserrat is the PRIMARY face (brand book pg. 14): headings, signage, and every large number or data display. Poppins is SECONDARY - body copy, table cells, form fields - and is the Tailwind preset's default font-sans, since body text is the common case.">
        <Panel className="p-6 space-y-5">
          <div>
            <p className="pmg-eyebrow text-gray-400 mb-2">Eyebrow / signage label</p>
            <p className="font-heading font-black text-3xl">Timesheet Review</p>
            <Spec>.pmg-eyebrow + font-heading font-black text-3xl</Spec>
          </div>
          <div className="border-t border-gray-100 dark:border-white/10 pt-5">
            <div className="flex flex-wrap items-baseline gap-6">
              <div>
                <p className="pmg-eyebrow text-gray-400 mb-2">Data figure</p>
                <span className="pmg-figure text-4xl">1,284.75</span>
              </div>
              <div>
                <p className="pmg-eyebrow text-gray-400 mb-2">Body</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
                  Poppins carries longer content. Clean, readable, and approachable - what the book
                  asks of the secondary face.
                </p>
              </div>
            </div>
            <Spec>.pmg-figure = font-heading font-bold tabular-nums tracking-tight (tabular-nums keeps digits from shifting width as values change on a live-updating dashboard)</Spec>
          </div>
        </Panel>
      </Section>

      <Section id="graphic-devices" n="03" title="Graphic devices"
        note="The book's Graphic System (pg. 16) and Digital Brand Presence (pg. 22), as reusable utility classes. Every diagonal is exactly 45 degrees - the brand's signature angle is explicitly protected (pg. 11 forbids introducing any other angle).">
        <div className="grid sm:grid-cols-2 gap-3">
          <Panel className="p-5">
            <div className="pmg-bracket">
              <p className="font-heading font-bold text-sm">Corner bracket</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The red angular mark the book sets beside body copy and section headings throughout.
                The most recognisable Premium device and the cheapest to apply.
              </p>
            </div>
            <Spec>.pmg-bracket - put it on a relatively positioned parent, it hangs off the top-left</Spec>
          </Panel>

          <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
            <div className="pmg-field pmg-bars p-5 h-full">
              <p className="pmg-eyebrow text-white/70 mb-1.5">Bold red field</p>
              <p className="text-white text-xs">"Solid blocks of Premium Red that command attention and create visual hierarchy." Fills with SECONDARY red - every full-bleed red panel in the book itself is #A51E26, never MAIN.</p>
              <p className="mt-3 text-[11px] text-white/60 font-mono">.pmg-field + .pmg-bars</p>
            </div>
          </div>

          <Panel className="overflow-hidden">
            <div className="pmg-field pmg-diagonal-bottom h-20 flex items-end px-5 pb-7">
              <p className="pmg-eyebrow text-white/80">Diagonal divider</p>
            </div>
            <div className="px-5 pb-4 -mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">"Bold geometric transitions between content sections reinforce brand geometry" - place as the last child of a .pmg-field to cut its bottom edge.</p>
              <Spec>.pmg-diagonal-bottom</Spec>
            </div>
          </Panel>

          <Panel className="p-5 relative overflow-hidden">
            <div className="absolute inset-0 pmg-texture text-gray-900 dark:text-white" />
            <div className="relative">
              <p className="font-heading font-bold text-sm">Industrial texture</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                "Subtle patterns and materials that reflect the tangible, real-world nature of
                construction." Under 4% opacity, same 2px/12px line weight as the bars above so the
                two read as one family. Its opacity is doubled automatically in dark mode - the same
                3.5% currentColor opacity is an identical luminance step in both themes, but reads as
                present in light mode and as missing in dark mode, since a small step is far harder
                to perceive near black than near white.
              </p>
              <Spec>.pmg-texture - never behind body text</Spec>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="pmg-stripe h-2 flex-1 rounded-full" />
            </div>
            <p className="font-heading font-bold text-sm">Hi-vis stripe</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              The amber bar under the primary nav on the reference site - also the left-edge marker
              for flagged/warning rows. Amber is the "attention, not alarm" channel; red stays
              reserved for destructive and error states.
            </p>
            <Spec>.pmg-stripe</Spec>
          </Panel>
        </div>
      </Section>

      <Section id="known-caveats" n="04" title="Known caveats">
        <div className="space-y-3">
          <Callout>
            <code className="font-mono text-xs">bg-brand-steel</code> and the other named{' '}
            <code className="font-mono text-xs">brand.*</code> Tailwind color keys do not compile.
            Use the CSS custom properties instead:{' '}
            <code className="font-mono text-xs">bg-[var(--premium-steel-grey)]</code>.
          </Callout>
          <Callout>
            Never put a Tailwind opacity modifier on a <code className="font-mono text-xs">var()</code> color
            (<code className="font-mono text-xs">bg-[var(--premium-red)]/15</code> produces nothing). Use the
            literal hex instead: <code className="font-mono text-xs">bg-[#E62027]/15</code>.
          </Callout>
          <Callout>
            <code className="font-mono text-xs">.pmg-texture</code>'s opacity is doubled in dark mode automatically -
            nothing to do per component. Every component that uses it (ErrorBoundary, AuthShell, Navbar, Hero)
            picks this up for free.
          </Callout>
        </div>
      </Section>
    </>
  );
}
