import { useCallback, useEffect, useRef, useState } from 'react';
import { FiCheck, FiSend } from 'react-icons/fi';
import type { ChatMessage } from './types';

export interface ConversationThreadStrings {
  placeholder: string;
  send: string;
  readTooltipRead: string;
  readTooltipUnread: string;
  loadError: string;
  sendError: string;
}

export interface ConversationThreadProps {
  fetchFn: () => Promise<ChatMessage[]>;
  onSend: (body: string) => Promise<ChatMessage>;
  // Called whenever this thread is visible and focused - on mount, and again
  // each time a new message arrives while still being looked at. Safe to call
  // repeatedly (every real backend treats this as "set last_read_at = now",
  // not a one-shot transition), so this never needs an explicit "is this
  // already read" input from the caller.
  onMarkRead?: () => void | Promise<void>;
  currentUserId: string | undefined;
  strings: ConversationThreadStrings;
  // Matches both apps' own current choice.
  pollIntervalMs?: number;
  // A closed conversation - hides the composer, shows disabledMessage instead.
  disabled?: boolean;
  disabledMessage?: string;
  onAuthorClick?: (authorId: string) => void;
}

function Ticks({ read, strings }: { read: boolean; strings: ConversationThreadStrings }) {
  return (
    <span className="ml-1.5 inline-flex -space-x-1.5" title={read ? strings.readTooltipRead : strings.readTooltipUnread}>
      <FiCheck size={12} className="text-white/70" />
      <FiCheck size={12} className={read ? 'text-sky-300' : 'text-transparent'} />
    </span>
  );
}

// One turn in the thread. `mine` decides the side; the author's name is
// always shown regardless - relying on "unlabeled = you" only works when
// there's exactly one possible viewer, which a shared/multi-admin thread
// never guarantees.
function MessageBubble({
  message,
  mine,
  strings,
  onAuthorClick,
}: {
  message: ChatMessage;
  mine: boolean;
  strings: ConversationThreadStrings;
  onAuthorClick?: (authorId: string) => void;
}) {
  const nameLabel = onAuthorClick ? (
    <button type="button" onClick={() => onAuthorClick(message.authorId)} className="hover:underline">
      {message.authorName ?? '?'}
    </button>
  ) : (
    message.authorName ?? '?'
  );
  if (mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5" style={{ backgroundColor: 'var(--premium-red)' }}>
          <p className="mb-0.5 text-[11px] font-semibold text-white/70">{nameLabel}</p>
          <p className="whitespace-pre-wrap text-sm text-white">{message.body}</p>
          <div className="flex items-center justify-end text-[10px] text-white/70">
            <span>{new Date(message.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
            {message.read !== undefined && <Ticks read={message.read} strings={strings} />}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-[85%]">
      <p className="mb-0.5 text-[11px] text-gray-400">{nameLabel}</p>
      <div className="inline-block rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-3.5 py-2.5 dark:border-white/20 dark:bg-(--premium-steel-grey)">
        <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">{message.body}</p>
      </div>
      <p className="mt-0.5 text-[10px] text-gray-400">
        {new Date(message.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
      </p>
    </div>
  );
}

function Composer({
  onSend,
  strings,
}: {
  onSend: (body: string) => Promise<void>;
  strings: ConversationThreadStrings;
}) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError('');
    try {
      await onSend(trimmed);
      setValue('');
    } catch {
      setError(strings.sendError);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 2000))}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={sending}
          placeholder={strings.placeholder}
          className="max-h-24 flex-1 resize-none overflow-y-auto rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--premium-red)/20 disabled:opacity-60 dark:border-white/20 dark:bg-(--premium-dark-grey) dark:text-gray-100"
        />
        <button
          type="button"
          onClick={submit}
          disabled={sending || !value.trim()}
          aria-label={strings.send}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-30"
          style={{ backgroundColor: 'var(--premium-red)' }}
        >
          <FiSend size={14} />
        </button>
      </div>
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--premium-red)' }}>{error}</p>}
    </div>
  );
}

// A single thread of messages: fetches (and polls) its own data, renders
// every turn, and offers a composer. Knows nothing about broadcasts,
// recipients, roles, or routing - see BroadcastInbox for the layer that
// composes several of these into today's Sent/Received pattern.
export function ConversationThread({
  fetchFn,
  onSend,
  onMarkRead,
  currentUserId,
  strings,
  pollIntervalMs = 15_000,
  disabled = false,
  disabledMessage,
  onAuthorClick,
}: ConversationThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const messageCountRef = useRef(0);
  // A mark-read attempt that couldn't fire because the tab was unfocused when
  // a new message landed isn't dropped - it's retried the next time this tab
  // is actually focused, mirroring exactly how a human would notice it.
  const pendingMarkReadRef = useRef(false);

  const attemptMarkRead = useCallback(() => {
    if (!onMarkRead) return;
    if (document.visibilityState === 'hidden' || !document.hasFocus()) {
      pendingMarkReadRef.current = true;
      return;
    }
    pendingMarkReadRef.current = false;
    Promise.resolve(onMarkRead()).catch(() => {});
  }, [onMarkRead]);

  const load = useCallback(async () => {
    try {
      const next = await fetchFn();
      setMessages(next);
      setError(false);
      if (next.length !== messageCountRef.current) {
        messageCountRef.current = next.length;
        attemptMarkRead();
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, attemptMarkRead]);

  useEffect(() => {
    load();
    attemptMarkRead();
    const interval = setInterval(() => {
      if (document.visibilityState !== 'hidden') load();
    }, pollIntervalMs);
    function onFocusOrVisible() {
      load();
      if (pendingMarkReadRef.current) attemptMarkRead();
    }
    document.addEventListener('visibilitychange', onFocusOrVisible);
    window.addEventListener('focus', onFocusOrVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      window.removeEventListener('focus', onFocusOrVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, pollIntervalMs]);

  async function handleSend(body: string) {
    const message = await onSend(body);
    setMessages((prev) => [...prev, message]);
    messageCountRef.current += 1;
  }

  return (
    <div className="space-y-2.5">
      {loading ? (
        <p className="py-4 text-center text-xs text-gray-400">…</p>
      ) : error ? (
        <p className="py-4 text-center text-xs" style={{ color: 'var(--premium-red)' }}>{strings.loadError}</p>
      ) : (
        messages.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.authorId === currentUserId} strings={strings} onAuthorClick={onAuthorClick} />
        ))
      )}
      {disabled ? (
        disabledMessage && <p className="pt-1 text-center text-xs text-gray-400">{disabledMessage}</p>
      ) : (
        <Composer onSend={handleSend} strings={strings} />
      )}
    </div>
  );
}
