import { Eyebrow } from '../Eyebrow';

export interface SectionHeadProps {
  eyebrow: string;
  title: string;
  sub?: string;
  tone?: 'light' | 'dark';
  center?: boolean;
}

// A marketing/landing-page section heading: eyebrow, headline, optional
// one-paragraph subhead. `tone="dark"` is for a section sitting on a solid
// dark/color field rather than the page's own light/dark surface.
export function SectionHead({ eyebrow, title, sub, tone = 'light', center = false }: SectionHeadProps) {
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      <Eyebrow tone={tone === 'dark' ? 'white' : 'red'} text={eyebrow} />
      <h2 className={`font-heading font-black text-3xl md:text-4xl leading-[1.1] mt-3 ${
        tone === 'dark' ? 'text-white' : 'text-(--premium-black) dark:text-white'
      }`}>
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 text-base leading-relaxed ${tone === 'dark' ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
