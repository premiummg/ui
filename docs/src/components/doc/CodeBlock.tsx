import { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const html = Prism.highlight(code, Prism.languages.jsx, 'jsx');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable (e.g. non-HTTPS) - nothing to fall back to
    }
  };

  return (
    <div className="relative mt-2 rounded-xl bg-[#1E1E1E] overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-300 bg-white/10 hover:bg-white/20 transition"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="code-block p-4 pr-16 overflow-x-auto text-[11px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
