import type { ComponentDoc } from '../components/doc/ComponentBlock';
import { FramedPreview } from '../components/doc/Section';
import { demosFromModule } from '../lib/renderStory';

import * as NavbarStories from '../../../src/components/Navbar/Navbar.stories';
import * as LayoutStories from '../../../src/components/Layout/Layout.stories';
import * as DarkModeToggleStories from '../../../src/components/DarkModeToggle/DarkModeToggle.stories';
import * as MonthNavStories from '../../../src/components/MonthNav/MonthNav.stories';
import * as WeekNavStories from '../../../src/components/WeekNav/WeekNav.stories';
import * as PaginationStories from '../../../src/components/Pagination/Pagination.stories';
import * as OverflowMenuStories from '../../../src/components/OverflowMenu/OverflowMenu.stories';
import * as NotificationBellStories from '../../../src/components/NotificationBell/NotificationBell.stories';
import * as NewsTickerStories from '../../../src/components/NewsTicker/NewsTicker.stories';
import * as LanguageToggleStories from '../../../src/components/LanguageToggle/LanguageToggle.stories';
import * as FlagsStories from '../../../src/components/Flags/Flags.stories';
import { FlagCanada, FlagAcadian } from '../../../src/components/Flags';

const frame = (demos: { label: string; node: React.ReactNode }[], height?: number) =>
  demos.map(d => ({ ...d, node: <FramedPreview height={height}>{d.node}</FramedPreview> }));

export const navigationChrome: ComponentDoc[] = [
  {
    name: 'Navbar',
    summary: 'The navbar’s shell: logo, one of three brand-dark tones, the hi-vis stripe underneath. No nav items of its own.',
    notes: 'tone: black / dark / steel - NAV_TONES carries the rationale for each (which one is right depends on the ground it sits on, worth being able to re-decide without touching markup). Compose it with DarkModeToggle, NotificationBell and your own buttons via children, then hand the result to Layout’s navbar prop.',
    // FullyComposed (one navbar) and AllTones (all three tones stacked, each
    // with its own rationale paragraph) need very different frame heights -
    // one shared height either wastes space under the single navbar or
    // clips/hides most of the three-tone comparison behind a scrollbar a
    // reader has no reason to expect. Framing each demo at its own height
    // fixes that instead of splitting the difference.
    demos: [
      ...frame(demosFromModule(NavbarStories).filter(d => d.label === 'FullyComposed'), 140),
      ...frame(demosFromModule(NavbarStories).filter(d => d.label === 'AllTones'), 620),
    ],
    wide: true,
  },
  {
    name: 'Layout',
    summary: 'The shell every other page sits in: brand-neutral background + <main> padding. Takes your app’s own navbar as the navbar prop rather than owning one.',
    demos: frame(demosFromModule(LayoutStories)),
    wide: true,
  },
  {
    name: 'DarkModeToggle',
    summary: 'Sun/moon icon button. Controlled - pair it with the useDarkMode hook (also exported).',
    demos: demosFromModule(DarkModeToggleStories),
  },
  {
    name: 'MonthNav',
    summary: 'Prev/next month arrows + a click-to-open month/year picker.',
    notes: 'months restricts it to a specific sorted list (otherwise unrestricted going back, capped at the current month going forward). variant="hero" for sitting on a solid brand-color field.',
    demos: demosFromModule(MonthNavStories),
  },
  {
    name: 'WeekNav',
    summary: 'Same idea one level down - a week (Monday-anchored) picker whose dropdown still lets you jump by month/year to get there.',
    notes: 'weeks restricts it the same way MonthNav’s months does; align picks which edge the dropdown hangs from.',
    demos: demosFromModule(WeekNavStories),
  },
  {
    name: 'Pagination',
    summary: 'Range + total (in .pmg-figure numerals), Prev/Next. Hides itself at 1 page unless children is given.',
    demos: demosFromModule(PaginationStories),
  },
  {
    name: 'OverflowMenu',
    summary: '"More actions" popover; items vs dangerItems (divided, red). onDark inverts the trigger for sitting on a red field.',
    notes: 'align ("right" default / "left") picks which edge the menu grows from - a trigger near the left edge of its own container needs "left", or "right" pushes the menu off-screen.',
    demos: demosFromModule(OverflowMenuStories),
  },
  {
    name: 'NotificationBell',
    summary: 'The icon-with-badge-that-opens-a-dropdown shell shared by a notifications bell, a "pending review" counter, and an unread-messages list.',
    notes: 'The body is children, fully custom, since a notification row and a "5 timesheets pending" row don’t share a shape worth forcing into one prop. NotificationBellEmpty is the same shell with no unread count.',
    demos: demosFromModule(NotificationBellStories),
  },
  {
    name: 'NewsTicker',
    summary: 'A continuously-scrolling marquee of headlines (an intranet home page’s "Latest News" strip) - the list repeats several times back to back for a seamless loop, and the loop pauses on hover so a headline holds still long enough to read or click.',
    notes: 'important items get a solid red pill instead of plain text. An item’s optional href renders it as a real link (opened in a new tab) instead of a plain button; onItemClick still fires alongside it if given, e.g. for click tracking.',
    demos: demosFromModule(NewsTickerStories),
    wide: true,
  },
  {
    name: 'LanguageToggle',
    summary: 'The real EN/FR segmented switch: both languages always visible, the live one filled - not a single icon that toggles to show only the other language, the pattern that makes half a bilingual audience guess which state they’re in.',
    demos: demosFromModule(LanguageToggleStories),
  },
  {
    name: 'Flags',
    summary: 'FlagCanada / FlagAcadian / AcadianStar - real flag SVGs for a bilingual EN/FR toggle. Acadian rather than a generic France flag: the correct mark for Maritime Canada’s French-speaking community.',
    demos: [
      { label: 'FlagCanada', node: <FlagCanada className="w-10 h-7 rounded-sm shadow-sm" /> },
      { label: 'FlagAcadian', node: <FlagAcadian className="w-10 h-7 rounded-sm shadow-sm" /> },
      ...demosFromModule(FlagsStories),
    ],
    propsKey: 'FlagCanada',
  },
];
