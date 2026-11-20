import type { ReactNode } from 'react';
import { FiCheck, FiCopy, FiMail, FiPhone } from 'react-icons/fi';
import { StatusBadge } from '../StatusBadge';
import { IconButton } from '../IconButton';
import { formatPhone } from '../../lib/phone';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useUiText } from '../../lib/i18n';

export interface PersonHeaderLabels {
  active: string;
  inactive: string;
  copyEmail: string;
  /** Said in place of an email the viewer may not see. */
  emailRestricted: string;
}

const TEXT: { en: PersonHeaderLabels; fr: PersonHeaderLabels } = {
  en: { active: 'Active', inactive: 'Inactive', copyEmail: 'Copy email', emailRestricted: 'Restricted' },
  fr: { active: 'Actif', inactive: 'Inactif', copyEmail: 'Copier le courriel', emailRestricted: 'Restreint' },
};

export interface PersonHeaderProps {
  /** The photo tile (a ProfilePhoto at size 48, shape "tile", on rgba(255,255,255,0.15)). */
  photo: ReactNode;
  name: string;
  roleLabel: string;
  active: boolean;
  /**
   * The account is off across Premium: the badges above are access to this app only, and an account stuck off
   * there looks active here while every sign-in is refused. Shown as a solid amber badge with its explanation.
   */
  inactiveEverywhere?: { label: string; hint: string } | null;
  /** Null when the viewer may not see it (an address outside the company): "Restricted" is said instead. */
  email: string | null | undefined;
  phone?: string | null;
  /** The buttons on the right: Message, Edit, the overflow menu. */
  actions?: ReactNode;
  labels?: Partial<PersonHeaderLabels>;
}

// The identity band of one person, inside the red PageHeader of their page: photo, name, role and status, email
// (a mail link with a copy button) and phone, and the page's actions on the right. On the red field the role and
// status pills are white on translucent: the light-surface badges have no contrast there.
export function PersonHeader({ photo, name, roleLabel, active, inactiveEverywhere, email, phone, actions, labels }: PersonHeaderProps) {
  const t = { ...useUiText(TEXT), ...labels };
  const [copied, copy] = useCopyToClipboard();
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3.5">
        {photo}
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-black leading-none text-white">{name}</h1>
            <StatusBadge tone="onColor" label={roleLabel} />
            <StatusBadge tone="onColorSoft" dot={active ? 'bg-green-400' : 'bg-white/50'} label={active ? t.active : t.inactive} />
            {inactiveEverywhere && (
              <StatusBadge colorClass="" style={{ backgroundColor: 'var(--premium-orange)', color: 'var(--premium-dark-grey)' }} label={inactiveEverywhere.label} />
            )}
          </div>
          {inactiveEverywhere && <p className="mb-1.5 max-w-md text-xs text-white/80">{inactiveEverywhere.hint}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
            {email ? (
              <span className="flex min-w-0 max-w-full items-center gap-1.5">
                <a href={`mailto:${email}`} className="flex min-w-0 items-center gap-1.5 break-all text-sm text-white/75 transition hover:text-white">
                  <FiMail size={13} className="shrink-0" /> {email}
                </a>
                <IconButton tone="onColorGhost" size="xs" aria-label={t.copyEmail} onClick={() => copy(email)} className="shrink-0">
                  {copied ? <FiCheck size={13} className="text-green-300" /> : <FiCopy size={13} />}
                </IconButton>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm italic text-white/50">
                <FiMail size={13} /> {t.emailRestricted}
              </span>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-sm text-white/75 transition hover:text-white">
                <FiPhone size={13} /> {formatPhone(phone)}
              </a>
            )}
          </div>
        </div>
      </div>
      {actions && <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto sm:shrink-0">{actions}</div>}
    </div>
  );
}
