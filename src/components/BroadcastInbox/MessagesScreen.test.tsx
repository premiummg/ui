import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessagesScreen } from './MessagesScreen';
import { baseProps, broadcast } from './testFixtures';

const screenProps = {
  title: 'Messages',
  backLabel: 'Dashboard',
  onBack: () => {},
  onOpen: () => {},
  onBackToList: () => {},
};

describe('MessagesScreen', () => {
  test('shows the page title with the inbox below it', async () => {
    render(<MessagesScreen {...baseProps} {...screenProps} fetchReceived={async () => [broadcast({ id: 'b1', title: 'Hello there' })]} currentUserId="u1" canSendMessages={false} />);
    expect(screen.getByRole('heading', { name: 'Messages' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Hello there')).toBeInTheDocument());
  });

  test('the back link goes to the dashboard', async () => {
    const onBack = vi.fn();
    render(<MessagesScreen {...baseProps} {...screenProps} onBack={onBack} currentUserId="u1" canSendMessages={false} />);
    await userEvent.click(screen.getByText('Dashboard'));
    expect(onBack).toHaveBeenCalled();
  });

  test('with a conversation id it shows that conversation instead of the inbox', async () => {
    render(<MessagesScreen {...baseProps} {...screenProps} broadcastId="b1" fetchReceived={async () => [broadcast({ id: 'b1', title: 'Open one' })]} currentUserId="u1" canSendMessages={false} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Open one' })).toBeInTheDocument());
  });
});
