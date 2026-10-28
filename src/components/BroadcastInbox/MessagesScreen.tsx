import type { ReactNode } from 'react';
import { PageHeader } from '../PageHeader';
import { BroadcastInbox } from './BroadcastInbox';
import { BroadcastDetail } from './BroadcastDetail';
import type { BroadcastDataProps, BroadcastInboxProps } from './types';

export interface MessagesScreenProps extends BroadcastDataProps {
  title: string;
  backLabel: string;
  // Back to the dashboard (the page's own back link).
  onBack: () => void;
  // The conversation open on screen, from the route. Omit for the inbox.
  broadcastId?: string;
  // Routes: open a conversation, return to the list.
  onOpen: (broadcastId: string) => void;
  onBackToList: () => void;
  onCompose?: () => void;
  showFeedback?: BroadcastInboxProps['showFeedback'];
  dateLocale?: BroadcastInboxProps['dateLocale'];
  // Anything the app wants above the page (an overlay gate, a banner).
  children?: ReactNode;
}

// The whole Messages page, shared by every app: the red header band, the amber
// stripe under it, and either the inbox or one conversation. Each app only
// supplies its data, its permissions and its words, so the two can never drift
// apart in layout or styling again.
export function MessagesScreen({
  title,
  backLabel,
  onBack,
  broadcastId,
  onOpen,
  onBackToList,
  onCompose,
  showFeedback,
  dateLocale,
  children,
  ...data
}: MessagesScreenProps) {
  return (
    <div>
      <PageHeader backLabel={backLabel} onBack={onBack}>
        <h1 className="font-heading text-2xl font-black leading-none text-white">{title}</h1>
      </PageHeader>
      <div className="pmg-stripe h-0.75 mb-5" />
      {children}
      {broadcastId ? (
        <BroadcastDetail {...data} broadcastId={broadcastId} onBack={onBackToList} />
      ) : (
        <BroadcastInbox {...data} dateLocale={dateLocale} onOpen={onOpen} onCompose={onCompose} showFeedback={showFeedback} />
      )}
    </div>
  );
}
