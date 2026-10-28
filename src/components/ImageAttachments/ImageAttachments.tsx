import { useCallback, useEffect, useRef, useState } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import { FieldError } from '../FieldError';
import type { ChatAttachment } from '../ConversationThread/types';

export const DEFAULT_MAX_IMAGES = 5;
export const DEFAULT_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export interface ImageAttachmentPickerStrings {
  // Visible text on the button, e.g. "Add images".
  addLabel: string;
  removeLabel: string;
  tooLargeLabel: string;
  tooManyLabel: string;
  // Shown when a picked file is not one of the formats the server accepts.
  unsupportedLabel: string;
}

// The formats a message can carry, with the extensions some browsers report no type for.
const TYPE_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heic',
};
const ACCEPTED_TYPES = new Set(Object.values(TYPE_BY_EXT));
const ACCEPT_ATTRIBUTE = [...ACCEPTED_TYPES, '.heic', '.heif'].join(',');

// The type the server will see for this file, or null when it cannot be sent.
function acceptedType(file: File): string | null {
  const type = file.type.toLowerCase();
  if (type === 'image/heif') return 'image/heic';
  if (ACCEPTED_TYPES.has(type)) return type;
  // Windows and Chrome often report no type at all for HEIC.
  if (!type) return TYPE_BY_EXT[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? null;
  return null;
}

export interface ImageAttachmentPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  strings: ImageAttachmentPickerStrings;
  maxFiles?: number;
  maxBytes?: number;
  disabled?: boolean;
  // `compact` renders just an icon button (for a chat composer); otherwise a
  // text button, for forms.
  compact?: boolean;
  className?: string;
}

function Preview({ file, onRemove, removeLabel }: { file: File; onRemove: () => void; removeLabel: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    const made = URL.createObjectURL(file);
    setUrl(made);
    return () => URL.revokeObjectURL(made);
  }, [file]);
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-white/20 dark:bg-black/30">
      {broken || !url ? (
        // Some formats (HEIC outside Safari) cannot be previewed; the file still uploads.
        <span className="flex h-full w-full items-center justify-center p-1 text-center text-[10px] break-all text-gray-500 dark:text-gray-400">{file.name}</span>
      ) : (
        <img src={url} alt={file.name} className="h-full w-full object-cover" onError={() => setBroken(true)} />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${file.name}`}
        className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <FiX size={12} />
      </button>
    </div>
  );
}

// Picks images to send along with a message. Nothing is uploaded here: the
// caller sends the File[] with the message itself.
export function ImageAttachmentPicker({
  files,
  onChange,
  strings,
  maxFiles = DEFAULT_MAX_IMAGES,
  maxBytes = DEFAULT_MAX_IMAGE_BYTES,
  disabled = false,
  compact = false,
  className = '',
}: ImageAttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  function handlePick(picked: FileList | null) {
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    if (!picked || !picked.length) return;
    const all = Array.from(picked);
    // A file with a missing type is handed over with the one its extension says.
    const images = all
      .map((f) => {
        const type = acceptedType(f);
        return type && type !== f.type ? new File([f], f.name, { type, lastModified: f.lastModified }) : f;
      })
      .filter((f) => acceptedType(f));
    if (images.length < all.length) setError(strings.unsupportedLabel);
    const fits = images.filter((f) => f.size <= maxBytes);
    if (fits.length < images.length) setError(strings.tooLargeLabel);
    const room = maxFiles - files.length;
    if (fits.length > room) setError(strings.tooManyLabel);
    const accepted = fits.slice(0, Math.max(room, 0));
    if (accepted.length) onChange([...files, ...accepted]);
  }

  const full = files.length >= maxFiles;

  return (
    <div className={className}>
      {files.length > 0 && (
        <div className={`mb-2 flex flex-wrap gap-2 ${compact ? 'w-full' : ''}`}>
          {files.map((file, i) => (
            <Preview
              key={`${file.name}-${file.lastModified}-${i}`}
              file={file}
              removeLabel={strings.removeLabel}
              onRemove={() => onChange(files.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        disabled={disabled || full}
        onClick={() => inputRef.current?.click()}
        aria-label={compact ? strings.addLabel : undefined}
        title={compact ? strings.addLabel : undefined}
        className={
          compact
            ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:text-(--premium-red) disabled:opacity-30 dark:text-gray-400'
            : 'flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 transition hover:border-(--premium-red) hover:text-(--premium-red) disabled:opacity-40 dark:border-white/20 dark:text-gray-400'
        }
      >
        <FiImage size={compact ? 16 : 14} />
        {!compact && strings.addLabel}
      </button>
      <input ref={inputRef} type="file" accept={ACCEPT_ATTRIBUTE} multiple className="sr-only" tabIndex={-1} onChange={(e) => handlePick(e.target.files)} />
      {error && <FieldError scope="form" className={`mt-1 text-xs ${compact ? 'w-full' : ''}`} message={error} />}
    </div>
  );
}

// A signed URL is good for a few minutes, so the one in hand is refreshed once it is older than this.
const URL_MAX_AGE_MS = 4 * 60 * 1000;
const isBlobUrl = (href: string) => href.startsWith('blob:');

function AttachmentImage({ attachment, getUrl }: { attachment: ChatAttachment; getUrl: (id: string) => Promise<string> }) {
  const holder = useRef<HTMLSpanElement>(null);
  // Without IntersectionObserver (old browsers, tests) the image is simply loaded.
  const [visible, setVisible] = useState(typeof IntersectionObserver === 'undefined');
  const [current, setCurrent] = useState<{ href: string; at: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const retried = useRef(false);
  const live = useRef<string | null>(null);

  // The URL is only asked for once the image is near the screen.
  useEffect(() => {
    if (visible || !holder.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(holder.current);
    return () => observer.disconnect();
  }, [visible]);

  const load = useCallback(async () => {
    const href = await getUrl(attachment.id);
    // An object URL the page made must be released once it is replaced or gone.
    if (live.current && isBlobUrl(live.current)) URL.revokeObjectURL(live.current);
    live.current = href;
    setCurrent({ href, at: Date.now() });
    return href;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment.id]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    load().catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (live.current && isBlobUrl(live.current)) URL.revokeObjectURL(live.current);
      live.current = null;
    };
  }, [visible, load]);

  function openFull(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!current || isBlobUrl(current.href) || Date.now() - current.at < URL_MAX_AGE_MS) return;
    e.preventDefault();
    load().then((href) => window.open(href, '_blank', 'noopener,noreferrer')).catch(() => setFailed(true));
  }

  function onImageError() {
    // One retry covers a URL that expired while the image was waiting to load.
    if (retried.current) return setFailed(true);
    retried.current = true;
    load().catch(() => setFailed(true));
  }

  if (failed) {
    return <span className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500 dark:border-white/20 dark:text-gray-400">{attachment.name}</span>;
  }
  return (
    <span ref={holder} className="inline-block max-w-full">
      {!current ? (
        <span className="block h-24 w-24 animate-pulse rounded-lg bg-gray-200/70 dark:bg-white/10" aria-hidden />
      ) : (
        <a href={current.href} target="_blank" rel="noopener noreferrer" onClick={openFull} className="block">
          <img
            src={current.href}
            alt={attachment.name}
            loading="lazy"
            onError={onImageError}
            className="max-h-48 max-w-full rounded-lg border border-black/10 object-cover dark:border-white/20"
          />
        </a>
      )}
    </span>
  );
}

// The images that came with a message. Each one asks for its URL only when it
// is about to be seen: the URLs are short-lived and signed, so they are not
// carried in the message list.
export function AttachmentImages({
  attachments,
  getUrl,
  className = '',
}: {
  attachments: ChatAttachment[] | undefined;
  getUrl: ((id: string) => Promise<string>) | undefined;
  className?: string;
}) {
  if (!attachments?.length || !getUrl) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {attachments.map((a) => (
        <AttachmentImage key={a.id} attachment={a} getUrl={getUrl} />
      ))}
    </div>
  );
}
