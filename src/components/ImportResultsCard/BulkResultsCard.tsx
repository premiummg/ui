import { ImportResultsCard, type ImportResultsCardProps } from './ImportResultsCard';

export interface BulkResult {
  id: string;
  status: 'ok' | 'error';
  message?: string;
}

export interface BulkResultsCardProps extends Omit<ImportResultsCardProps, 'results'> {
  results: BulkResult[];
  // The server only answers with ids, and the row may already be gone from the page's state by the time this renders,
  // so the page says how to name each one.
  labelFor: (id: string) => string;
}

// The same card for a bulk action (delete several, deactivate several): one row per id.
export function BulkResultsCard({ results, labelFor, ...rest }: BulkResultsCardProps) {
  return <ImportResultsCard {...rest} results={results.map(r => ({ name: labelFor(r.id), status: r.status, message: r.message }))} />;
}
