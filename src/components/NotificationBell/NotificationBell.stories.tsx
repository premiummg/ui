import type { Meta, StoryObj } from '@storybook/react';
import { FiBell, FiClipboard, FiMessageSquare } from 'react-icons/fi';
import { NotificationBell, NotificationBellEmpty } from './NotificationBell';

const meta: Meta<typeof NotificationBell> = {
  title: 'Components/NotificationBell',
  component: NotificationBell,
  decorators: [Story => <div className="flex justify-end gap-1 p-4"><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof NotificationBell>;

// A plain notifications list - the most common shape.
export const Notifications: Story = {
  args: {
    icon: FiBell,
    label: 'Notifications',
    title: 'Notifications',
    count: 3,
    headerAction: { label: 'Mark all read', onClick: () => {} },
    children: (
      <>
        <button className="w-full text-left px-4 py-3 flex flex-col gap-0.5 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition bg-red-50/40 dark:bg-red-900/10">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Purchase order #4021 approved</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">2m ago</span>
        </button>
        <button className="w-full text-left px-4 py-3 flex flex-col gap-0.5 hover:bg-gray-50 dark:hover:bg-white/5 transition bg-red-50/40 dark:bg-red-900/10">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Timesheet rejected - see comments</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">1h ago</span>
        </button>
      </>
    ),
  },
};

export const Empty: Story = {
  args: {
    icon: FiBell,
    label: 'Notifications',
    title: 'Notifications',
    children: <NotificationBellEmpty>No notifications</NotificationBellEmpty>,
  },
};

// A fixed set of named counters rather than a scrolling list - same shell,
// completely different body content.
export const PendingReviewCounts: Story = {
  args: {
    icon: FiClipboard,
    label: 'Pending review',
    title: 'Pending Review',
    count: 7,
    children: (
      <div className="p-2">
        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition text-left">
          <span className="text-sm text-gray-700 dark:text-gray-200">Timesheets</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300">5</span>
        </button>
        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition text-left">
          <span className="text-sm text-gray-700 dark:text-gray-200">Purchase Orders</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300">2</span>
        </button>
      </div>
    ),
  },
};

// A footer link, for a list too long to fit in the dropdown itself.
export const MessagesWithFooter: Story = {
  args: {
    icon: FiMessageSquare,
    label: 'Employee messages',
    title: 'Messages',
    count: 1,
    footer: { label: 'View all messages', onClick: () => {} },
    children: (
      <button className="w-full text-left px-4 py-3 flex flex-col gap-0.5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">New safety policy</span>
          <span className="text-[11px] font-bold shrink-0 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300">1 unread</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">Please review the updated PPE requirements.</span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Admin · 3h ago</span>
      </button>
    ),
  },
};
