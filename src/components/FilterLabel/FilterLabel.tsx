import { ReactNode } from 'react';

export interface FilterLabelProps {
  // Always a short facet name ("Status", "Vendor"), never a composition slot.
  text: ReactNode;
}

export function FilterLabel({ text }: FilterLabelProps) {
  return (
    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
      {text}
    </p>
  );
}
