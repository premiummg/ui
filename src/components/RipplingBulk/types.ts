// Shapes the Rippling bulk dialogs exchange with the app that hosts them. Codes
// (match reasons, skip codes, worker statuses) are plain strings: each app owns
// the labels for the ones its backend sends, through `labels`.

export interface RipplingBulkSuggestion {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  // A stale value the link would overwrite (an old id that is no Rippling worker).
  previous_rippling_id: string | null;
  worker_id: string;
  worker_name: string;
  worker_email: string;
  worker_title: string | null;
  worker_status: string | null;
  confidence: 'high' | 'possible';
  // Why the pair matched (several can apply, e.g. a similar name and the same phone).
  reasons: string[];
}

export interface RipplingBulkSuggestions {
  suggestions: RipplingBulkSuggestion[];
  unmatched: { employee_id: string; employee_name: string; employee_email: string }[];
  unlinked_workers: number;
  // Ids of the Rippling workers nobody is linked to yet.
  free_worker_ids: string[];
}

export interface RipplingBulkLinkResult {
  linked: { employee_id: string; worker_id: string }[];
  skipped: { employee_id: string; code: string }[];
}

export interface RipplingBulkFillRow {
  employee_id: string;
  employee_name: string;
  fields: Record<string, string>;
}

export interface RipplingBulkFillPreview {
  rows: RipplingBulkFillRow[];
  // Linked employees whose Rippling profile could not be read this time.
  failed: number;
  // Linked employees in total, and how many the per-request cap left out.
  total: number;
  truncated: number;
}

export interface RipplingBulkFillResult {
  filled: { employee_id: string; employee_name: string; fields: string[] }[];
  skipped: { employee_id: string; code: string }[];
}

export interface RipplingImportCandidate {
  worker_id: string;
  name: string;
  email: string;
  title: string | null;
  status: string | null;
  start_date: string | null;
}

export interface RipplingImportCandidates {
  candidates: RipplingImportCandidate[];
  // Eligible workers in total, and how many the per-request cap left out.
  total_eligible: number;
  truncated: number;
  // Why other free workers are not offered.
  skipped_no_email: number;
  skipped_known_email: number;
  skipped_identity_account: number;
  skipped_terminated: number;
  skipped_likely_match: number;
}

export interface RipplingImportOutcome {
  worker_id: string;
  name: string;
  status: 'created' | 'skipped' | 'failed';
  employee_id?: string;
  email?: string;
  temporary_password?: string;
  code?: string;
  message?: string;
}
