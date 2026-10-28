import { useEffect, useMemo, useRef, useState } from 'react';
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
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const [broken, setBroken] = useState(false);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-white/20 dark:bg-black/30">
      {broken ? (
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
    const images = Array.from(picked).filter((f) => f.type.startsWith('image/'));
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
      <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={(e) => handlePick(e.target.files)} />
      {error && <FieldError className={`mt-1 text-xs ${compact ? 'w-full' : ''}`} message={error} />}
    </div>
  );
}

function AttachmentImage({ attachment, getUrl }: { attachment: ChatAttachment; getUrl: (id: string) => Promise<string> }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getUrl(attachment.id).then((u) => !cancelled && setUrl(u)).catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment.id]);

  if (failed) {
    return <span className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500 dark:border-white/20 dark:text-gray-400">{attachment.name}</span>;
  }
  if (!url) return <span className="block h-24 w-24 animate-pulse rounded-lg bg-gray-200/70 dark:bg-white/10" aria-hidden />;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={url}
        alt={attachment.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-h-48 max-w-full rounded-lg border border-black/10 object-cover dark:border-white/20"
      />
    </a>
  );
}

// The images that came with a message, fetched one by one as they scroll into
// the page: the URLs are short-lived and signed, so they are asked for on
// demand rather than carried in the message list.
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
