import { useEffect, useState, type ReactNode } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { useUiText } from '../../lib/i18n';

// Asked before an import overwrites people who are already on file: each one with the fields that would change
// (old value struck through, new value after the arrow) and a box to leave that person as they are. Silently
// overwriting someone's data from a re-imported sheet is not something to do without asking.
export interface ImportUpdateMatch<K extends string | number = string | number> {
  /** Identifies the row; the set handed to onConfirm holds the keys of the people left unchecked. */
  key: K;
  name: string;
  email?: string;
  diffs: { label: string; from: ReactNode; to: ReactNode }[];
}

export interface ImportUpdateLabels {
  title: string;
  include: string;
  confirm: (n: number) => string;
  continueNoUpdates: string;
  cancel: string;
}

const TEXT: { en: ImportUpdateLabels; fr: ImportUpdateLabels } = {
  en: {
    title: 'Update existing employees?',
    include: 'Update',
    confirm: (n) => `Yes, update ${n === 1 ? 'them' : 'these'}`,
    continueNoUpdates: "Don't update, continue",
    cancel: 'Cancel',
  },
  fr: {
    title: 'Mettre à jour les employés existants?',
    include: 'Mettre à jour',
    confirm: (n) => `Oui, ${n >= 2 ? 'les' : 'le'} mettre à jour`,
    continueNoUpdates: 'Ne rien mettre à jour, continuer',
    cancel: 'Annuler',
  },
};

export interface ImportUpdateDialogProps<K extends string | number> {
  /** Null keeps the dialog closed. */
  matched: ImportUpdateMatch<K>[] | null;
  /** What the import will do: how many are updated, created, and failed to read. */
  message: ReactNode;
  onConfirm: (skipped: Set<K>) => void;
  onCancel: () => void;
  labels?: Partial<ImportUpdateLabels>;
}

export function ImportUpdateDialog<K extends string | number>({ matched, message, onConfirm, onCancel, labels }: ImportUpdateDialogProps<K>) {
  const t = { ...useUiText(TEXT), ...labels };
  const [skipped, setSkipped] = useState<Set<K>>(new Set());
  useEffect(() => { setSkipped(new Set()); }, [matched]);
  if (!matched) return null;

  const toUpdate = matched.length - skipped.size;
  const toggle = (key: K) => setSkipped((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  return (
    <Modal onClose={onCancel} title={t.title} maxWidth="max-w-lg">
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      <div className="mb-4 max-h-64 space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-white/10">
        {matched.map((m, i) => {
          const off = skipped.has(m.key);
          return (
            <div key={m.key} className={i > 0 ? 'border-t border-gray-100 pt-3 dark:border-white/10' : ''}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {m.name} {m.email && <span className="font-normal text-gray-400">({m.email})</span>}
                </p>
                <Checkbox checked={!off} onChange={() => toggle(m.key)} label={t.include} />
              </div>
              <ul className={`mt-1 space-y-0.5 ${off ? 'opacity-40' : ''}`}>
                {m.diffs.map((d, j) => (
                  <li key={j} className="text-xs text-gray-500 dark:text-gray-400">
                    {d.label}: <span className="text-gray-400 line-through">{d.from}</span>{' '}
                    → <span className="text-gray-700 dark:text-gray-200">{d.to}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button variant={toUpdate === 0 ? 'secondary' : 'primary'} className="flex-1 justify-center" onClick={() => onConfirm(skipped)}>
          {toUpdate === 0 ? t.continueNoUpdates : t.confirm(toUpdate)}
        </Button>
        <Button variant="secondary" className="flex-1 justify-center" onClick={onCancel}>
          {t.cancel}
        </Button>
      </div>
    </Modal>
  );
}
