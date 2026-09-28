import { ClipboardEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiMaximize2 } from 'react-icons/fi';
import { RichTextToolbar, useRichTextCommands } from './RichTextToolbar';
import { sanitizePastedHtml, isHtmlEmpty, ensureBlockWrapped } from './richTextSanitize';
import { buildResizableImageNode, reattachResizeHandles, stripResizeHandles, readPastedImage } from './richTextImages';
import { buildYouTubeNode, hydrateYouTubeNodes, stripYouTubePreviews } from './richTextYouTube';

// Rich text body editor - for a News/Knowledge Base/Documents/Events style
// authoring field, or anywhere else a consumer needs formatted text with
// pasted screenshots and YouTube embeds. Ported from PMG Intranet, which
// itself ported the Solman generator in the "operations-migration" project
// (src/components/solman/DescriptionModal.jsx + imageResize.js) and adapted
// that project's ref/innerHTML copying to a normal controlled value/onChange
// component so it drops straight into a form's existing string state.
//
// Everything it produces is HTML, so every read path has to sanitize - see
// richTextSanitize.ts (and a consuming app's own backend sanitizer, mirroring
// the same allow-list).
//
// Relies on the consumer's own `.input-field`/`.btn-primary` global CSS
// classes (the same convention PasswordInput/AddressAutocomplete already use)
// rather than inlining that styling here, so it stays visually identical to
// the rest of a consumer's own form fields.

const EDITOR_CONTENT_CLASSES =
  'focus:outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-6 [&_ol]:ml-6 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_img]:max-w-full';

// The contentEditable div is written to imperatively (innerHTML) rather than
// rendered from `value`, because re-rendering it on every keystroke would
// reset the caret to the start of the field. `lastRawValue` tracks the last
// `value` this component itself produced (via emit -> onChange) so an
// incoming `value` that is merely our own change echoing back does not
// trigger a caret-destroying re-sync, while a genuinely external change
// (opening an edit form, saving from the expanded editor, a sibling field's
// re-render passing the same unchanged value down again) does not either -
// only a value that actually differs from what this editor last produced
// forces a resync.
//
// What actually lands in the DOM is `ensureBlockWrapped(value)`, not `value`
// verbatim - kept as a separate step from the skip-check above so the two
// don't fight: comparing wrapped-vs-raw on every render would resync (and
// reset the user's live selection) on every keystroke in an unrelated
// sibling field whenever a consumer lifts all its form fields into one state
// object, which most do.
function useEditableSync(editorRef: React.RefObject<HTMLDivElement | null>, value: string, onChange: (html: string) => void) {
  const lastRawValue = useRef<string | null>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if ((value || '') === lastRawValue.current) return;
    el.innerHTML = ensureBlockWrapped(value);
    lastRawValue.current = value || '';
    // innerHTML assignment drops the JS listeners the resize handles rely on,
    // and what is stored for a video is only a bare placeholder - both need
    // their editor-only chrome rebuilt.
    reattachResizeHandles(el);
    hydrateYouTubeNodes(el);
  }, [value, editorRef]);

  const emit = () => {
    const el = editorRef.current;
    if (!el) return;
    // Strip the editor-only chrome back out so none of it reaches the database.
    const html = stripYouTubePreviews(stripResizeHandles(el.innerHTML));
    lastRawValue.current = html;
    onChange(html);
  };

  return emit;
}

// Screenshots are the main reason this editor exists, so a clipboard image is
// inserted as a real resizable node. Pasted *HTML* is sanitized first and
// deliberately cannot carry <img> (see sanitizePastedHtml) - images only ever
// enter through this path, where the source is a local clipboard blob.
function useRichTextPaste(editorRef: React.RefObject<HTMLDivElement | null>, emit: () => void) {
  return (e: ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith('image/'));

    if (!imageItem) {
      const html = e.clipboardData?.getData('text/html');
      if (!html) return;
      e.preventDefault();
      const clean = sanitizePastedHtml(html);
      if (window.getSelection()?.rangeCount) {
        document.execCommand('insertHTML', false, clean);
      } else {
        editorRef.current?.insertAdjacentHTML('beforeend', clean);
      }
      emit();
      return;
    }

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    // readPastedImage is async (a large image goes through a decode/draw/
    // re-encode round trip to compress it - see richTextImages.ts), so the
    // insertion point has to be captured now, synchronously, while the
    // paste's own selection is still live - by the time it resolves,
    // window.getSelection() may no longer reflect where the paste happened.
    const sel = window.getSelection();
    const savedRange = sel?.rangeCount && editorRef.current?.contains(sel.anchorNode)
      ? sel.getRangeAt(0).cloneRange()
      : null;

    readPastedImage(file).then((dataUrl) => {
      const { wrap } = buildResizableImageNode(dataUrl);
      if (savedRange) {
        savedRange.deleteContents();
        savedRange.insertNode(wrap);
        savedRange.setStartAfter(wrap);
        savedRange.collapse(true);
        const liveSel = window.getSelection();
        liveSel?.removeAllRanges();
        liveSel?.addRange(savedRange);
      } else {
        editorRef.current?.appendChild(wrap);
      }
      emit();
    });
  };
}

// A video is a contenteditable="false" block, so an empty line is inserted
// after it too - otherwise a video at the very end of a body leaves nowhere to
// put the caret and the author can't keep typing.
function makeYouTubeInserter(insertNodes: (nodes: Node | Node[]) => void) {
  return (videoId: string) => {
    const trailing = document.createElement('div');
    trailing.innerHTML = '<br>';
    insertNodes([buildYouTubeNode(videoId), trailing]);
  };
}

function Placeholder({ text, value }: { text?: string; value: string }) {
  if (!text || !isHtmlEmpty(value)) return null;
  return (
    <div className="pointer-events-none absolute left-3 top-2.5 select-none text-sm text-gray-400 dark:text-gray-500">
      {text}
    </div>
  );
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  modalTitle?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write here, or paste a screenshot (Ctrl+V)…',
  minHeight = '140px',
  maxHeight = '260px',
  modalTitle = 'Edit',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const emit = useEditableSync(editorRef, value, onChange);
  const { saveSelection, exec, execHighlight, insertNodes } = useRichTextCommands(editorRef, emit);
  const handlePaste = useRichTextPaste(editorRef, emit);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Mirrors .input-field's border/radius/dark treatment so the editor sits
          flush with the plain inputs around it; focus-within stands in for
          :focus since the focused node is the inner contentEditable. */}
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white transition focus-within:border-brand-500 dark:border-white/20 dark:bg-white/10">
        <RichTextToolbar
          exec={exec}
          execHighlight={execHighlight}
          onInsertYouTube={makeYouTubeInserter(insertNodes)}
          trailing={
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setExpanded(true); }}
              title="Open full editor"
              className="ml-auto flex select-none items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-100"
            >
              <FiMaximize2 size={13} /> Full editor
            </button>
          }
        />
        <div className="relative">
          <Placeholder text={placeholder} value={value} />
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emit}
            onPaste={handlePaste}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            className={`thin-scrollbar overflow-y-auto px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 ${EDITOR_CONTENT_CLASSES}`}
            style={{ minHeight, maxHeight, wordWrap: 'break-word', overflowWrap: 'break-word' }}
          />
        </div>
      </div>

      {expanded && (
        <RichTextFullEditor
          title={modalTitle}
          initialHtml={value}
          onSave={(html) => { onChange(html); setExpanded(false); }}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}

// The expanded editor edits a local draft and only writes back on Save, so
// Cancel genuinely discards. It is portalled to <body> because it is opened
// from inside forms that themselves sit in a Modal - the parent modal's
// backdrop-blur would otherwise become the containing block for this fixed
// overlay, and its overflow-y-auto would clip it.
function RichTextFullEditor({ title, initialHtml, onSave, onClose }: {
  title: string;
  initialHtml: string;
  onSave: (html: string) => void;
  onClose: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(initialHtml || '');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');

  const emit = useEditableSync(editorRef, draft, setDraft);
  const { saveSelection, exec, execHighlight, insertNodes } = useRichTextCommands(editorRef, emit);
  const handlePaste = useRichTextPaste(editorRef, emit);

  // Focus the editor and drop the caret at the end, the way opening a document
  // for editing normally behaves.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  // Captured on `document` in the capture phase and stopped there, so Escape
  // closes only this editor - a consumer's own Modal's bubble-phase Escape
  // listener would otherwise also close the edit dialog underneath it. The
  // YouTube modal's own Escape handler (bound on `window`, see
  // RichTextToolbar.tsx) fires first when it's open, so this only ever runs
  // when that modal isn't.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-1050 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-white/10 dark:bg-(--premium-dark-grey)">
        <div className="shrink-0 border-b border-gray-200 px-5 py-3 dark:border-white/10">
          <h3 className="font-heading text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>

        <RichTextToolbar
          full
          exec={exec}
          execHighlight={execHighlight}
          onInsertYouTube={makeYouTubeInserter(insertNodes)}
          textColor={textColor}
          setTextColor={setTextColor}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
        />

        <div className="relative flex-1 overflow-hidden">
          <Placeholder text="Write here, or paste a screenshot (Ctrl+V)…" value={draft} />
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emit}
            onPaste={handlePaste}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            className={`thin-scrollbar h-full overflow-y-auto px-6 py-4 text-sm text-gray-900 dark:text-gray-100 ${EDITOR_CONTENT_CLASSES}`}
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
          />
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button type="button" onClick={() => onSave(draft)} className="btn-primary px-6 text-sm">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
