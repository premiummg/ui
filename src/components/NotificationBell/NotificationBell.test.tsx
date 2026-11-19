import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiBell } from 'react-icons/fi';
import { NotificationBell, NotificationBellEmpty } from './NotificationBell';

describe('NotificationBell', () => {
  test('hides the badge at count 0/undefined, shows it otherwise (capped at 9+)', () => {
    const { rerender } = render(
      <NotificationBell icon={FiBell} label="Notifications" title="Notifications">
        <NotificationBellEmpty>No notifications</NotificationBellEmpty>
      </NotificationBell>,
    );
    expect(screen.queryByText('9+')).not.toBeInTheDocument();

    rerender(
      <NotificationBell icon={FiBell} label="Notifications" title="Notifications" count={12}>
        <NotificationBellEmpty>No notifications</NotificationBellEmpty>
      </NotificationBell>,
    );
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  test('opens on trigger click, showing the header title and body', async () => {
    render(
      <NotificationBell icon={FiBell} label="Notifications" title="Notifications" count={2}>
        <NotificationBellEmpty>No notifications</NotificationBellEmpty>
      </NotificationBell>,
    );
    expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('Notifications')).toBeInTheDocument(); // the panel header (trigger's label is aria-only, not text)
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  test('header action and footer fire their own handlers', async () => {
    const onHeaderAction = vi.fn();
    const onFooter = vi.fn();
    render(
      <NotificationBell
        icon={FiBell}
        label="Notifications"
        title="Notifications"
        headerAction={{ label: 'Mark all read', onClick: onHeaderAction }}
        footer={{ label: 'View all', onClick: onFooter }}
      >
        <NotificationBellEmpty>No notifications</NotificationBellEmpty>
      </NotificationBell>,
    );
    await userEvent.click(screen.getByLabelText('Notifications'));
    await userEvent.click(screen.getByText('Mark all read'));
    await userEvent.click(screen.getByText('View all'));
    expect(onHeaderAction).toHaveBeenCalledTimes(1);
    expect(onFooter).toHaveBeenCalledTimes(1);
  });

  test('clicking outside closes the dropdown', async () => {
    render(
      <div>
        <div data-testid="outside" />
        <NotificationBell icon={FiBell} label="Notifications" title="Notifications">
          <NotificationBellEmpty>No notifications</NotificationBellEmpty>
        </NotificationBell>
      </div>,
    );
    await userEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('No notifications')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
  });
});

describe('NotificationBell close, badge tone and trigger title', () => {
  test('a function child gets close, which shuts the panel', async () => {
    render(
      <NotificationBell icon={FiBell} label="Pending" title="Pending review">
        {(close) => <button onClick={close}>Go</button>}
      </NotificationBell>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Pending' }));
    await userEvent.click(screen.getByText('Go'));
    expect(screen.queryByText('Go')).not.toBeInTheDocument();
  });

  test('the red tone paints the badge brand red, and the trigger carries a title', () => {
    render(
      <NotificationBell icon={FiBell} label="Notifications" title="Notifications" count={3} badgeTone="red" triggerTitle="3 unread">
        <NotificationBellEmpty>none</NotificationBellEmpty>
      </NotificationBell>,
    );
    expect(screen.getByText('3').getAttribute('style')).toContain('--premium-red');
    expect(screen.getByRole('button', { name: 'Notifications' }).getAttribute('title')).toBe('3 unread');
  });
});
