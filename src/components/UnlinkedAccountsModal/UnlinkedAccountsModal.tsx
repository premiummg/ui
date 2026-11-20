import { useMemo, useState, type ReactNode } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { TextButton } from '../TextButton';
import { SearchInput } from '../SearchInput';
import { CountBadge } from '../CountBadge';
import { Checkbox } from '../Checkbox';
import { FilterRow } from '../FilterRow';
import { FilterToggleButton } from '../FilterToggleButton';
import { FieldError } from '../FieldError';
import { Avatar } from '../Avatar';
import { uniqueEntities, uniqueValues } from '../../lib/filters';
import { useUiText } from '../../lib/i18n';

// The Premium accounts that exist in other apps but not in this one yet: searchable, filtered by app, division and
// company, each with the apps it is in and an Activate button, and a selection to activate several at once. What
// activating asks (a manager, a warning) stays with the app: Activate hands the account, or the selection, back.

export interface UnlinkedAccount {
  id: string;
  name: string;
  email: string;
  photo_url?: string | null;
}

export interface UnlinkedAccountsLabels {
  search: string;
  filters: string;
  app: string;
  division: string;
  company: string;
  clearAllFilters: string;
  selectAll: (n: number) => string;
  selectAccount: (name: string) => string;
  activateSelected: (n: number) => string;
  activate: string;
  close: string;
  loading: string;
  loadError: string;
  retry: string;
  noneMatch: string;
}

const TEXT: { en: UnlinkedAccountsLabels; fr: UnlinkedAccountsLabels } = {
  en: {
    search: 'Search name or email…',
    filters: 'Filters',
    app: 'App',
    division: 'Division',
    company: 'Company',
    clearAllFilters: 'Clear all filters',
    selectAll: (n) => `Select all (${n})`,
    selectAccount: (name) => `Select ${name}`,
    activateSelected: (n) => `Activate selected (${n})`,
    activate: 'Activate',
    close: 'Close',
    loading: 'Loading…',
    loadError: 'Could not load the accounts',
    retry: 'Try again',
    noneMatch: 'No accounts match these filters.',
  },
  fr: {
    search: 'Rechercher un nom ou un courriel…',
    filters: 'Filtres',
    app: 'Application',
    division: 'Division',
    company: 'Entreprise',
    clearAllFilters: 'Effacer tous les filtres',
    selectAll: (n) => `Tout sélectionner (${n})`,
    selectAccount: (name) => `Sélectionner ${name}`,
    activateSelected: (n) => `Activer la sélection (${n})`,
    activate: 'Activer',
    close: 'Fermer',
    loading: 'Chargement…',
    loadError: 'Impossible de charger les comptes',
    retry: 'Réessayer',
    noneMatch: 'Aucun compte ne correspond à ces filtres.',
  },
};

type Entity = { id: string; name: string };

export interface UnlinkedAccountsModalProps<A extends UnlinkedAccount> {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Said when there is no account left to bring in. */
  allLinkedText: string;
  accounts: A[] | null | undefined;
  loading?: boolean;
  failed?: boolean;
  onRetry?: () => void;
  /** The apps an account is in, its divisions and its companies: what the three filters offer. */
  appsOf: (a: A) => string[];
  divisionsOf: (a: A) => Entity[];
  companiesOf: (a: A) => Entity[];
  /** One pill per app the account is in ("Intranet · Worker · Moncton"). */
  tagsOf: (a: A) => { key: string; label: string }[];
  /** A line under the email (a possible duplicate). */
  noteOf?: (a: A) => ReactNode;
  photoOf?: (a: A) => string | undefined;
  /** The selection, held by the caller so it can keep the accounts that failed selected. */
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  onActivate: (a: A) => void;
  /** Only the selected accounts still on screen: a selection made before narrowing the list is not activated. */
  onActivateSelected: (accounts: A[]) => void;
  labels?: Partial<UnlinkedAccountsLabels>;
}

export function UnlinkedAccountsModal<A extends UnlinkedAccount>({
  open, onClose, title, allLinkedText, accounts, loading, failed, onRetry, appsOf, divisionsOf, companiesOf, tagsOf,
  noteOf, photoOf, selectedIds, onSelectedChange, onActivate, onActivateSelected, labels,
}: UnlinkedAccountsModalProps<A>) {
  const t = { ...useUiText(TEXT), ...labels };
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appFilter, setAppFilter] = useState<string[]>([]);
  const [divisionFilter, setDivisionFilter] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string[]>([]);

  const list = accounts ?? [];
  const appOptions = useMemo(() => uniqueValues(list, appsOf), [list, appsOf]);
  const divisionOptions = useMemo(() => uniqueEntities(list, divisionsOf), [list, divisionsOf]);
  const companyOptions = useMemo(() => uniqueEntities(list, companiesOf), [list, companiesOf]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((a) => {
      // A plain word matches the name and the part of the email before the @: matching the domain would let a
      // name search match everyone of the same company. A query with an @ matches the whole address.
      const email = q.includes('@') ? a.email : (a.email || '').split('@')[0];
      if (q && !`${a.name} ${email}`.toLowerCase().includes(q)) return false;
      if (appFilter.length && !appsOf(a).some((x) => appFilter.includes(x))) return false;
      if (divisionFilter.length && !divisionsOf(a).some((d) => divisionFilter.includes(d.id))) return false;
      if (companyFilter.length && !companiesOf(a).some((c) => companyFilter.includes(c.id))) return false;
      return true;
    });
  }, [list, search, appFilter, divisionFilter, companyFilter, appsOf, divisionsOf, companiesOf]);

  if (!open) return null;

  const activeFilterCount = appFilter.length + divisionFilter.length + companyFilter.length;
  const toggleIn = (setter: (fn: (prev: string[]) => string[]) => void) => (value: string) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  const selected = filtered.filter((a) => selectedIds.includes(a.id));
  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.includes(a.id));
  const toggleAll = (checked: boolean) => {
    const ids = filtered.map((a) => a.id);
    onSelectedChange(checked ? Array.from(new Set([...selectedIds, ...ids])) : selectedIds.filter((id) => !ids.includes(id)));
  };
  const toggleOne = (id: string) =>
    onSelectedChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  return (
    <Modal
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <span className="inline-flex items-center gap-2">
          {title}
          {!loading && accounts && <CountBadge count={accounts.length} />}
        </span>
      }
    >
      <div className="mb-3 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t.search} className="w-full max-w-sm" />
        {(appOptions.length > 1 || divisionOptions.length > 0 || companyOptions.length > 0) && (
          <FilterToggleButton open={showFilters} count={activeFilterCount} onClick={() => setShowFilters((v) => !v)} label={t.filters} />
        )}
      </div>

      {showFilters && (
        <div className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-(--premium-dark-grey)">
          {appOptions.length > 1 && (
            <>
              <FilterRow label={t.app} options={appOptions} selected={appFilter} onToggle={toggleIn(setAppFilter)} onClear={() => setAppFilter([])} />
              <div className="h-px bg-gray-100 dark:bg-white/10" />
            </>
          )}
          <FilterRow label={t.division} options={divisionOptions} selected={divisionFilter} onToggle={toggleIn(setDivisionFilter)} onClear={() => setDivisionFilter([])} />
          <div className="h-px bg-gray-100 dark:bg-white/10" />
          <FilterRow label={t.company} options={companyOptions} selected={companyFilter} onToggle={toggleIn(setCompanyFilter)} onClear={() => setCompanyFilter([])} />
          {activeFilterCount > 0 && (
            <TextButton className="pt-1" onClick={() => { setAppFilter([]); setDivisionFilter([]); setCompanyFilter([]); }}>
              {t.clearAllFilters}
            </TextButton>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Checkbox checked={allSelected} onChange={toggleAll} label={t.selectAll(filtered.length)} />
          {selected.length > 0 && (
            <Button size="xs" onClick={() => onActivateSelected(selected)}>
              <FiUserPlus size={13} />
              {t.activateSelected(selected.length)}
            </Button>
          )}
        </div>
      )}

      <div className="max-h-[50vh] divide-y divide-gray-100 overflow-y-auto pr-1 dark:divide-white/10">
        {loading && <p role="status" className="py-3 text-sm text-gray-400">{t.loading}</p>}
        {!loading && failed && (
          <div className="flex items-center justify-between gap-3 py-6">
            <FieldError scope="form" message={t.loadError} />
            {onRetry && <TextButton onClick={onRetry}>{t.retry}</TextButton>}
          </div>
        )}
        {!loading && !failed && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">{list.length ? t.noneMatch : allLinkedText}</p>
        )}
        {filtered.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Checkbox checked={selectedIds.includes(a.id)} onChange={() => toggleOne(a.id)} aria-label={t.selectAccount(a.name)} />
              <Avatar fullName={a.name} size={36} color="#6B7280" src={photoOf?.(a)} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{a.name}</div>
                <div className="truncate text-xs text-gray-400">{a.email}</div>
                {noteOf?.(a)}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {tagsOf(a).map((tag) => (
                    <span key={tag.key} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Button size="xs" className="shrink-0" onClick={() => onActivate(a)}>
              <FiUserPlus size={13} />
              {t.activate}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>{t.close}</Button>
      </div>
    </Modal>
  );
}
