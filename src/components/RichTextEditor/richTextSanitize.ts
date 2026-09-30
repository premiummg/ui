import DOMPurify from 'dompurify';
import { YOUTUBE_ID_RE, YOUTUBE_ALIGNMENTS, youTubeEmbedUrl, clampYoutubeWidth, youtubeMarginForAlign } from './richTextYouTube';

// News/Knowledge Base/Documents bodies and Event descriptions are authored as
// HTML by RichTextEditor (see RichTextEditor.tsx) and stored as HTML, so every
// read path has to sanitize before it reaches dangerouslySetInnerHTML. Each
// consuming app's own backend should sanitize on write too (mirroring this
// same allow-list) - this is the second of the two layers, and the one that
// also covers rows written before that backend guard existed.

// Everything document.execCommand can emit: <font size|color> (Chrome's
// fontSize/foreColor), <span style> (Firefox's), plus the resizable-image
// wrapper divs RichTextEditor builds for pasted screenshots.
const DISPLAY_ALLOWED_TAGS = [
  'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span', 'font', 'p', 'div', 'br',
  'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img',
];

const DISPLAY_ALLOWED_ATTR = [
  'style', 'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
  'size', 'color', 'face', 'align', 'contenteditable', 'draggable',
  'data-resizable-image', 'data-w', 'data-h', 'data-nw', 'data-nh',
  // Only ever a validated 11-char video id (see the hook below) - never an
  // <iframe>, which stays banned. renderRichTextHtml turns it into the real
  // embed at render time. data-align is the chosen left/center/right, also
  // validated below; data-w (shared with the image attributes above) holds
  // the chosen pixel width.
  'data-youtube', 'data-align',
];

// Pasted images are handled separately (clipboard image items -> a real
// resizable <img> node), so <img> is deliberately excluded here - pasting
// arbitrary HTML must never be able to smuggle in an <img src>/onerror.
const PASTE_ALLOWED_TAGS = DISPLAY_ALLOWED_TAGS.filter((t) => t !== 'img');
const PASTE_ALLOWED_ATTR = ['style', 'href', 'target', 'rel', 'size', 'color', 'face', 'align'];

// DOMPurify kills scripts, event handlers and javascript: URLs on its own, but
// leaves the contents of a style attribute essentially untouched. None of
// these are script execution in a modern browser, but they are still worth
// dropping: url() would let a stored post beacon every reader's IP to an
// external host, and position:fixed would let one cover the whole page. A
// consuming app's own server-side sanitizer should mirror this identical hook.
const UNSAFE_CSS = /expression\s*\(|url\s*\(|@import|behavior\s*:|position\s*:\s*(?:fixed|absolute|sticky)/i;

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (typeof node.getAttribute !== 'function') return;

  // A data-youtube value is about to be interpolated into an embed URL, so it
  // has to be exactly a video id and nothing else.
  if (node.hasAttribute('data-youtube') && !YOUTUBE_ID_RE.test(node.getAttribute('data-youtube') || '')) {
    node.removeAttribute('data-youtube');
  }
  if (node.hasAttribute('data-align') && !YOUTUBE_ALIGNMENTS.includes(node.getAttribute('data-align') as never)) {
    node.removeAttribute('data-align');
  }

  if (!node.hasAttribute('style')) return;
  const cleaned = String(node.getAttribute('style'))
    .split(';')
    .map((decl) => decl.trim())
    .filter((decl) => decl && !UNSAFE_CSS.test(decl))
    .join('; ');
  if (cleaned) node.setAttribute('style', cleaned);
  else node.removeAttribute('style');
});

export function sanitizeRichText(html?: string | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: DISPLAY_ALLOWED_TAGS,
    ALLOWED_ATTR: DISPLAY_ALLOWED_ATTR,
    ADD_ATTR: ['target'],
  });
}

export function sanitizePastedHtml(html?: string | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: PASTE_ALLOWED_TAGS,
    ALLOWED_ATTR: PASTE_ALLOWED_ATTR,
  });
}

// A literal black or white pick from RichTextToolbar's fixed Text color
// swatches (see WORD_TEXT_COLORS - #000000/#ffffff are the only two extreme
// values it can ever produce, whether Chrome serializes execCommand's output
// as <font color> or <span style>) reads fine against whatever background it
// was authored on, but has no readable form once the *viewer's* theme
// differs: black is invisible on a dark background, white on a light one.
// Both collapse to the SAME theme-adaptive replacement - there's no need to
// tell "was black" and "was white" apart, since the target behavior (dark
// ink in light mode, light ink in dark mode) is identical either way.
// Setting a probe element's style.color and reading it back is how the
// browser itself normalizes any valid CSS color (#000, black, rgb(0,0,0), a
// <font color> attribute value, ...) into a comparable "rgb(r, g, b)" string,
// without hand-rolling every syntax execCommand or a pasted style might use.
let inkProbe: HTMLSpanElement | null = null;
function resolvesToExtremeInk(value: string): boolean {
  if (!inkProbe) inkProbe = document.createElement('span');
  inkProbe.style.color = '';
  inkProbe.style.color = value;
  const resolved = inkProbe.style.color;
  return resolved === 'rgb(0, 0, 0)' || resolved === 'rgb(255, 255, 255)';
}

// Rewrites a literal black/white color (attribute or inline style) into the
// theme-adaptive `rte-auto-ink` class (see the package's styles.css) instead
// - applied both at render time (RichTextContent, below) and live inside the
// editor itself (RichTextEditor.tsx), so already-authored content adapts to
// whichever theme it's currently being viewed/edited in either way.
export function normalizeAutoInkColors(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>('font[color], [style*="color"]').forEach((el) => {
    const attrColor = el.getAttribute('color');
    if (attrColor && resolvesToExtremeInk(attrColor)) {
      el.removeAttribute('color');
      el.classList.add('rte-auto-ink');
    }
    if (el.style.color && resolvesToExtremeInk(el.style.color)) {
      el.style.removeProperty('color');
      el.classList.add('rte-auto-ink');
      if (el.getAttribute('style') === '') el.removeAttribute('style');
    }
  });
}

// What RichTextContent actually renders. Sanitizing FIRST (which strips every
// <iframe> unconditionally) and only then expanding the validated
// data-youtube placeholders into embeds is what makes YouTube support safe:
// the only iframe that can ever appear is one this function built itself, from
// an id matching YOUTUBE_ID_RE, pointing at youtube-nocookie.com.
export function renderRichTextHtml(html?: string | null): string {
  const clean = sanitizeRichText(html);

  const el = document.createElement('div');
  el.innerHTML = clean;
  normalizeAutoInkColors(el);
  if (!clean.includes('data-youtube')) return el.innerHTML;

  el.querySelectorAll<HTMLDivElement>('[data-youtube]').forEach((wrap) => {
    const videoId = wrap.getAttribute('data-youtube') || '';
    if (!YOUTUBE_ID_RE.test(videoId)) {
      wrap.remove();
      return;
    }
    const width = clampYoutubeWidth(wrap.getAttribute('data-w'));
    const align = wrap.getAttribute('data-align');
    wrap.removeAttribute('contenteditable');
    wrap.style.cssText = `width:${width}px;max-width:100%;margin:${youtubeMarginForAlign(align)}`;
    const frame = document.createElement('iframe');
    frame.src = youTubeEmbedUrl(videoId);
    frame.title = 'YouTube video';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.style.cssText = 'width:100%;aspect-ratio:16/9;border:0;border-radius:8px;display:block';
    wrap.innerHTML = '';
    wrap.appendChild(frame);
  });
  return el.innerHTML;
}

// Bodies written before this field became rich text are plain text with real
// newlines, and there is no migration - rendering those through
// dangerouslySetInnerHTML would collapse every line break. Callers use this to
// keep the old whitespace-pre-line rendering for them.
export function looksLikeHtml(value?: string | null): boolean {
  return /<[a-z][^>]*>/i.test(value || '');
}

// List cards render a short preview (line-clamp-2/3). Feeding them raw HTML
// would blow a pasted screenshot up to full width inside a small card, so
// previews get plain text instead and only the detail page renders real HTML.
export function htmlToPlainText(html?: string | null): string {
  if (!html) return '';
  const el = document.createElement('div');
  el.innerHTML = sanitizeRichText(html);
  // <div>/<p>/<br> boundaries are real line breaks to a reader but collapse to
  // nothing in textContent, which would run two paragraphs together as one word.
  el.querySelectorAll('br, p, div, li, tr, h1, h2, h3, h4, h5, h6').forEach((n) => {
    n.insertAdjacentText('beforebegin', '\n');
  });
  return (el.textContent || '').replace(/\n{2,}/g, '\n').trim();
}

// Chromium's execCommand('insertUnorderedList'/'insertOrderedList') misbehaves
// - merging an adjacent line into the wrong list item - when the current line
// is a bare inline run at the editable's top level rather than wrapped in its
// own block element. Reproduced during testing with: type text -> Enter ->
// click "Bullet list" -> type; the new list item absorbed the previous line's
// text instead of just the new one. The browser gives content this shape
// itself once a real Enter has been pressed inside the editor - this only
// needs to backfill it for content that never went through that: a freshly
// mounted empty editor, or a body saved before this fix existed.
//
// Doubles as the fix for a second, unrelated gap: legacy rows predate this
// field being HTML and are plain text with real newlines (see looksLikeHtml).
// Loading one into a contentEditable div as a raw string collapses it to a
// single run-on line (default white-space rendering), so those get split into
// one <div> per line here too.
export function ensureBlockWrapped(html?: string | null): string {
  const trimmed = (html || '').trim();
  if (!trimmed) return '<div><br></div>';

  if (!looksLikeHtml(trimmed)) {
    return trimmed
      .split('\n')
      .map((line) => `<div>${line || '<br>'}</div>`)
      .join('');
  }

  if (/^<(?:div|p|ul|ol|table|blockquote|h[1-6])[\s>]/i.test(trimmed)) return trimmed;
  return `<div>${trimmed}</div>`;
}

// `!form.body.trim()` no longer answers "did the author write anything" once
// body is HTML - an untouched editor can hold "<br>" or "<p></p>", and a body
// that is nothing but a pasted screenshot is legitimately non-empty while
// having no text at all.
//
// Deliberately regex-based rather than parse-and-inspect: this runs on every
// render (the editor's placeholder, and each form's submit-button disabled
// state), and re-parsing a multi-megabyte pasted screenshot that often would
// visibly jank typing. The <img> test short-circuits before the tag strip, so
// an image-only body never walks its own base64 payload.
export function isHtmlEmpty(html?: string | null): boolean {
  if (!html || !html.trim()) return true;
  // An image-only or video-only body has no text but is real content.
  if (/<img\b|data-youtube=/i.test(html)) return false;
  return !html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}
