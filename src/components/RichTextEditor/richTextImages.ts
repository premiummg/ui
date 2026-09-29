// Ported from the "operations-migration" (Solman) project's rich-text editor -
// drag-resizable pasted images inside a contentEditable div. Pure DOM code,
// framework-agnostic (no React), so it ports verbatim.

// A raw clipboard screenshot commonly carries full monitor resolution and
// lossless PNG encoding, neither of which is ever needed once the image is
// only ever displayed at editor width (a few hundred px - see
// buildResizableImageNode's defaultWidthPx below). Left uncompressed, a
// single pasted screenshot can balloon one record's stored HTML - and
// therefore the whole list endpoint's payload, since every record's full
// body ships on every list fetch - by megabytes: a real production post
// found during development had ballooned to 2.3MB this way, which was slow
// enough to decode/paint in the editor that saving felt like it had hung.
//
// Every paste is compressed now, no small-file exemption - this used to skip
// anything under 300KB on the theory that a small image isn't worth the
// format/transparency loss, but two "small" (~150-250KB) uncompressed PNGs
// pasted into the same post were still enough, combined, to reproduce the
// exact same hang - the failure mode was never about one single huge image,
// it's the *editor's total payload* that has to stay small.
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function dataUrlFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Downscales and re-encodes every pasted image before it ever becomes part
// of the document, capped to MAX_IMAGE_DIMENSION on its longest side and
// re-encoded as JPEG - a pasted screenshot is an opaque screen capture in
// the overwhelming majority of real pastes, and JPEG's lossy compression is
// what actually gets a multi-megabyte PNG down to a reasonable size; simply
// re-saving as PNG at full resolution barely helps, since the source is
// already PNG-compressed. No small-file exemption (see the note above) - a
// transparent icon/logo does lose its alpha channel here, a real cost, but
// one worth paying to guarantee nothing pasted can reintroduce the hang.
export async function readPastedImage(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrlFromFile(file);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } catch {
    // Decode failed (an exotic format, corrupt clipboard data) - fall back
    // to the original rather than losing the paste entirely.
    return dataUrlFromFile(file);
  }
}

export function syncImageSizeDatasets(containerEl: HTMLElement | null): void {
  const root = containerEl;
  if (!root) return;
  const imgs = Array.from(root.querySelectorAll('img'));
  for (const img of imgs) {
    try {
      const rect = img.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w > 0) img.dataset.w = String(w);
      if (h > 0) img.dataset.h = String(h);
    } catch {
      // ignore
    }
  }
}

export interface ResizeHandleConfig {
  id: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  cursor: string;
  dx: number;
  tx?: string;
  ty?: string;
}

export const RESIZE_HANDLE_CONFIGS: ResizeHandleConfig[] = [
  { id: 'nw', top: '-5px',    left:  '-5px',  cursor: 'nw-resize', dx: -1 },
  { id: 'n',  top: '-5px',    left:  '50%',   cursor: 'n-resize',  dx:  0, tx: '-50%' },
  { id: 'ne', top: '-5px',    right: '-5px',  cursor: 'ne-resize', dx:  1 },
  { id: 'e',  top: '50%',     right: '-5px',  cursor: 'e-resize',  dx:  1, ty: '-50%' },
  { id: 'se', bottom: '-5px', right: '-5px',  cursor: 'se-resize', dx:  1 },
  { id: 's',  bottom: '-5px', left:  '50%',   cursor: 's-resize',  dx:  0, tx: '-50%' },
  { id: 'sw', bottom: '-5px', left:  '-5px',  cursor: 'sw-resize', dx: -1 },
  { id: 'w',  top: '50%',     left:  '-5px',  cursor: 'w-resize',  dx: -1, ty: '-50%' },
];

// Tracks each wrap's mouseenter/mouseleave cleanup out-of-band instead of a
// `wrap._resizeCleanup` expando property, so this stays plain, untyped-DOM-
// hack-free TypeScript - a wrap that never got handles simply has no entry.
const resizeCleanup = new WeakMap<HTMLElement, () => void>();

// `onResizeEnd` defaults to the image-specific dataset sync so every existing
// image call site (attachHandlesToWrap(wrap), no second arg) keeps behaving
// exactly as before; richTextYouTube.ts passes its own callback since a
// video's wrap has no <img> child for syncImageSizeDatasets to find - the
// wrap's own width IS the thing being tracked there.
export function attachHandlesToWrap(wrap: HTMLElement, onResizeEnd: (wrap: HTMLElement) => void = syncImageSizeDatasets): void {
  wrap.querySelectorAll('[data-resize-handle]').forEach((h) => h.remove());
  resizeCleanup.get(wrap)?.();
  resizeCleanup.delete(wrap);
  // If this wrap was mid-hover (border already red) the moment reattachment
  // ran - e.g. useEditableSync resyncing while the mouse still happened to
  // be resting over the image - tearing down the old mouseenter/mouseleave
  // listeners above doesn't touch the border color they'd already set, and
  // the fresh listeners below only fire on the NEXT real enter/leave. Left
  // alone, that stale red border sits there indefinitely until the user
  // happens to hover this exact image again - reset it unconditionally here
  // so every reattachment starts from a known (not-hovering) state.
  wrap.style.borderColor = 'transparent';

  const handleEls = RESIZE_HANDLE_CONFIGS.map((cfg) => {
    const h = document.createElement('div');
    h.dataset.resizeHandle = '1';
    const transforms: string[] = [];
    if (cfg.tx) transforms.push(`translateX(${cfg.tx})`);
    if (cfg.ty) transforms.push(`translateY(${cfg.ty})`);
    h.style.cssText = [
      'position:absolute',
      'width:10px', 'height:10px',
      'background:#fff',
      'border:2px solid #E62027',
      'border-radius:50%',
      'box-shadow:0 1px 4px rgba(0,0,0,0.35)',
      `cursor:${cfg.cursor}`,
      'z-index:20',
      'box-sizing:border-box',
      'opacity:0',
      'transition:opacity 0.12s',
      cfg.top    != null ? `top:${cfg.top}`       : '',
      cfg.bottom != null ? `bottom:${cfg.bottom}` : '',
      cfg.left   != null ? `left:${cfg.left}`     : '',
      cfg.right  != null ? `right:${cfg.right}`   : '',
      transforms.length  ? `transform:${transforms.join(' ')}` : '',
    ].filter(Boolean).join(';');

    h.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = wrap.getBoundingClientRect().width;
      const onMove = (ev: MouseEvent) => {
        const delta = (ev.clientX - startX) * cfg.dx;
        wrap.style.width = `${Math.max(60, startW + delta)}px`;
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        onResizeEnd(wrap);
        // Dragging a handle never fires a real 'input' event on the editor
        // (it's raw DOM mutation via document-level listeners, outside
        // React's event system) - without this, a resize made right before
        // clicking Save/Post with no further typing was silently lost, since
        // nothing had told the editor its content actually changed.
        wrap.closest('[contenteditable="true"]')?.dispatchEvent(new Event('input', { bubbles: true }));
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    wrap.appendChild(h);
    return h;
  });

  const show = () => { handleEls.forEach((h) => { h.style.opacity = '1'; }); wrap.style.borderColor = '#E62027'; };
  const hide = () => { handleEls.forEach((h) => { h.style.opacity = '0'; }); wrap.style.borderColor = 'transparent'; };
  wrap.addEventListener('mouseenter', show);
  wrap.addEventListener('mouseleave', hide);
  resizeCleanup.set(wrap, () => {
    wrap.removeEventListener('mouseenter', show);
    wrap.removeEventListener('mouseleave', hide);
  });
}

// Alignment for pasted images, same left/center/right choice and margin
// mechanics as YouTube embeds (richTextYouTube.ts's youtubeMarginForAlign) -
// stored directly on the wrap's own inline style (`margin`) rather than as a
// `data-align` attribute rebuilt on load, because unlike a YouTube
// placeholder an image wrap's style is real, already-persisted content (it's
// also where the resize width lives) - not disposable editor-only chrome
// that gets stripped before saving and rebuilt from data-* on the next load.
export type ImageAlign = 'left' | 'center' | 'right';
export const IMAGE_ALIGNMENTS: ImageAlign[] = ['left', 'center', 'right'];
const IMAGE_ALIGN_MARGIN: Record<ImageAlign, string> = {
  left: '12px 0',
  center: '12px auto',
  right: '12px 0 12px auto',
};

export function imageMarginForAlign(align?: string | null): string {
  return IMAGE_ALIGN_MARGIN[IMAGE_ALIGNMENTS.includes(align as ImageAlign) ? (align as ImageAlign) : 'left'];
}

function currentImageAlign(wrap: HTMLElement): ImageAlign {
  const margin = wrap.style.margin;
  if (margin === IMAGE_ALIGN_MARGIN.center) return 'center';
  if (margin === IMAGE_ALIGN_MARGIN.right) return 'right';
  return 'left';
}

interface PendingManualDelete {
  wrap: HTMLElement;
  parent: Node;
  nextSibling: Node | null;
}

// One pending manual-delete per editor, for the execCommand fallback below -
// keyed by the editor element itself so unrelated editors on the same page
// (e.g. two RichTextEditor instances in different form fields) never cross
// paths. Cleared as soon as anything else changes the editor's content, so
// pressing Ctrl+Z long after the fact (once the user has kept typing) falls
// through to the browser's own native undo instead of resurrecting a stale
// deletion.
const pendingManualDelete = new WeakMap<HTMLElement, PendingManualDelete>();
const manualUndoBound = new WeakSet<HTMLElement>();

function armManualUndo(editor: HTMLElement, wrap: HTMLElement, parent: Node, nextSibling: Node | null): void {
  pendingManualDelete.set(editor, { wrap, parent, nextSibling });
  if (manualUndoBound.has(editor)) return;
  manualUndoBound.add(editor);
  editor.addEventListener('keydown', (e) => {
    const isUndo = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
    const pending = pendingManualDelete.get(editor);
    if (!isUndo || !pending) return;
    e.preventDefault();
    e.stopPropagation();
    pending.parent.insertBefore(pending.wrap, pending.nextSibling);
    pendingManualDelete.delete(editor);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  });
  // Any *other* edit (typing, another delete, etc.) means this specific
  // deletion is no longer the thing Ctrl+Z should be expected to reverse -
  // the dispatchEvent calls this function's own callers make land here too,
  // which is exactly why it's only ever read (never re-armed) by anything
  // other than a fresh call to armManualUndo itself.
  editor.addEventListener('input', () => {
    const pending = pendingManualDelete.get(editor);
    if (pending && !pending.wrap.isConnected) return; // this is our own delete's input event
    pendingManualDelete.delete(editor);
  });
}

// Removes an atomic wrap (an image or YouTube placeholder) the way a real
// Backspace keypress does, instead of a bare `wrap.remove()` - a raw DOM
// mutation is invisible to the editor's native undo stack (which only
// tracks execCommand/typing-driven edits), so a plain `.remove()` meant
// Ctrl+Z right after clicking the delete button did nothing.
//
// execCommand('delete') with the *node itself* selected (range.selectNode)
// was a no-op - browsers only run their "remove the adjacent uneditable
// sibling" behavior when the caret is COLLAPSED right next to it, the same
// state a real Backspace leaves it in, not when the whole node is the
// selection. Collapsing the range immediately after the wrap and calling
// execCommand('delete') (Backspace's command name) reproduces that, and
// does register as undoable for a plain image.
//
// A video wrap is different: it's followed by an empty trailing
// `<div><br></div>` (see makeYouTubeInserter in RichTextEditor.tsx - it
// exists so there's somewhere to put the caret after a video at the end of
// the body), and execCommand('delete') against it reports success without
// ever actually removing the node - confirmed even looping the call with a
// requestAnimationFrame between each attempt. A real, physical Backspace
// keypress *does* remove it, but only on the second press (the first
// consumes the empty trailing block); since a synthetic/trusted-input
// distinction is exactly what execCommand can't reproduce here, there's no
// native path left to fall back on. When the wrap is still connected after
// giving execCommand a couple of tries, this switches to removing it
// directly and arms a one-shot manual Ctrl+Z (armManualUndo above) instead -
// not a full undo-stack integration, but it directly fixes "Ctrl+Z right
// after clicking delete does nothing" for the one case that matters.
//
// Exported so richTextYouTube.ts's delete button uses the identical fix
// rather than drifting into its own separate (and equally undo-blind)
// wrap.remove().
export function removeWrapUndoably(wrap: HTMLElement): void {
  const editor = wrap.closest<HTMLElement>('[contenteditable="true"]');
  if (!editor) {
    wrap.remove();
    return;
  }

  editor.focus();
  for (let attempt = 0; attempt < 2 && wrap.isConnected; attempt++) {
    const range = document.createRange();
    range.setStartAfter(wrap);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    document.execCommand('delete');
  }

  if (wrap.isConnected) {
    const parent = wrap.parentNode;
    const nextSibling = wrap.nextSibling;
    if (parent) {
      wrap.remove();
      armManualUndo(editor, wrap, parent, nextSibling);
    }
  }

  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

// Delete (×, top-right) and alignment (L/C/R, top-left) controls, both
// hover-revealed - ported directly from richTextYouTube.ts's
// applyYouTubePreview so images and videos behave identically to edit.
// Idempotent (removes any controls it previously added first) so it's safe
// to call both on first insert and every time saved HTML is hydrated back
// into the editor.
function attachImageControls(wrap: HTMLElement): void {
  wrap.querySelectorAll('[data-image-control]').forEach((el) => el.remove());

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.dataset.imageControl = '1';
  deleteBtn.setAttribute('aria-label', 'Remove image');
  deleteBtn.textContent = '×';
  deleteBtn.style.cssText = [
    'position:absolute', 'top:6px', 'right:6px',
    'width:22px', 'height:22px', 'border-radius:50%', 'border:none',
    'background:rgba(0,0,0,0.65)', 'color:#fff', 'font-size:16px',
    'line-height:1', 'display:flex', 'align-items:center', 'justify-content:center',
    'cursor:pointer', 'z-index:20', 'opacity:0', 'transition:opacity 0.12s',
  ].join(';');
  deleteBtn.addEventListener('mousedown', (e) => e.preventDefault());
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeWrapUndoably(wrap);
  });
  wrap.appendChild(deleteBtn);

  const ALIGN_BUTTONS: { key: ImageAlign; label: string; title: string }[] = [
    { key: 'left', label: 'L', title: 'Align left' },
    { key: 'center', label: 'C', title: 'Align center' },
    { key: 'right', label: 'R', title: 'Align right' },
  ];
  const align = currentImageAlign(wrap);
  const alignRow = document.createElement('div');
  alignRow.dataset.imageControl = '1';
  alignRow.style.cssText = 'position:absolute;top:6px;left:6px;display:flex;gap:4px;z-index:20;opacity:0;transition:opacity 0.12s';
  const alignBtnEls = ALIGN_BUTTONS.map(({ key, label, title }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = title;
    btn.textContent = label;
    btn.style.cssText = [
      'width:20px', 'height:20px', 'border-radius:4px', 'border:none',
      'font-size:10px', 'font-weight:700', 'line-height:1', 'color:#fff',
      'display:flex', 'align-items:center', 'justify-content:center', 'cursor:pointer',
      `background:${key === align ? '#E62027' : 'rgba(0,0,0,0.65)'}`,
    ].join(';');
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      wrap.style.margin = imageMarginForAlign(key);
      alignBtnEls.forEach((el, i) => {
        el.style.background = ALIGN_BUTTONS[i].key === key ? '#E62027' : 'rgba(0,0,0,0.65)';
      });
      wrap.closest('[contenteditable="true"]')?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    alignRow.appendChild(btn);
    return btn;
  });
  wrap.appendChild(alignRow);

  wrap.addEventListener('mouseenter', () => { deleteBtn.style.opacity = '1'; alignRow.style.opacity = '1'; });
  wrap.addEventListener('mouseleave', () => { deleteBtn.style.opacity = '0'; alignRow.style.opacity = '0'; });
}

export function reattachResizeHandles(containerEl: HTMLElement | null): void {
  if (!containerEl) return;
  containerEl.querySelectorAll<HTMLElement>('[data-resizable-image]').forEach((wrap) => {
    attachHandlesToWrap(wrap);
    attachImageControls(wrap);
  });
}

export function buildResizableImageNode(
  dataUrl: string,
  { defaultWidthPx = 420 }: { defaultWidthPx?: number } = {},
): { wrap: HTMLDivElement; imgEl: HTMLImageElement } {
  const wrap = document.createElement('div');
  wrap.setAttribute('contenteditable', 'false');
  wrap.dataset.resizableImage = '1';
  wrap.style.cssText = `
    position:relative;display:block;max-width:100%;
    width:${defaultWidthPx}px;margin:${imageMarginForAlign('left')};
    border:2px solid transparent;box-sizing:border-box;
  `;

  const imgEl = document.createElement('img');
  imgEl.src = dataUrl;
  imgEl.draggable = false;
  imgEl.style.cssText = 'width:100%;height:auto;display:block;pointer-events:none;';

  wrap.appendChild(imgEl);
  attachHandlesToWrap(wrap);
  attachImageControls(wrap);

  imgEl.onload = () => {
    imgEl.dataset.nw = String(imgEl.naturalWidth);
    imgEl.dataset.nh = String(imgEl.naturalHeight);
    try {
      const rect = imgEl.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w > 0) imgEl.dataset.w = String(w);
      if (h > 0) imgEl.dataset.h = String(h);
    } catch {
      imgEl.dataset.w = String(imgEl.naturalWidth);
      imgEl.dataset.h = String(imgEl.naturalHeight);
    }
  };

  return { wrap, imgEl };
}

// The 8 resize-handle divs plus the delete/align buttons are only useful
// while actively editing (hover-to-show, drag-to-resize/click-to-delete-or-
// align) - stripped out before the HTML is handed to onChange/onSave so what
// gets persisted to the DB is just the image wrapper, not dead editor-only
// markup. reattachResizeHandles() rebuilds them fresh any time stored HTML
// is loaded back into an editable div.
export function stripResizeHandles(html: string): string {
  if (!html) return html;
  // Runs on every keystroke, so skip the parse+reserialize entirely for the
  // common case of a body with no pasted images in it at all.
  if (!html.includes('data-resize-handle') && !html.includes('data-image-control')) return html;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('[data-resize-handle]').forEach((h) => h.remove());
  tmp.querySelectorAll('[data-image-control]').forEach((h) => h.remove());
  return tmp.innerHTML;
}
