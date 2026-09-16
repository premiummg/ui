import { useRef, useState } from 'react';
import { FiUpload } from 'react-icons/fi';

export interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  // A comma-separated list of extensions (`.pdf`), MIME types
  // (`application/pdf`), or MIME wildcards (`image/*`) - same syntax as the
  // native `<input accept>`. Unlike the native attribute (which only limits
  // what the OS file-picker dialog shows, and does nothing at all for a
  // dropped file), this is actually enforced on both the click-to-browse and
  // drag-and-drop paths.
  accept?: string;
  multiple?: boolean;
  // Files over this size are dropped from the onFiles call and named in an
  // inline error instead of being silently handed to the caller.
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  className?: string;
}

// Mirrors the native `accept` attribute's own matching rules (extension,
// exact MIME type, or a `type/*` wildcard) so a caller can rely on this
// component actually filtering to the types it advertises, not just hinting
// them to the OS's own file-picker dialog.
function matchesAccept(file: File, accept: string): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return accept
    .split(',')
    .map(p => p.trim().toLowerCase())
    .filter(Boolean)
    .some(pattern => {
      if (pattern.startsWith('.')) return name.endsWith(pattern);
      if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
      return type === pattern;
    });
}

// A drag-or-click file picker - both paths (drop and the native file input
// opened by clicking anywhere in the zone) feed the same onFiles callback,
// so a caller never needs to branch on how the file arrived.
export function FileDropzone({
  onFiles, accept, multiple = true, maxSizeMB,
  label = 'Drag a file here, or click to browse',
  hint = 'PDF, Word, Excel, PowerPoint, images…',
  className = '',
}: FileDropzoneProps) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileList(list: FileList | null) {
    if (!list || !list.length) return;
    const picked = multiple ? Array.from(list) : Array.from(list).slice(0, 1);

    const wrongType = accept ? picked.filter(f => !matchesAccept(f, accept)) : [];
    const maxBytes = maxSizeMB ? maxSizeMB * 1024 * 1024 : null;
    const tooBig = maxBytes ? picked.filter(f => !wrongType.includes(f) && f.size > maxBytes) : [];
    const accepted = picked.filter(f => !wrongType.includes(f) && !tooBig.includes(f));

    const errors: string[] = [];
    if (wrongType.length) {
      errors.push(`${wrongType.map(f => f.name).join(', ')} ${wrongType.length === 1 ? "isn't" : "aren't"} an accepted file type`);
    }
    if (tooBig.length) {
      errors.push(`${tooBig.map(f => f.name).join(', ')} exceed${tooBig.length === 1 ? 's' : ''} the ${maxSizeMB}MB limit`);
    }
    setError(errors.length ? errors.join('; ') : null);
    if (accepted.length) onFiles(accepted);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); handleFileList(e.dataTransfer.files); }}
      className={`rounded-xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
        over
          ? 'border-(--premium-red) bg-(--premium-red-light)'
          : 'border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30'
      } ${className}`}
    >
      <FiUpload size={20} className={`mx-auto mb-2 ${over ? 'text-(--premium-red)' : 'text-gray-400'}`} />
      <p className={`text-sm font-medium ${over ? 'text-(--premium-red)' : 'text-gray-600 dark:text-gray-300'}`}>
        {label}
      </p>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-(--premium-red) mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={e => { handleFileList(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
