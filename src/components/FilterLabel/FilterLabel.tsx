import { ReactNode } from 'react';

export interface FilterLabelProps {
  // Always a short facet name ("Status", "Vendor"), never a composition slot.
  text: ReactNode;
  // Ties the caption to its field; renders a <label> instead of a plain caption.
  htmlFor?: string;
}

export function FilterLabel({ text, htmlFor }: FilterLabelProps) {
  const className = 'block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5';
  return htmlFor ? <label htmlFor={htmlFor} className={className}>{text}</label> : <p className={className}>{text}</p>;
}
