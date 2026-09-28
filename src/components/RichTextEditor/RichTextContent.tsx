import { useMemo } from 'react';
import { renderRichTextHtml, looksLikeHtml } from './richTextSanitize';

export interface RichTextContentProps {
  html?: string | null;
  className?: string;
}

// Read-only render of a body authored with RichTextEditor.
//
// Three things it has to get right:
//  - A body written before this field became rich text is plain text with
//    real newlines; that keeps the original whitespace-pre-line rendering
//    instead of going through dangerouslySetInnerHTML, which would collapse
//    every line break. There is no migration, so both shapes can exist forever.
//  - HTML bodies are sanitized here, at the point of render. A consumer's own
//    backend should sanitize on write too, but this layer also covers
//    anything written before that guard existed.
//  - YouTube videos are stored only as a `<div data-youtube="ID">` placeholder
//    and become a real <iframe> here, after sanitization has already stripped
//    every iframe the stored HTML might have contained. See
//    richTextSanitize.ts's renderRichTextHtml.
export function RichTextContent({ html, className = '' }: RichTextContentProps) {
  const isHtml = looksLikeHtml(html);
  // Parses and re-serializes the body, so don't redo it on every parent render.
  const rendered = useMemo(() => (isHtml ? renderRichTextHtml(html) : ''), [html, isHtml]);

  if (!html) return null;

  if (!isHtml) {
    return <div className={`whitespace-pre-line ${className}`}>{html}</div>;
  }

  return (
    <div
      className={`[&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:my-1 [&_img]:max-w-full [&_a]:text-brand-600 [&_a]:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
