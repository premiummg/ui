// Saves a Blob as a file. The link is attached to the page while it is clicked (Firefox ignores a detached one) and
// the address is revoked a moment later: some browsers start the download after the click returns.
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
