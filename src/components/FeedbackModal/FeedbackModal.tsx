import { FormEvent, useId, useState } from 'react';
import { Button } from '../Button';
import { FieldError } from '../FieldError';
import { FormLabel } from '../FormLabel';
import { Modal } from '../Modal';
import { useToast } from '../Toaster';
import { ImageAttachmentPicker } from '../ImageAttachments/ImageAttachments';

export const FEEDBACK_MESSAGE_MAX = 4000;

export interface FeedbackModalLabels {
  heading: string;
  // Says who receives it and that the sender can be answered, unless it is anonymous.
  intro: string;
  messageLabel: string;
  messagePlaceholder: string;
  messageRequired: string;
  imagesLabel: string;
  addImages: string;
  removeImage: string;
  imageTooLarge: string;
  tooManyImages: string;
  unsupportedImage: string;
  anonymousLabel: string;
  // Shown only while "anonymous" is checked.
  anonymousNote: string;
  // Fallback shown when onSend rejects without its own message.
  sendError: string;
  cancel: string;
  sending: string;
  send: string;
  sentToast: string;
}

export interface FeedbackFields {
  message: string;
  anonymous: boolean;
  // Only when images were picked.
  files?: File[];
}

export interface FeedbackModalProps {
  onClose: () => void;
  // Resolves once the feedback is accepted; rejects with an Error whose message
  // displays as is, falling back to labels.sendError.
  onSend: (fields: FeedbackFields) => Promise<void>;
  labels: FeedbackModalLabels;
  // Always anonymous: no checkbox, and the anonymous note is always shown. For a
  // box that only takes anonymous messages (complaints, say).
  anonymousOnly?: boolean;
}

// Feedback about the app, from any role, with an anonymous option and images.
// Presentational only: onSend does the real request. Anonymous means the sender
// cannot be contacted, which the app's backend has to honor (no sender stored).
export function FeedbackModal({ onClose, onSend, labels: t, anonymousOnly = false }: FeedbackModalProps) {
  const { toast } = useToast();
  const messageId = useId();
  const [message, setMessage] = useState('');
  const [anonymousChoice, setAnonymous] = useState(false);
  const anonymous = anonymousOnly || anonymousChoice;
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return setError(t.messageRequired);
    setError('');
    setSending(true);
    try {
      await onSend({ message: message.trim(), anonymous, ...(files.length ? { files } : {}) });
      toast(t.sentToast, 'success');
      onClose();
    } catch (err) {
      setError((err as Error)?.message || t.sendError);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal onClose={onClose} title={t.heading} maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.intro}</p>
        <div>
          <FormLabel text={t.messageLabel} htmlFor={messageId} />
          <textarea
            id={messageId}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={FEEDBACK_MESSAGE_MAX}
            autoFocus
            placeholder={t.messagePlaceholder}
            className="input-field w-full resize-none"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{message.length}/{FEEDBACK_MESSAGE_MAX}</p>
          <FieldError message={error} />
        </div>
        <div>
          <FormLabel text={t.imagesLabel} />
          <ImageAttachmentPicker
            files={files}
            onChange={setFiles}
            disabled={sending}
            strings={{
              addLabel: t.addImages,
              removeLabel: t.removeImage,
              tooLargeLabel: t.imageTooLarge,
              tooManyLabel: t.tooManyImages,
              unsupportedLabel: t.unsupportedImage,
            }}
          />
        </div>
        <div>
          {!anonymousOnly && (
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={anonymousChoice} onChange={(e) => setAnonymous(e.target.checked)} />
              {t.anonymousLabel}
            </label>
          )}
          {anonymous && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.anonymousNote}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>{t.cancel}</Button>
          <Button type="submit" disabled={sending || !message.trim()}>{sending ? t.sending : t.send}</Button>
        </div>
      </form>
    </Modal>
  );
}
