import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { TextButton } from '../TextButton';
import { useToast } from '../Toaster';

export interface RipplingFillModalLabels {
  heading: string;
  body: string;
  loading: string;
  loadError: string;
  retry: string;
  nothingMissing: string;
  fill: string;
  filling: string;
  close: string;
  filledToast: (count: number) => string;
  fillError: string;
}

export type RipplingFillFields = Record<string, string>;

export interface RipplingFillModalProps {
  // The fields Rippling has and this record lacks. Each app wires its own endpoint.
  loadFields: () => Promise<RipplingFillFields>;
  // Saves them. Reject (throw) to report a failure.
  onFill: (fields: RipplingFillFields) => Promise<unknown>;
  onClose: () => void;
  // Runs after a successful fill, before the modal closes.
  onFilled?: (fields: RipplingFillFields) => void;
  // The visible name of a field key ("phone" becomes "Phone").
  fieldLabel: (field: string) => string;
  errorMessage?: (err: unknown) => string | null | undefined;
  labels: RipplingFillModalLabels;
}

// Shows only what Rippling knows and this record is missing, and fills it in one
// click. Nothing already on file is ever shown for change.
export function RipplingFillModal({
  loadFields, onFill, onClose, onFilled, fieldLabel, errorMessage, labels: t,
}: RipplingFillModalProps) {
  const { toast } = useToast();
  const [fields, setFields] = useState<RipplingFillFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [filling, setFilling] = useState(false);

  function load() {
    setLoading(true);
    setLoadFailed(false);
    loadFields()
      .then(setFields)
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const entries = fields ? Object.entries(fields) : [];

  async function handleFill() {
    if (!fields || entries.length === 0) return;
    setFilling(true);
    try {
      await onFill(fields);
      toast(t.filledToast(entries.length), 'success');
      onFilled?.(fields);
      onClose();
    } catch (err) {
      toast(errorMessage?.(err) || t.fillError, 'error');
    } finally {
      setFilling(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <div className="p-8">
        <h3 className="mb-2 font-heading text-base font-semibold text-gray-900 dark:text-gray-100">{t.heading}</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t.body}</p>

        <div className="max-h-[50vh] divide-y divide-gray-100 overflow-y-auto dark:divide-white/10">
          {loading && <p className="py-3 text-sm text-gray-400">{t.loading}</p>}
          {loadFailed && (
            <div className="flex items-center justify-between gap-3 py-6">
              <p className="text-sm text-red-500">{t.loadError}</p>
              <TextButton onClick={load}>{t.retry}</TextButton>
            </div>
          )}
          {!loading && !loadFailed && entries.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">{t.nothingMissing}</p>
          )}
          {entries.map(([field, value]) => (
            <div key={field} className="flex items-center justify-between gap-3 py-2.5">
              <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{fieldLabel(field)}</span>
              <span className="truncate text-sm text-gray-800 dark:text-gray-100">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          {entries.length > 0 && (
            <Button className="flex-1 justify-center" onClick={handleFill} disabled={filling}>
              {filling ? t.filling : t.fill}
            </Button>
          )}
          <Button variant="secondary" className={`justify-center ${entries.length > 0 ? 'flex-1' : 'w-full'}`} onClick={onClose}>
            {t.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
