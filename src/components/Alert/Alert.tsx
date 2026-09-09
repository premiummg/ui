import { ReactNode } from 'react';
import { FiAlertTriangle, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

// The brand book has no blue, so 'info' moves off it onto the same neutral
// Steel Grey used for inert status everywhere else, instead of borrowing a
// hue that appears nowhere in the brand book. Every variant keeps its soft
// tint and gains a solid brand-hex left edge - the tint alone doesn't
// distinguish red from amber as sharply as an exact hex does.
const STYLES: Record<AlertVariant, { cls: string; edge: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  error: {
    cls: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
    edge: 'var(--premium-red)',
    Icon: FiAlertTriangle,
  },
  success: {
    cls: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
    edge: '#22c55e',
    Icon: FiCheck,
  },
  warning: {
    cls: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
    edge: 'var(--premium-orange)',
    Icon: FiAlertCircle,
  },
  info: {
    cls: 'bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300',
    edge: 'var(--premium-steel-grey)',
    Icon: FiInfo,
  },
};

export interface AlertProps {
  variant?: AlertVariant;
  // A plain message, not a composition slot - every real use of this is one
  // line of text (an error string, a warning). `text` rather than `children`
  // so it shows up as a plain text field in Storybook's Controls panel
  // instead of an opaque "children" prop.
  text: ReactNode;
  className?: string;
}

export function Alert({ variant = 'error', text, className = '' }: AlertProps) {
  const { cls, edge, Icon } = STYLES[variant];
  return (
    <div className={`flex items-center gap-2.5 pl-0 pr-4 py-3 rounded-2xl text-sm overflow-hidden ${cls} ${className}`}>
      <span className="self-stretch w-[3px] shrink-0" style={{ backgroundColor: edge }} />
      <Icon size={15} className="shrink-0" />
      {text}
    </div>
  );
}
