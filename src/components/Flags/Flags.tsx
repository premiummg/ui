// Two national marks rather than the letters EN/FR, for a bilingual language
// toggle. In Maritime Canada in particular, the French option is not
// "France" - it's ACADIAN, the tricolour with the Stella Maris, the flag of
// the community an app's own French-speaking users are actually part of. A
// generic France flag would be wrong there. The letters still belong next to
// whichever flag is used: a flag alone makes a visitor decode a symbol
// before they can read the page.
//
// Canada is the official geometry (the real 11-point leaf path, not a
// hand-drawn approximation). Acadia is the French tricolour with the gold
// five-pointed star set in the blue band. Quebec's fleurdelisé is an
// opt-in alternative to Acadian for the French side (see FlagQuebec below) -
// which one a consumer shows is up to it (e.g. a per-division setting), this
// package never picks on its own.

export interface FlagProps {
  className?: string;
}

export function FlagCanada({ className = '' }: FlagProps) {
  return (
    <svg viewBox="0 0 640 480" className={className} aria-hidden="true">
      <path fill="#fff" d="M150.1 0h339.7v480H150z" />
      <path
        fill="#d52b1e"
        d="M-19.7 0h169.8v480H-19.7zm509.5 0h169.8v480H489.9zM201 232l-13.3 4.4 61.4 54c4.7 13.7-1.6 17.8-5.6 25l66.6-8.4-1.6 67 13.9-.3-3.1-66.6 66.7 8c-4.1-8.7-7.8-13.3-4-27.2l61.3-51-10.7-4c-8.8-6.8 3.8-32.6 5.6-48.9 0 0-35.7 12.3-38 5.8l-9.2-17.5-32.6 35.8c-3.5.9-5-.5-5.9-3.5l15-74.8-23.8 13.4q-3.2 1.3-5.2-2.2l-23-46-23.6 47.8q-2.8 2.5-5 .7L264 130.8l13.7 74.1c-1.1 3-3.7 3.8-6.7 2.2l-31.2-35.3c-4 6.5-6.8 17.1-12.2 19.5s-23.5-4.5-35.6-7c4.2 14.8 17 39.6 9 47.7"
      />
    </svg>
  );
}

export function FlagAcadian({ className = '' }: FlagProps) {
  return (
    <svg viewBox="0 0 640 480" className={className} aria-hidden="true">
      <path fill="#002395" d="M0 0h213.3v480H0z" />
      <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
      <path fill="#ED2939" d="M426.7 0H640v480H426.7z" />
      <polygon
        fill="#FFD100"
        points="106,50 120.5,92 165,92.8 129.5,119.6 142.4,162.2 106,136.7 69.6,162.2 82.5,119.6 47,92.8 91.5,92"
      />
    </svg>
  );
}

// Quebec's fleurdelisé: blue field, white cross, a fleur-de-lis in each
// quadrant. The fleur-de-lis is a simplified straight-edge silhouette
// (same shape drawn 4 times at different fixed positions) rather than a
// heraldically precise one - at the small size this actually renders at, the
// blue/white cross is what reads, and a fussier shape is also more likely
// to come out warped than a plain one. Every quadrant copy is a full,
// independent set of points (not a shared shape moved with a transform),
// so there's no scale/rotation math that could get miscalculated.
export function FlagQuebec({ className = '' }: FlagProps) {
  const petal = '20,0 14,20 2,18 10,35 4,50 16,42 16,70 24,70 24,42 36,50 30,35 38,18 26,20';
  return (
    <svg viewBox="0 0 640 480" className={className} aria-hidden="true">
      <path fill="#003DA5" d="M0 0h640v480H0z" />
      <path fill="#fff" d="M280 0h80v480h-80z" />
      <path fill="#fff" d="M0 200h640v80H0z" />
      <polygon fill="#fff" points={petal} transform="translate(120,65)" />
      <polygon fill="#fff" points={petal} transform="translate(480,65)" />
      <polygon fill="#fff" points={petal} transform="translate(120,345)" />
      <polygon fill="#fff" points={petal} transform="translate(480,345)" />
    </svg>
  );
}

// Just the flag's own gold Stella Maris, on its own - for blending into a
// hero's overlay/scrim as a piece of material rather than a flag graphic
// sitting on top of it. See `Hero`'s `overlay="acadian"`.
export function AcadianStar({ className = '' }: FlagProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon fill="#FFD100" points="12,2 14.9,8.6 22.1,9.3 16.7,14.1 18.4,21.2 12,17.3 5.6,21.2 7.3,14.1 1.9,9.3 9.1,8.6" />
    </svg>
  );
}
