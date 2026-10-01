import { useState, FormEvent } from 'react';
import { Modal } from '../Modal';
import { FormLabel } from '../FormLabel';
import { useToast } from '../Toaster';

const TITLE_MAX = 150;
const MESSAGE_MAX = 4000;

export interface SendMessageModalLabels {
  heading: string;
  to: string;
  // Fallback for the "To" field (and the sent-toast) when recipientNames is
  // omitted - a plain count instead of a name list.
  recipientCount: (n: number) => string;
  titleLabel: string;
  titlePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  responseLabel: string;
  justConfirmTitle: string;
  justConfirmDescription: string;
  writtenReplyTitle: string;
  writtenReplyDescription: string;
  titleRequired: string;
  messageRequired: string;
  // Fallback shown when onSend rejects without its own message.
  sendError: string;
  cancel: string;
  sending: string;
  send: string;
  sentToast: (recipientLabel: string) => string;
}

export interface SendMessageFields {
  title: string;
  message: string;
  requiresReply: boolean;
}

export interface SendMessageModalProps {
  recipientIds: string[];
  // Shown in the "To" field (joined with commas) - omit to show a plain
  // count (labels.recipientCount) instead of names.
  recipientNames?: string[];
  onClose: () => void;
  // Resolves once the message is accepted; rejects with an Error whose
  // message displays as-is, falling back to labels.sendError. The caller's
  // own API call builds whatever payload shape it needs from these three
  // plain fields plus its own recipientIds.
  onSend: (fields: SendMessageFields) => Promise<void>;
  // Called right after a successful send, before onClose - e.g. to exit a
  // bulk-selection mode or refresh a list.
  onSent?: () => void;
  labels: SendMessageModalLabels;
}

// Two labeled options instead of a checkbox - a checkbox needs prose to
// explain both states ("checked = they must reply"), two buttons that each
// say what they mean don't.
function ReplyModeOption({ selected, onSelect, title, description }: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-xl border transition ${
        selected
          ? 'border-(--premium-red) bg-red-50 dark:bg-red-900/20'
          : 'border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
      }`}
    >
      {/* Drawn rather than a real radio so the whole row is the hit target
          and the ring colour can follow the brand in both themes. */}
      <span
        className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-(--premium-red)' : 'border-gray-300 dark:border-white/30'
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--premium-red)' }} />}
      </span>
      <span>
        <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">{title}</span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">{description}</span>
      </span>
    </button>
  );
}

// Compose a message that will block each recipient's app until they answer
// (the AnnouncementGate on their side) - pulled out of timesheet-payroll-
// system and pmg-intranet, which had each hand-written their own version.
// Presentational only - onSend does the real API call; this has no opinion
// on the payload shape beyond the three fields a person actually fills in.
export function SendMessageModal({ recipientIds, recipientNames, onClose, onSend, onSent, labels: t }: SendMessageModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [requiresReply, setRequiresReply] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const recipientLabel = recipientNames?.length ? recipientNames.join(', ') : t.recipientCount(recipientIds.length);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError(t.titleRequired);
    if (!message.trim()) return setError(t.messageRequired);
    setError('');
    setSending(true);
    try {
      await onSend({ title: title.trim(), message: message.trim(), requiresReply });
      toast(t.sentToast(recipientLabel), 'success');
      onSent?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || t.sendError);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal onClose={onClose} title={t.heading} maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <FormLabel text={t.to} />
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-white/15 dark:bg-white/5 dark:text-gray-300">
            {recipientLabel}
          </p>
        </div>

        <div>
          <FormLabel text={t.titleLabel} />
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            autoFocus
            placeholder={t.titlePlaceholder}
            className="input-field w-full"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{title.length}/{TITLE_MAX}</p>
        </div>

        <div>
          <FormLabel text={t.messageLabel} />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            maxLength={MESSAGE_MAX}
            placeholder={t.messagePlaceholder}
            className="input-field w-full resize-none"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{message.length}/{MESSAGE_MAX}</p>
        </div>

        <div>
          <FormLabel text={t.responseLabel} />
          <div className="space-y-2">
            <ReplyModeOption
              selected={!requiresReply}
              onSelect={() => setRequiresReply(false)}
              title={t.justConfirmTitle}
              description={t.justConfirmDescription}
            />
            <ReplyModeOption
              selected={requiresReply}
              onSelect={() => setRequiresReply(true)}
              title={t.writtenReplyTitle}
              description={t.writtenReplyDescription}
            />
          </div>
        </div>

        {error && <p className="text-sm" style={{ color: 'var(--premium-red)' }}>{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10">
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="btn-primary px-5 disabled:opacity-60"
          >
            {sending ? t.sending : t.send}
          </button>
        </div>
      </form>
    </Modal>
  );
}
