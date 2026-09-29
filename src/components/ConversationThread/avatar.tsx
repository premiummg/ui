// Internal helper shared by ConversationThread (its own message bubbles) and
// BroadcastInbox (each recipient row's header, outside any bubble) - not part
// of this package's public surface, so it isn't re-exported from src/index.ts.

export function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function Avatar({ name, onClick }: { name: string | null; onClick?: () => void }) {
  const content = (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
      style={{ backgroundColor: 'var(--premium-red-light, rgba(220,38,38,0.12))', color: 'var(--premium-red)' }}
    >
      {initials(name)}
    </span>
  );
  if (!onClick) return content;
  return (
    <button type="button" onClick={onClick} title={name ?? undefined} className="shrink-0">
      {content}
    </button>
  );
}
