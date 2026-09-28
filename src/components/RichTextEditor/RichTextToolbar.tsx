import { ReactNode, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiYoutube } from 'react-icons/fi';
import { parseYouTubeId } from './richTextYouTube';

// Formatting toolbar shared by RichTextEditor's compact box and its expanded
// full-screen modal. Ported from the Solman generator in the
// "operations-migration" project (src/components/solman/DescriptionModal.jsx),
// with its blue accents swapped for Premium brand red.
//
// Commands go through document.execCommand. It is formally deprecated but has
// no replacement that works on a plain contentEditable, and every browser we
// support still implements it - the alternative is pulling in a full editor
// engine (TipTap/Lexical) for what is a handful of formatting buttons.

interface SwatchColor {
  name: string;
  value: string;
  cls: string;
  label?: string;
}

const WORD_TEXT_COLORS: SwatchColor[] = [
  { name: 'Black', value: '#000000', cls: 'bg-black' },
  { name: 'Dark Gray', value: '#404040', cls: 'bg-gray-700' },
  { name: 'Gray', value: '#7f7f7f', cls: 'bg-gray-500' },
  { name: 'White', value: '#ffffff', cls: 'bg-white border border-gray-300 dark:border-white/20' },
  { name: 'Premium Red', value: '#E62027', cls: 'bg-brand-500' },
  { name: 'Orange', value: '#FAAD00', cls: 'bg-amber-400' },
  { name: 'Dark Red', value: '#A51E26', cls: 'bg-brand-700' },
  { name: 'Green', value: '#00b050', cls: 'bg-green-600' },
  { name: 'Blue', value: '#0070c0', cls: 'bg-blue-600' },
  { name: 'Purple', value: '#7030a0', cls: 'bg-purple-600' },
];

const WORD_HIGHLIGHT_COLORS: SwatchColor[] = [
  { name: 'No Color', value: 'transparent', cls: 'bg-white border border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-300', label: 'Ø' },
  { name: 'Yellow', value: '#ffff00', cls: 'bg-yellow-300' },
  { name: 'Bright Green', value: '#00ff00', cls: 'bg-green-400' },
  { name: 'Turquoise', value: '#00ffff', cls: 'bg-cyan-300' },
  { name: 'Pink', value: '#ff00ff', cls: 'bg-fuchsia-400' },
  { name: 'Red', value: '#ff0000', cls: 'bg-red-500' },
  { name: 'Blue', value: '#0000ff', cls: 'bg-blue-600' },
  { name: 'Dark Blue', value: '#002060', cls: 'bg-blue-900' },
  { name: 'Dark Red', value: '#7f0000', cls: 'bg-red-900' },
  { name: 'Dark Gray', value: '#404040', cls: 'bg-gray-700' },
];

export interface RichTextCommands {
  saveSelection: () => void;
  exec: (cmd: string, value?: string | null) => void;
  execHighlight: (value: string) => void;
  insertNodes: (nodes: Node | Node[]) => void;
}

// Clicking a toolbar button blurs the contentEditable and the browser drops
// the selection with it, so the range is captured on every selection change
// and re-applied right before the command runs. Buttons additionally fire on
// mouseDown with preventDefault so the blur never happens in the first place -
// both halves are needed, since the select element can't preventDefault away
// its own focus.
export function useRichTextCommands(editorRef: RefObject<HTMLDivElement | null>, onCommit?: () => void): RichTextCommands {
  const savedSel = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedSel.current = sel.getRangeAt(0).cloneRange();
    }
  }, [editorRef]);

  // Toolbar buttons preventDefault on mouseDown specifically so the browser
  // never blurs the editor or drops its selection in the first place - so the
  // *live* selection is already correct in the common case, and is preferred
  // here. Falling back to reapplying the saved Range unconditionally (as
  // Solman's original DescriptionModal does) is what caused a real bug found
  // during testing: a Range's node references can be invalidated by DOM
  // mutations that happen between saving it and using it (e.g. pressing Enter
  // splits a text node), so blindly reapplying a stale clone after such a
  // mutation silently corrupts the next execCommand instead of just failing
  // loudly - reproduced by bold text -> Enter -> click "Bullet list", which
  // merged the new line into the wrong list item. The saved range is now only
  // a fallback for when focus/selection has genuinely left the editor.
  // Whether the live selection still belongs to the editor has to be decided
  // BEFORE focusing it: focus() can itself put a caret into the editor, which
  // would make a selection that had genuinely moved away (into the YouTube URL
  // field, say) look live and current, and the real insertion point would be
  // lost.
  const restore = useCallback(() => {
    const sel = window.getSelection();
    const liveSelectionInEditor = !!sel && sel.rangeCount > 0 && !!editorRef.current?.contains(sel.anchorNode);
    editorRef.current?.focus();
    if (!liveSelectionInEditor && savedSel.current) {
      const after = window.getSelection();
      after?.removeAllRanges();
      after?.addRange(savedSel.current);
    }
  }, [editorRef]);

  const exec = useCallback((cmd: string, value: string | null = null) => {
    restore();
    document.execCommand(cmd, false, value ?? undefined);
    saveSelection();
    onCommit?.();
  }, [restore, saveSelection, onCommit]);

  // Firefox implements highlighting as hiliteColor, Chromium historically only
  // honoured backColor - try the standard one, fall back to the other.
  const execHighlight = useCallback((value: string) => {
    restore();
    try {
      if (document.queryCommandSupported?.('hiliteColor')) {
        document.execCommand('hiliteColor', false, value);
      } else {
        document.execCommand('backColor', false, value);
      }
    } catch {
      try {
        document.execCommand('backColor', false, value);
      } catch {
        // ignore - the browser refused both, nothing else to try
      }
    }
    saveSelection();
    onCommit?.();
  }, [restore, saveSelection, onCommit]);

  // Drops real DOM nodes at the caret (used for YouTube embeds), rather than
  // going through execCommand. Falls back to appending when the selection has
  // been lost entirely, matching how a pasted image is placed.
  const insertNodes = useCallback((nodes: Node | Node[]) => {
    const el = editorRef.current;
    if (!el) return;
    const list = Array.isArray(nodes) ? nodes : [nodes];
    restore();
    const sel = window.getSelection();

    if (sel && sel.rangeCount && el.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      let previous: Node | null = null;
      for (const node of list) {
        if (previous) previous.parentNode?.insertBefore(node, previous.nextSibling);
        else range.insertNode(node);
        previous = node;
      }
      if (previous) {
        const caret = document.createRange();
        caret.setStart(previous, 0);
        caret.collapse(true);
        sel.removeAllRanges();
        sel.addRange(caret);
      }
    } else {
      list.forEach((node) => el.appendChild(node));
    }

    saveSelection();
    onCommit?.();
  }, [restore, saveSelection, editorRef, onCommit]);

  return { saveSelection, exec, execHighlight, insertNodes };
}

function ToolBtn({ onRun, title, children }: { onRun: () => void; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onRun(); }}
      title={title}
      className="select-none rounded px-2 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px shrink-0 self-center bg-gray-300 dark:bg-gray-600" />;
}

function Swatches({ colors, active, onPick, label, indicator }: {
  colors: SwatchColor[];
  active: string;
  onPick: (value: string) => void;
  label: string;
  indicator: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      title={label}
    >
      <span className="relative inline-flex w-5 select-none flex-col items-center justify-center">
        {indicator}
        <span className="mt-0.5 h-0.75 w-4 rounded" style={{ backgroundColor: active === 'transparent' ? 'transparent' : active }} />
      </span>
      <div className="grid grid-cols-5 gap-1">
        {colors.map((c) => (
          <button
            key={c.value}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onPick(c.value); }}
            title={c.name}
            aria-label={`${label}: ${c.name}`}
            className={`flex h-5 w-5 items-center justify-center rounded-sm ${c.cls} ${
              active === c.value ? 'ring-2 ring-brand-500' : 'ring-1 ring-black/10 dark:ring-white/10'
            }`}
          >
            {c.label ? <span className="text-[10px] font-bold leading-none">{c.label}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

// A small modal (matching a consumer's own Modal/ConfirmDialog visual
// convention) rather than an inline toolbar row - portalled to <body> since
// the compact editor clips overflow, and this can be opened from inside the
// full-editor modal too (z-1050), so it needs to sit above that.
//
// Escape is bound on `window` in the capture phase specifically so it wins
// over RichTextEditor's own full-editor Escape handler (bound on `document`):
// capture-phase listeners run window -> document -> ... down to the target,
// so this always fires first regardless of mount order, closing just this
// modal instead of the editor underneath it.
function YouTubeModal({ onInsert, onClose }: { onInsert: (videoId: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pressedOverlay = useRef(false);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  function submit() {
    const videoId = parseYouTubeId(url);
    if (!videoId) {
      setError("That doesn't look like a YouTube link.");
      return;
    }
    onInsert(videoId);
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-1100 flex items-center justify-center bg-black/40 p-4 dark:bg-black/60"
      onMouseDown={(e) => { pressedOverlay.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (e.target === e.currentTarget && pressedOverlay.current) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-(--premium-dark-grey)">
        <h3 className="mb-4 font-heading text-base font-semibold text-gray-900 dark:text-gray-100">
          Insert a YouTube video
        </h3>
        <input
          ref={inputRef}
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          placeholder="youtube.com/watch?v="
          className="input-field"
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={submit} className="btn-primary flex-1 py-2.5 text-sm">
            Insert
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export interface RichTextToolbarProps {
  exec: (cmd: string, value?: string | null) => void;
  execHighlight: (value: string) => void;
  onInsertYouTube?: (videoId: string) => void;
  full?: boolean;
  textColor?: string;
  setTextColor?: (value: string) => void;
  highlightColor?: string;
  setHighlightColor?: (value: string) => void;
  trailing?: ReactNode;
}

export function RichTextToolbar({
  exec,
  execHighlight,
  onInsertYouTube,
  full = false,
  textColor = '',
  setTextColor,
  highlightColor = '',
  setHighlightColor,
  trailing = null,
}: RichTextToolbarProps) {
  const [youTubeOpen, setYouTubeOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 bg-gray-50 dark:border-white/20 dark:bg-(--premium-black)/30">
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
      <ToolBtn onRun={() => exec('bold')} title="Bold (Ctrl+B)"><span className="font-bold">B</span></ToolBtn>
      <ToolBtn onRun={() => exec('italic')} title="Italic (Ctrl+I)"><span className="italic">I</span></ToolBtn>
      <ToolBtn onRun={() => exec('underline')} title="Underline (Ctrl+U)"><span className="underline">U</span></ToolBtn>
      <ToolBtn onRun={() => exec('strikeThrough')} title="Strikethrough"><span className="line-through">S</span></ToolBtn>
      <Sep />
      <ToolBtn onRun={() => exec('insertUnorderedList')} title="Bullet list">• List</ToolBtn>
      <ToolBtn onRun={() => exec('insertOrderedList')} title="Numbered list">1. List</ToolBtn>

      {full && (
        <>
          <Sep />
          <Swatches
            colors={WORD_TEXT_COLORS}
            active={textColor}
            label="Text color"
            onPick={(v) => { setTextColor?.(v); exec('foreColor', v); }}
            indicator={<span className="text-sm font-bold leading-none text-gray-700 dark:text-gray-200">A</span>}
          />
          <Swatches
            colors={WORD_HIGHLIGHT_COLORS}
            active={highlightColor}
            label="Text highlight color"
            onPick={(v) => { setHighlightColor?.(v); execHighlight(v); }}
            indicator={
              <svg className="h-4 w-4 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 17.25V21h3.75l11-11.03-3.75-3.75-11 11.03zm2.92 2.33H5v-.92l8.92-8.94.92.92-8.92 8.94zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
              </svg>
            }
          />
          <Sep />
          <ToolBtn onRun={() => exec('justifyLeft')} title="Align left">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4h16v2H2V4zm0 4h10v2H2V8zm0 4h14v2H2v-2zm0 4h8v2H2v-2z" /></svg>
          </ToolBtn>
          <ToolBtn onRun={() => exec('justifyCenter')} title="Align center">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4h16v2H2V4zm3 4h10v2H5V8zm-3 4h16v2H2v-2zm3 4h10v2H5v-2z" /></svg>
          </ToolBtn>
          <ToolBtn onRun={() => exec('justifyRight')} title="Align right">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 4h16v2H2V4zm6 4h10v2H8V8zm-6 4h16v2H2v-2zm6 4h10v2H8v-2z" /></svg>
          </ToolBtn>
          <Sep />
          <select
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => { exec('fontSize', e.target.value); e.target.value = ''; }}
            defaultValue=""
            className="cursor-pointer rounded border border-gray-200 bg-white px-1.5 py-1 text-xs text-gray-700 dark:border-white/20 dark:bg-white/10 dark:text-gray-200"
          >
            <option value="" disabled>Size</option>
            <option value="1">8pt</option>
            <option value="2">10pt</option>
            <option value="3">12pt</option>
            <option value="4">14pt</option>
            <option value="5">18pt</option>
            <option value="6">24pt</option>
            <option value="7">36pt</option>
          </select>
        </>
      )}

      <Sep />
      {onInsertYouTube && (
        <button
          type="button"
          // Unlike the formatting buttons this one intentionally does NOT
          // preventDefault-to-keep-focus: the modal it opens needs the focus.
          // The caret position is recovered from the saved selection when
          // Insert is pressed (see useRichTextCommands' restore).
          onClick={() => setYouTubeOpen(true)}
          title="Insert a YouTube video"
          className="flex select-none items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <FiYoutube size={14} /> YouTube
        </button>
      )}
      <ToolBtn onRun={() => exec('removeFormat')} title="Clear formatting">
        <span className="text-xs">Clear</span>
      </ToolBtn>
      {trailing}
    </div>

      {youTubeOpen && onInsertYouTube && (
        <YouTubeModal onInsert={onInsertYouTube} onClose={() => setYouTubeOpen(false)} />
      )}
    </div>
  );
}
