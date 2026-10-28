export interface PremiumMarkProps {
  // Rendered height in px; the width follows the artwork's proportions.
  size?: number;
  className?: string;
  // Omit for a decorative mark (hidden from screen readers), set it when the
  // mark stands alone without a text label beside it.
  title?: string;
}

// The Premium "P" as a vector, drawn in currentColor so it follows the text
// color (white in a navbar, brand red on a page, ...). The lit faces are solid
// and the shadowed faces are the same color at lower opacity, which is what
// gives it the folded look of the real logo in any single color.
export function PremiumMark({ size = 24, className, title }: PremiumMarkProps) {
  return (
    <svg
      viewBox="47 16 281 321"
      height={size}
      style={{ width: 'auto', aspectRatio: '281 / 321' }}
      fill="currentColor"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g fillOpacity={0.7}>
        <path d="M48 17H327V81H108V275L48 222Z" />
        <path d="M156 127L219 184C214 194 205 198 190 198H156Z" />
        <path d="M155 250L274 334H155Z" />
      </g>
      <path d="M220 84L327 106V334H274L155 250V248L216 242C262 234 276 205 276 165C276 125 250 98 220 84Z" />
      <path d="M156 127H186C210 127 224 143 224 162C224 176 222 181 219 184Z" />
    </svg>
  );
}
