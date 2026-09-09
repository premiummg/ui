import type { ComponentDoc } from '../components/doc/ComponentBlock';
import { actionsForms } from './actionsForms';
import { feedbackStatus } from './feedbackStatus';
import { navigationChrome } from './navigationChrome';
import { dataDisplay } from './dataDisplay';
import { authShell } from './authShell';
import { marketing } from './marketing';

export interface Category {
  id: string;
  n: string;
  title: string;
  note: string;
  items: ComponentDoc[];
}

// `id` doubles as the route path segment (/actions-forms, /feedback-status, ...)
// - one category, one page, so a link to a specific component
// (/actions-forms#Button) always lands on a page that actually contains it.
export const CATEGORIES: Category[] = [
  {
    id: 'actions-forms', n: '05', title: 'Actions & Forms',
    note: 'Buttons and the fields a real form is built from.',
    items: actionsForms,
  },
  {
    id: 'feedback-status', n: '06', title: 'Feedback & Status',
    note: 'Telling someone what just happened, or what state something is in.',
    items: feedbackStatus,
  },
  {
    id: 'navigation-chrome', n: '07', title: 'Navigation & Chrome',
    note: 'The app shell every other page sits inside of.',
    items: navigationChrome,
  },
  {
    id: 'data-display', n: '08', title: 'Data Display',
    note: 'Tables, cards, and the panels real screens are assembled from.',
    items: dataDisplay,
  },
  {
    id: 'auth-shell', n: '09', title: 'Auth & App Shell',
    note: 'The sign-in flow and the brand mark itself.',
    items: authShell,
  },
  {
    id: 'marketing', n: '10', title: 'Marketing & Landing',
    note: 'Scoped to public-facing pages - a marketing page\'s buttons and cards sit on whatever colored section surrounds them, which app chrome never has to handle.',
    items: marketing,
  },
];
