import { FiX } from 'react-icons/fi';
import { IconButton } from '../IconButton';
import { useUiText } from '../../lib/i18n';

// The history of one rate (hourly or DPSP): each rate with the date it starts, "since the beginning" for the entry
// that covers every past day, and a button to remove one. While it loads, or if it could not be read, it says so:
// an empty list there would read as "no rate yet". With `keepSoleBeginning` (the default) the only entry, when it
// covers every past day, is not offered for removal: it is changed with a new rate, not removed.
export interface RateHistoryEntry {
  id: string | number;
  rate: number | string;
  /** YYYY-MM-DD. A date on or before 1900-01-02 means "since the beginning". */
  effective_from: string;
}

export interface RateHistoryLabels {
  loading: string;
  failed: string;
  sinceTheBeginning: string;
  remove: string;
}

const TEXT: { en: RateHistoryLabels; fr: RateHistoryLabels } = {
  en: {
    loading: 'Loading the rates…',
    failed: 'Could not load the rates. They are still there; reopen the page to see them.',
    sinceTheBeginning: 'since the beginning',
    remove: 'Remove this rate',
  },
  fr: {
    loading: 'Chargement des taux…',
    failed: 'Impossible de charger les taux. Ils sont toujours là; rouvrez la page pour les voir.',
    sinceTheBeginning: 'depuis le début',
    remove: 'Retirer ce taux',
  },
};

const BEGINNING = '1900-01-02';

export interface RateHistoryListProps<R extends RateHistoryEntry> {
  title: string;
  /** What to say when there is no rate yet. */
  emptyText: string;
  rates: R[];
  loading?: boolean;
  failed?: boolean;
  onRemove: (rate: R) => void;
  keepSoleBeginning?: boolean;
  labels?: Partial<RateHistoryLabels>;
  className?: string;
}

export function RateHistoryList<R extends RateHistoryEntry>({
  title, emptyText, rates, loading, failed, onRemove, keepSoleBeginning = true, labels, className = 'mt-3',
}: RateHistoryListProps<R>) {
  const t = { ...useUiText(TEXT), ...labels };
  const since = (from: string) => (from <= BEGINNING ? t.sinceTheBeginning : from);
  return (
    <div className={className}>
      <p className="font-heading text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
      {loading ? (
        <p className="mt-1 text-sm text-gray-400">{t.loading}</p>
      ) : failed ? (
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{t.failed}</p>
      ) : rates.length === 0 ? (
        <p className="mt-1 text-sm text-gray-400">{emptyText}</p>
      ) : (
        <ul className="mt-1 divide-y divide-gray-100 dark:divide-white/10">
          {rates.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-1.5 text-sm">
              <span><span className="pmg-figure">${Number(r.rate).toFixed(2)}</span> <span className="text-gray-400">· {since(r.effective_from)}</span></span>
              {!(keepSoleBeginning && rates.length === 1 && r.effective_from <= BEGINNING) && (
                <IconButton aria-label={t.remove} onClick={() => onRemove(r)}><FiX size={14} /></IconButton>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
