import { useEffect, useId, useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { TextButton } from '../TextButton';
import { useToast } from '../Toaster';
import { Avatar } from '../Avatar';

// Pictures that come from the server are shown only if they are a path of the same site, a small embedded image or an
// https address: nothing else (a script address, another protocol) ever reaches an image.
const SAFE_IMAGE = /^(\/(?!\/)|https:\/\/|data:image\/(png|jpeg|webp|gif);base64,)/;
const safeImage = (src: string | null | undefined): string | null => (src && SAFE_IMAGE.test(src) ? src : null);

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
  // Only needed when a photo can be offered (see RipplingPhotoOffer).
  photo?: string;
  photoDifferentHint?: string;
  photoCurrent?: string;
  photoFromRippling?: string;
  photoKeepCurrent?: string;
  photoUseRippling?: string;
}

export type RipplingFillFields = Record<string, string>;

// The photo of Rippling, when there is one to offer. `new`: the person has none, so it is filled in with the rest.
// `different`: the person has one and it is not the one in Rippling, so the admin is asked which to keep.
export interface RipplingPhotoOffer {
  status: 'new' | 'different';
  // The address of the photo the person has now (for `different`).
  currentUrl?: string | null;
  // The photo of Rippling, as an image that can be shown as it is (a data URL).
  ripplingPreview: string;
}

export interface RipplingFillModalProps {
  // The fields Rippling has and this record lacks. Each app wires its own endpoint. Give this, or loadPreview.
  loadFields?: () => Promise<RipplingFillFields>;
  // The same, together with the photo of Rippling when it has one to offer.
  loadPreview?: () => Promise<{ fields: RipplingFillFields; photo?: RipplingPhotoOffer | null }>;
  // Saves them. Reject (throw) to report a failure.
  onFill: (fields: RipplingFillFields) => Promise<unknown>;
  // Brings the photo of Rippling for the person. Called when the photo is new, or when the admin chose it over the one
  // they have. Reject (throw) to report a failure.
  onUsePhoto?: () => Promise<unknown>;
  onClose: () => void;
  // Runs after a successful fill, before the modal closes.
  onFilled?: (fields: RipplingFillFields) => void;
  // The visible name of a field key ("phone" becomes "Phone").
  fieldLabel: (field: string) => string;
  errorMessage?: (err: unknown) => string | null | undefined;
  labels: RipplingFillModalLabels;
}

// Shows only what Rippling knows and this record is missing, and fills it in one
// click. Nothing already on file is ever shown for change, except a photo that
// differs from the one in Rippling: that is shown next to it, and the admin chooses.
export function RipplingFillModal({
  loadFields, loadPreview, onFill, onUsePhoto, onClose, onFilled, fieldLabel, errorMessage, labels: t,
}: RipplingFillModalProps) {
  const { toast } = useToast();
  const photoId = useId();
  const [fields, setFields] = useState<RipplingFillFields | null>(null);
  const [photo, setPhoto] = useState<RipplingPhotoOffer | null>(null);
  const [useRipplingPhoto, setUseRipplingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [filling, setFilling] = useState(false);

  function load() {
    setLoading(true);
    setLoadFailed(false);
    const request = loadPreview ? loadPreview() : (loadFields ?? (() => Promise.reject(new Error('loadFields or loadPreview is required'))))().then((f) => ({ fields: f, photo: null }));
    request
      .then((result) => {
        setFields(result.fields);
        setPhoto(result.photo ?? null);
        // A photo for somebody with none is filled in with the rest; a different one starts on keeping the current.
        setUseRipplingPhoto(result.photo?.status === 'new');
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const entries = fields ? Object.entries(fields) : [];
  const photoToApply = !!photo && useRipplingPhoto && !!onUsePhoto;
  const nothingToDo = entries.length === 0 && !photoToApply;
  const offersNothing = entries.length === 0 && !photo;

  async function handleFill() {
    if (!fields || nothingToDo) return;
    setFilling(true);
    let fieldsSaved = false;
    try {
      if (entries.length > 0) { await onFill(fields); fieldsSaved = true; }
      if (photoToApply) await onUsePhoto!();
      toast(t.filledToast(entries.length + (photoToApply ? 1 : 0)), 'success');
      onFilled?.(fields);
      onClose();
    } catch (err) {
      // The fields were saved before the photo failed: say so to the page (so it shows them) and stop offering them
      // again, leaving only the photo to try again.
      if (fieldsSaved) {
        onFilled?.(fields);
        setFields({});
      }
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
          {!loading && !loadFailed && offersNothing && (
            <p className="py-6 text-center text-sm text-gray-400">{t.nothingMissing}</p>
          )}
          {entries.map(([field, value]) => (
            <div key={field} className="flex items-center justify-between gap-3 py-2.5">
              <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{fieldLabel(field)}</span>
              <span className="truncate text-sm text-gray-800 dark:text-gray-100">{value}</span>
            </div>
          ))}
          {photo?.status === 'new' && (
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="pmg-eyebrow text-gray-400 dark:text-gray-500">{t.photo ?? 'Photo'}</span>
              <Avatar fullName="" size={40} src={safeImage(photo.ripplingPreview)} />
            </div>
          )}
          {photo?.status === 'different' && (
            <fieldset className="py-3">
              <legend className="pmg-eyebrow mb-1 text-gray-400 dark:text-gray-500">{t.photo ?? 'Photo'}</legend>
              <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{t.photoDifferentHint}</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'keep', label: t.photoKeepCurrent, caption: t.photoCurrent, src: photo.currentUrl ?? null, checked: !useRipplingPhoto },
                  { key: 'rippling', label: t.photoUseRippling, caption: t.photoFromRippling, src: photo.ripplingPreview, checked: useRipplingPhoto },
                ] as const).map((option) => (
                  <div
                    key={option.key}
                    onClick={() => setUseRipplingPhoto(option.key === 'rippling')}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                      option.checked ? 'border-(--premium-red) bg-red-50/50 dark:bg-white/5' : 'border-gray-200 dark:border-white/10'
                    }`}
                  >
                    <Avatar fullName="" size={72} src={safeImage(option.src)} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{option.caption}</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-100">
                      <input
                        id={`${photoId}-${option.key}`}
                        type="radio"
                        name="rippling-photo-choice"
                        checked={option.checked}
                        onChange={() => setUseRipplingPhoto(option.key === 'rippling')}
                      />
                      <label htmlFor={`${photoId}-${option.key}`} className="cursor-pointer">{option.label}</label>
                    </span>
                  </div>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {!nothingToDo && (
            <Button className="flex-1 justify-center" onClick={handleFill} disabled={filling}>
              {filling ? t.filling : t.fill}
            </Button>
          )}
          <Button variant="secondary" className={`justify-center ${!nothingToDo ? 'flex-1' : 'w-full'}`} onClick={onClose}>
            {t.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
