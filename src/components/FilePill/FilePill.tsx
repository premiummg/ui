import { FiFileText, FiX } from 'react-icons/fi';

export interface FilePillProps {
  name: string;
  onRemove: () => void;
  className?: string;
}

// A picked-but-not-yet-uploaded file, shown in a list under a FileDropzone -
// name plus a remove control, nothing else (no size/preview - that's
// AttachmentTile's job, for a file that's actually been uploaded).
export function FilePill({ name, onRemove, className = '' }: FilePillProps) {
  return (
    <div className={`flex items-center justify-between gap-2 rounded-lg border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-(--premium-steel-grey) px-3 py-2 text-xs ${className}`}>
      <span className="flex items-center gap-1.5 truncate text-gray-600 dark:text-gray-300">
        <FiFileText size={13} className="shrink-0 text-gray-400" /> {name}
      </span>
      <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="shrink-0 text-gray-400 hover:text-(--premium-red) transition">
        <FiX size={13} />
      </button>
    </div>
  );
}
