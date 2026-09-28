// YouTube embeds for RichTextEditor.
//
// Deliberately NOT stored as an <iframe>. What goes in the database is only
// `<div data-youtube="VIDEO_ID"></div>`, and the real iframe is built at render
// time from an id that has been re-validated against YOUTUBE_ID_RE. That way
// the sanitizers never have to allow <iframe> at all: even a request crafted
// straight against the API (an allow-listed author can do that) cannot store
// markup that embeds an arbitrary external page inside the intranet.
//
// In the editor the same placeholder is "hydrated" into a thumbnail preview
// card so the author can see which video they added - that chrome is rebuilt
// on load and stripped again before saving, exactly like the resize handles in
// richTextImages.ts.

import { attachHandlesToWrap, removeWrapUndoably } from './richTextImages';

export const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set(['youtube.com', 'youtube-nocookie.com', 'youtu.be']);

export type YouTubeAlign = 'left' | 'center' | 'right';

// Size and alignment are stored on the placeholder itself (data-w / data-align
// - both already sanitizer-allowed, see richTextSanitize.ts/sanitizeHtml.js) so
// a choice made while editing survives to the published page. Exported so the
// editor's hydrate step and RichTextContent's renderRichTextHtml agree on the
// exact same defaults/clamping instead of drifting apart.
export const YOUTUBE_ALIGNMENTS: YouTubeAlign[] = ['left', 'center', 'right'];
const DEFAULT_WIDTH_PX = 400;
const MIN_WIDTH_PX = 200;

const ALIGN_MARGIN: Record<YouTubeAlign, string> = {
  left: '12px 0',
  center: '12px auto',
  right: '12px 0 12px auto',
};

export function youtubeMarginForAlign(align?: string | null): string {
  return ALIGN_MARGIN[YOUTUBE_ALIGNMENTS.includes(align as YouTubeAlign) ? (align as YouTubeAlign) : 'left'];
}

export function clampYoutubeWidth(width: string | number | null | undefined): number {
  const n = typeof width === 'number' ? width : parseInt(width ?? '', 10);
  return Math.max(MIN_WIDTH_PX, Number.isFinite(n) ? n : DEFAULT_WIDTH_PX);
}

// Accepts anything a user is realistically going to paste: a full watch URL, a
// youtu.be short link, an /embed//shorts//live/ URL, any of those carrying
// extra query params (&t=, ?si=), or a bare 11-character id.
export function parseYouTubeId(input?: string | null): string | null {
  const raw = (input || '').trim();
  if (!raw) return null;
  if (YOUTUBE_ID_RE.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(?:www|m)\./i, '').toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && YOUTUBE_ID_RE.test(id) ? id : null;
  }

  const v = url.searchParams.get('v');
  if (v && YOUTUBE_ID_RE.test(v)) return v;

  const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

// youtube-nocookie.com is YouTube's own privacy-preserving embed domain - it
// doesn't set tracking cookies until the viewer actually presses play, which
// matters more here than usual since these pages are read by the whole company.
export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// The preview shown inside the editor. Not what gets saved (see
// stripYouTubePreviews) so it doesn't need to survive sanitization - it only
// has to be obviously a video, and obviously deletable/resizable/alignable.
function applyYouTubePreview(wrap: HTMLDivElement): void {
  const videoId = wrap.dataset.youtube;
  const width = clampYoutubeWidth(wrap.dataset.w);
  const align = YOUTUBE_ALIGNMENTS.includes(wrap.dataset.align as YouTubeAlign)
    ? (wrap.dataset.align as YouTubeAlign)
    : 'left';
  // Normalize back onto the wrap so a value that only ever existed as a JS
  // default (first insert) still gets serialized into the saved placeholder,
  // and so the published-page renderer (renderRichTextHtml) sees the same
  // resolved value this preview is actually showing.
  wrap.dataset.w = String(width);
  wrap.dataset.align = align;

  wrap.setAttribute('contenteditable', 'false');
  // max-width:100% is what keeps a wide choice from overflowing the ~260px
  // tall compact editor's narrower moments - the width itself is real and
  // consistent everywhere (compact box, full editor, published page), same
  // as how pasted images already work.
  wrap.style.cssText = [
    'position:relative', 'display:block', `width:${width}px`, 'max-width:100%',
    `margin:${youtubeMarginForAlign(align)}`, 'border-radius:8px', 'overflow:hidden',
    'background:#000', 'aspect-ratio:16/9', 'cursor:default', 'user-select:none',
    'border:2px solid transparent', 'box-sizing:border-box',
  ].join(';');

  wrap.innerHTML = '';

  const thumb = document.createElement('img');
  thumb.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  thumb.alt = 'YouTube video';
  thumb.draggable = false;
  thumb.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;opacity:0.85';
  wrap.appendChild(thumb);

  const badge = document.createElement('div');
  badge.style.cssText = [
    'position:absolute', 'top:50%', 'left:50%', 'transform:translate(-50%,-50%)',
    'width:60px', 'height:42px', 'border-radius:10px', 'background:#E62027',
    'display:flex', 'align-items:center', 'justify-content:center',
    'pointer-events:none', 'box-shadow:0 2px 8px rgba(0,0,0,0.4)',
  ].join(';');
  badge.innerHTML = '<div style="width:0;height:0;border-left:16px solid #fff;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px"></div>';
  wrap.appendChild(badge);

  const caption = document.createElement('div');
  caption.textContent = 'YouTube video (plays on the published page)';
  caption.style.cssText = [
    'position:absolute', 'left:0', 'right:0', 'bottom:0',
    'padding:4px 8px', 'font-size:11px', 'color:#fff',
    'background:rgba(0,0,0,0.55)', 'pointer-events:none',
  ].join(';');
  wrap.appendChild(caption);

  // Same hover-to-reveal treatment as the image resize handles in
  // richTextImages.ts, for a consistent "editor-only chrome" feel.
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.setAttribute('aria-label', 'Remove video');
  deleteBtn.textContent = '×';
  deleteBtn.style.cssText = [
    'position:absolute', 'top:6px', 'right:6px',
    'width:22px', 'height:22px', 'border-radius:50%', 'border:none',
    'background:rgba(0,0,0,0.65)', 'color:#fff', 'font-size:16px',
    'line-height:1', 'display:flex', 'align-items:center', 'justify-content:center',
    'cursor:pointer', 'z-index:20', 'opacity:0', 'transition:opacity 0.12s',
  ].join(';');
  deleteBtn.addEventListener('mousedown', (e) => e.preventDefault()); // don't steal focus/selection
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Routes through execCommand('delete') (see richTextImages.ts's
    // removeWrapUndoably) instead of a bare wrap.remove(), so Ctrl+Z right
    // after clicking this actually restores the video - a raw DOM removal
    // is invisible to the editor's native undo stack.
    removeWrapUndoably(wrap);
  });
  wrap.appendChild(deleteBtn);

  // Alignment row - top-left, mirroring the delete button's top-right
  // hover-reveal. Sets the wrap's own margin directly (left/right auto)
  // rather than routing through execCommand('justifyLeft'/...): the video
  // wrap is a contenteditable="false" atomic block, and execCommand's
  // justify* commands operate on "the block containing the current
  // selection" - a click that lands on this button never puts a text caret
  // inside an uneditable node, so there's no reliable selection for
  // execCommand to act on here the way there is for the text-alignment
  // buttons in RichTextToolbar.tsx.
  const ALIGN_BUTTONS: { key: YouTubeAlign; label: string; title: string }[] = [
    { key: 'left', label: 'L', title: 'Align left' },
    { key: 'center', label: 'C', title: 'Align center' },
    { key: 'right', label: 'R', title: 'Align right' },
  ];
  const alignRow = document.createElement('div');
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
      wrap.dataset.align = key;
      wrap.style.margin = youtubeMarginForAlign(key);
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

  // Drag-to-resize, reusing the exact mechanic pasted images use - only the
  // "what to remember afterwards" callback differs, since there's no <img>
  // child here for syncImageSizeDatasets to measure; the wrap's own width IS
  // the value being tracked.
  attachHandlesToWrap(wrap, (w) => {
    w.dataset.w = String(clampYoutubeWidth(w.getBoundingClientRect().width));
  });
}

export function buildYouTubeNode(videoId: string): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.dataset.youtube = videoId;
  applyYouTubePreview(wrap);
  return wrap;
}

// Rebuilds the preview chrome for every placeholder in an editor - needed any
// time innerHTML is assigned, since what is loaded back is the bare
// `<div data-youtube="...">` that was saved.
export function hydrateYouTubeNodes(containerEl: HTMLElement | null): void {
  if (!containerEl) return;
  containerEl.querySelectorAll<HTMLDivElement>('[data-youtube]').forEach((wrap) => {
    if (YOUTUBE_ID_RE.test(wrap.dataset.youtube || '')) applyYouTubePreview(wrap);
    else wrap.remove();
  });
}

// Inverse of hydrate: collapses each preview back down to the bare placeholder
// so the thumbnail markup never reaches the database - only `data-youtube`,
// `data-w` and `data-align` survive (the chosen size/alignment), everything
// else about the preview (style, contenteditable, thumbnail/badge/caption/
// controls) is rebuilt from scratch by hydrateYouTubeNodes next time this
// loads into an editor.
export function stripYouTubePreviews(html: string): string {
  if (!html || !html.includes('data-youtube')) return html;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll<HTMLDivElement>('[data-youtube]').forEach((wrap) => {
    const videoId = wrap.dataset.youtube || '';
    if (!YOUTUBE_ID_RE.test(videoId)) {
      wrap.remove();
      return;
    }
    wrap.removeAttribute('style');
    wrap.removeAttribute('contenteditable');
    wrap.innerHTML = '';
  });
  return tmp.innerHTML;
}
