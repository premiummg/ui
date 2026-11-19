import type { ReactNode } from 'react';
import { Card } from '../Card';
import { StatusBadge } from '../StatusBadge';
import { TextButton } from '../TextButton';
import { useUiText } from '../../lib/i18n';

export interface ImportResult {
  name: string;
  status: 'ok' | 'error';
  message?: string;
}

export interface ImportResultsCardProps {
  results: ImportResult[];
  // The headline, from the two counts: "3 created, 1 failed".
  summary: (ok: number, failed: number) => string;
  // The tag of a row that went through and of one that did not. Default to "Done" / "Failed" in the current language.
  okLabel?: string;
  failedLabel?: string;
  dismissLabel?: string;
  onDismiss: () => void;
  // Shown once, to the right of the summary: an import from a template uses it for "Download template", an import
  // that maps its own columns has nothing there.
  extra?: ReactNode;
}

const TEXT = {
  en: { ok: 'Done', failed: 'Failed', dismiss: 'Dismiss' },
  fr: { ok: 'Terminé', failed: 'Échec', dismiss: 'Fermer' },
};

// The result of a batch of imported or bulk-changed lines: one row per line, green for done, red with the reason for
// anything that was skipped (a duplicate name, a missing required field, a record still in use).
export function ImportResultsCard({ results, summary, okLabel, failedLabel, dismissLabel, onDismiss, extra }: ImportResultsCardProps) {
  const tx = useUiText(TEXT);
  const ok = results.filter(r => r.status === 'ok').length;
  const failed = results.filter(r => r.status === 'error').length;
  return (
    <Card padding className="mb-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{summary(ok, failed)}</p>
        <div className="flex items-center gap-3 shrink-0">
          {extra}
          <TextButton tone="muted" onClick={onDismiss}>{dismissLabel ?? tx.dismiss}</TextButton>
        </div>
      </div>
      <ul className="space-y-1.5 max-h-40 overflow-y-auto">
        {results.map((r, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <StatusBadge tone={r.status === 'ok' ? 'success' : 'error'} label={r.status === 'ok' ? (okLabel ?? tx.ok) : (failedLabel ?? tx.failed)} />
            <span className="text-gray-700 dark:text-gray-300">{r.name}</span>
            {r.message && <span className="text-gray-400">({r.message})</span>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
