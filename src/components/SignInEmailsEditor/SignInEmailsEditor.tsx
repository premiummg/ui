import type { KeyboardEvent } from 'react';
import { FiPlus, FiStar, FiX } from 'react-icons/fi';
import { Input } from '../Input';
import { IconButton } from '../IconButton';
import { Button } from '../Button';
import { TextButton } from '../TextButton';
import { DashedAddButton } from '../DashedAddButton';
import { FieldError } from '../FieldError';
import { useUiText } from '../../lib/i18n';

interface Labels {
  primary: string;
  makePrimary: string;
  remove: string;
  add: string;
  addPlaceholder: string;
  extraPlaceholder: string;
  extraRow: (n: number) => string;
}

const TEXT: { en: Labels; fr: Labels } = {
  en: {
    primary: 'Primary',
    makePrimary: 'Make primary',
    remove: 'Remove',
    add: 'Add',
    addPlaceholder: 'Add another email',
    extraPlaceholder: 'e.g. jsmith@gmail.com',
    extraRow: (n) => `Additional email ${n}`,
  },
  fr: {
    primary: 'Principal',
    makePrimary: 'Définir comme principal',
    remove: 'Retirer',
    add: 'Ajouter',
    addPlaceholder: 'Ajouter un autre courriel',
    extraPlaceholder: 'ex. jsmith@gmail.com',
    extraRow: (n) => `Courriel supplémentaire ${n}`,
  },
};

export interface SignInEmail {
  id: string;
  email: string;
  is_primary: boolean;
}

export type SignInEmailsLabels = Pick<Labels, 'primary' | 'makePrimary' | 'remove' | 'add' | 'addPlaceholder'>;

export interface SignInEmailsEditorProps {
  emails: SignInEmail[];
  onSetPrimary: (id: string) => void;
  onRemove: (id: string) => void;
  /** Whether the buttons of one email are waiting for an answer. */
  isBusy?: (id: string) => boolean;
  /** The email being typed in the add row. The caller holds it, so saving the whole form can add it too. */
  newEmail: string;
  onNewEmailChange: (value: string) => void;
  onAdd: () => void;
  adding?: boolean;
  error?: string | null;
  labels?: Partial<SignInEmailsLabels>;
}

// The emails a person can sign in with: each one, the primary marked, and for the others "Make primary" and remove;
// below, a field to add one more (Enter adds it). Not a form of its own: it sits inside the person's form, and a
// form inside a form is not valid HTML.
export function SignInEmailsEditor({
  emails, onSetPrimary, onRemove, isBusy = () => false, newEmail, onNewEmailChange, onAdd, adding, error, labels,
}: SignInEmailsEditorProps) {
  const t = { ...useUiText(TEXT), ...labels };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); onAdd(); }
  };
  return (
    <>
      <ul className="space-y-2">
        {emails.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 dark:border-white/10">
            <span className="flex min-w-0 items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
              <span className="truncate">{e.email}</span>
              {e.is_primary && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/10 dark:text-gray-400">
                  <FiStar size={9} /> {t.primary}
                </span>
              )}
            </span>
            {!e.is_primary && (
              <span className="flex shrink-0 items-center gap-1">
                <TextButton onClick={() => onSetPrimary(e.id)} disabled={isBusy(e.id)}>{t.makePrimary}</TextButton>
                <IconButton tone="danger" onClick={() => onRemove(e.id)} disabled={isBusy(e.id)} aria-label={t.remove} title={t.remove}>
                  <FiX size={14} />
                </IconButton>
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-start gap-2">
        <div className="flex-1">
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => onNewEmailChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t.addPlaceholder}
            aria-label={t.addPlaceholder}
            className="input-field w-full"
          />
          {error && <FieldError message={error} />}
        </div>
        <Button variant="secondary" className="h-10.5" onClick={onAdd} disabled={adding || !newEmail.trim()}>
          <FiPlus size={14} /> {t.add}
        </Button>
      </div>
    </>
  );
}

export type ExtraEmailsLabels = Pick<Labels, 'remove' | 'extraPlaceholder' | 'extraRow'> & { addAnother: string };

export interface ExtraEmailsInputProps {
  /** One entry per row; an empty string is an empty row. There is always at least one row. */
  emails: string[];
  onChange: (emails: string[]) => void;
  labels?: Partial<ExtraEmailsLabels>;
}

const ADD_ANOTHER = { en: 'Add another email', fr: 'Ajouter un autre courriel' };

// The extra sign-in emails of a person not created yet: rows to type them in, a button to add a row and one to take
// one away (the last row is emptied instead). They are sent once the person exists.
export function ExtraEmailsInput({ emails, onChange, labels }: ExtraEmailsInputProps) {
  const t = { ...useUiText(TEXT), addAnother: useUiText(ADD_ANOTHER), ...labels };
  const rows = emails.length ? emails : [''];
  return (
    <>
      <div className="space-y-2">
        {rows.map((email, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => onChange(rows.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder={t.extraPlaceholder}
              aria-label={t.extraRow(i + 1)}
              className="input-field flex-1"
            />
            <IconButton
              tone="danger"
              onClick={() => onChange(rows.length > 1 ? rows.filter((_, j) => j !== i) : [''])}
              aria-label={t.remove}
              title={t.remove}
              className="shrink-0"
            >
              <FiX size={14} />
            </IconButton>
          </div>
        ))}
      </div>
      <DashedAddButton label={t.addAnother} onClick={() => onChange([...rows, ''])} className="mt-2" />
    </>
  );
}
