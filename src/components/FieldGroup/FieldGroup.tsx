import { ReactNode } from 'react';
import { Card } from '../Card';

export interface FieldGroupProps {
  title: string;
  // Rendered opposite the title, outside the panel - a status indicator
  // (StatusBadge) for a group whose fields represent a single on/off state
  // (e.g. two-factor authentication), not a per-field thing.
  action?: ReactNode;
  note?: ReactNode;
  children: ReactNode;
}

// A form is a sequence of DECISIONS, not a column of inputs, and the group
// heading is what says which decision you are on. The bracket device carries
// the heading (pg. 12, 16) and the panel holds the fields, so a twelve-field
// form reads as four things to settle instead of twelve boxes to fill.
//
// The heading sits OUTSIDE the panel on purpose: the bracket marks the start
// of a section on the page, so a heading tucked inside the card it introduces
// is labelling a box instead of opening a section.
//
// `note` is the line under the fields that says something true about the
// whole group - who can see it, where its contents are defined - rather than
// repeating itself on every field inside.
export function FieldGroup({ title, action, note, children }: FieldGroupProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="pmg-bracket">
          <h2 className="font-heading font-extrabold text-sm text-gray-900 dark:text-gray-100">{title}</h2>
        </div>
        {action}
      </div>
      <Card className="p-5">
        {children}
        {note && (
          <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-white/10">
            {note}
          </p>
        )}
      </Card>
    </section>
  );
}
