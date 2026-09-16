import { useState } from 'react';
import { FiChevronDown, FiFileText, FiDownload, FiImage } from 'react-icons/fi';

export type AttachmentTileType = 'pdf' | 'image' | 'other';

export interface AttachmentTileProps {
  name: string;
  size: string;
  type: AttachmentTileType;
  // A real, already-resolved URL to show as the preview (an <img src>) -
  // omit it and the tile falls back to a placeholder body (a generic image
  // icon for 'image', a mock document silhouette for 'pdf'). A real PDF
  // render needs a viewer library this package deliberately doesn't bundle;
  // pass previewUrl for images, or render your own viewer as `children`
  // instead of relying on the 'pdf' placeholder.
  previewUrl?: string;
  onDownload?: () => void;
  className?: string;
}

// A collapsible row for one uploaded file - name/size, a download action,
// and (expanded, the default) a preview body. Not a full attachment
// gallery/uploader on its own; FileDropzone + FilePill cover picking files
// before they're uploaded, this covers showing one that already has been.
export function AttachmentTile({ name, size, type, previewUrl, onDownload, className = '' }: AttachmentTileProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={`rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-(--premium-dark-grey) overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 pl-3 pr-2 py-2.5">
        <button type="button" onClick={() => setExpanded(v => !v)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <FiChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${expanded ? '' : '-rotate-90'}`} />
          <div className="w-8 h-8 shrink-0 rounded-lg grid place-items-center bg-(--premium-red-light)">
            <FiFileText size={14} className="text-(--premium-red)" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{name}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{size}</p>
          </div>
        </button>
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            title="Download"
            className="shrink-0 w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-(--premium-red) hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            <FiDownload size={14} />
          </button>
        )}
      </div>
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/10">
          {type === 'image' && (
            previewUrl ? (
              <img src={previewUrl} alt={name} className="w-full max-h-64 object-contain bg-gray-50 dark:bg-black/30" />
            ) : (
              <div className="h-40 w-full grid place-items-center bg-gray-50 dark:bg-black/30">
                <FiImage size={26} className="text-gray-300 dark:text-gray-600" />
              </div>
            )
          )}
          {type === 'pdf' && (
            <div className="h-40 w-full flex items-center justify-center bg-gray-50 dark:bg-black/30 p-4">
              <div className="h-full w-28 shrink-0 rounded bg-white dark:bg-(--premium-steel-grey) shadow-sm p-2.5 space-y-1.5">
                <div className="h-1 w-3/4 rounded-full bg-gray-200 dark:bg-white/15" />
                <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-white/15" />
                <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-white/15" />
                <div className="h-1 w-2/3 rounded-full bg-gray-200 dark:bg-white/15" />
              </div>
            </div>
          )}
          {type === 'other' && (
            <p className="px-3 py-4 text-xs text-gray-400 dark:text-gray-500">No preview available for this file type.</p>
          )}
        </div>
      )}
    </div>
  );
}
