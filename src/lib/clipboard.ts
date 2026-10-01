export async function copyToClipboard(text: string): Promise<void> {
  // Modern API - try first
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to legacy method
    }
  }

  // Legacy fallback - works on iOS Safari and older browsers.
  // iOS requires setSelectionRange (not just select()) and the element must be
  // actually visible in the viewport (position:fixed, not display:none).
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
  document.body.appendChild(el);
  el.focus();
  el.setSelectionRange(0, el.value.length);
  document.execCommand('copy');
  document.body.removeChild(el);
}
