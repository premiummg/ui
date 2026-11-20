import { FiCheck } from 'react-icons/fi';
import { StatusBadge } from '../StatusBadge';
import { ROLE_BADGE_CLASSES } from '../RoleBadge';

const DEFAULT_STYLE = 'border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300';

export interface ChipToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
  // The badge colours (a role's colour, say); an outline by default.
  colorClass?: string;
  // Says what the click does, for the title and a screen reader ("Included: Admin").
  title?: string;
}

// A badge that is switched on and off: off it is dimmed, on it carries a check in its corner. The check is what says
// "on", not the badge's weight: a quiet badge (a worker's) on looked like any badge off.
export function ChipToggle({ label, active, onClick, colorClass = DEFAULT_STYLE, title }: ChipToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={`relative rounded-full transition ${active ? '' : 'opacity-45 hover:opacity-75'}`}
    >
      <StatusBadge label={label} colorClass={colorClass} />
      {active && (
        <span
          className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-white ring-2 ring-white dark:ring-(--premium-dark-grey)"
          style={{ backgroundColor: 'var(--premium-red)' }}
        >
          <FiCheck size={8} strokeWidth={3.5} />
        </span>
      )}
    </button>
  );
}

export interface RolePickerProps {
  // The roles offered, in the order shown.
  roles: string[];
  selected: string[];
  onToggle: (role: string) => void;
  // The name of a role in the app's words and the person's language.
  labelFor: (role: string) => string;
  // The title of a role's chip ("Included: Admin" / "Excluded: Admin"); none by default.
  titleFor?: (role: string, on: boolean) => string;
}

// Which roles something applies to (who sees a custom field, who a post is for): a row of role chips in their colours.
export function RolePicker({ roles, selected, onToggle, labelFor, titleFor }: RolePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => {
        const on = selected.includes(role);
        return (
          <ChipToggle
            key={role}
            label={labelFor(role)}
            active={on}
            onClick={() => onToggle(role)}
            colorClass={ROLE_BADGE_CLASSES[role] ?? ROLE_BADGE_CLASSES.worker}
            title={titleFor?.(role, on)}
          />
        );
      })}
    </div>
  );
}
