import { useState } from 'react';
import type { ComponentDoc } from '../components/doc/ComponentBlock';
import { FramedPreview } from '../components/doc/Section';
import { demosFromModule, renderStory } from '../lib/renderStory';

import * as CardStories from '../../../src/components/Card/Card.stories';
import * as ScrollableTableStories from '../../../src/components/ScrollableTable/ScrollableTable.stories';
import * as SortableColumnHeaderStories from '../../../src/components/SortableColumnHeader/SortableColumnHeader.stories';
import * as TablePlaceholderRowStories from '../../../src/components/TablePlaceholderRow/TablePlaceholderRow.stories';
import * as FilterLabelStories from '../../../src/components/FilterLabel/FilterLabel.stories';
import * as FilterPillStories from '../../../src/components/FilterPill/FilterPill.stories';
import * as FilterRowStories from '../../../src/components/FilterRow/FilterRow.stories';
import * as StatCardStories from '../../../src/components/StatCard/StatCard.stories';
import * as NavTileStories from '../../../src/components/NavTile/NavTile.stories';
import * as PageHeaderStories from '../../../src/components/PageHeader/PageHeader.stories';
import * as ModalStories from '../../../src/components/Modal/Modal.stories';
import * as ErrorBoundaryStories from '../../../src/components/ErrorBoundary/ErrorBoundary.stories';
import { EmployeeTableDemo } from './demos/EmployeeTableDemo';

const frame = (demos: { label: string; node: React.ReactNode }[], height?: number, center?: boolean) =>
  demos.map(d => ({ ...d, node: <FramedPreview height={height} center={center}>{d.node}</FramedPreview> }));

// Modal has no `isOpen` prop by design - mounting it IS "open". A story
// rendered statically would mean every variant's full-viewport backdrop
// sits permanently open on this page at once, which is unusable. A real
// trigger button (opening the real fixed-overlay modal, closing on
// Escape/backdrop/its own buttons exactly like a real app) is both the
// fix and a more honest preview than a boxed-in fake.
function ModalDemo({ label, story }: { label: string; story: any }) {
  const [open, setOpen] = useState(false);
  const meta = ModalStories.default;
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary px-4 py-2 text-sm">
        Open "{label}"
      </button>
      {open && renderStory(meta, { ...story, args: { ...story.args, onClose: () => setOpen(false) } })}
    </>
  );
}

const modalDemos = Object.entries(ModalStories)
  .filter(([key]) => key !== 'default')
  .map(([label, story]) => ({ label, node: <ModalDemo label={label} story={story} /> }));

export const dataDisplay: ComponentDoc[] = [
  {
    name: 'Card',
    summary: 'Bordered rounded container. padding defaults to false.',
    demos: demosFromModule(CardStories),
  },
  {
    name: 'ScrollableTable',
    summary: 'Wraps a table with fade edges + chevron nudge buttons on whichever side is currently overflowing.',
    notes: 'The real use case is a full data table like this one - sortable columns, filters, badges - not a bare list of cells. The plain "Rows" demo below is the component in isolation; the "Composed" demo shows it wrapping a realistic employee directory built from SortableColumnHeader, FilterRow, RankBadge, StatusBadge and StatusDot, all cataloged elsewhere on this page.',
    demos: [
      { label: 'Composed', node: <EmployeeTableDemo /> },
      ...frame(demosFromModule(ScrollableTableStories).map(d => ({ ...d, label: `Rows (${d.label})` })), 200),
    ],
    wide: true,
  },
  {
    name: 'SortableColumnHeader',
    summary: 'A <th> with a sort toggle button and up/down indicator.',
    demos: demosFromModule(SortableColumnHeaderStories),
  },
  {
    name: 'TablePlaceholderRow',
    summary: 'Single centered <tr> for a table’s loading/empty state.',
    notes: 'loading shows a spinning icon above loadingText - the same icon the app already hand-rolled next to a loading table, now built in instead of copied at every call site.',
    demos: demosFromModule(TablePlaceholderRowStories),
  },
  {
    name: 'FilterLabel',
    summary: 'Tiny uppercase facet label. text, not children.',
    demos: demosFromModule(FilterLabelStories),
  },
  {
    name: 'FilterPill',
    summary: 'Toggleable filter chip; active fills brand red.',
    demos: demosFromModule(FilterPillStories),
  },
  {
    name: 'FilterRow',
    summary: 'A label + a row of FilterPills + "Clear". Renders nothing with no options.',
    notes: 'options is Array<string | { value, label }> - plain strings when the value IS the label (role, status), {value, label} when the display name can repeat and only value identifies the option (division/company/team names).',
    demos: demosFromModule(FilterRowStories),
  },
  {
    name: 'StatCard',
    summary: 'A small at-a-glance figure - label, .pmg-figure value, optional icon, optional hint, colored left edge (accent="amber" for a "needs attention" state).',
    notes: 'Renders as a real <button> when onClick is given, a plain <div> otherwise - omit onClick when hint is itself interactive (a MonthNav/WeekNav period picker replacing the caption in place, see their own InAStatCard stories), since a real <button> can’t contain another interactive control.',
    demos: demosFromModule(StatCardStories),
  },
  {
    name: 'NavTile',
    summary: 'A big clickable destination tile for a dashboard’s "go here" grid - icon in a tinted square, arrow that slides on hover, a 45deg corner notch and a growing left accent bar.',
    demos: demosFromModule(NavTileStories),
  },
  {
    name: 'PageHeader',
    summary: 'The red band shell every real page opens with - .pmg-field + .pmg-bars, with an optional back-link row.',
    notes: 'title/count/actions cover the common index-page row. children, given, replaces that row entirely - the escape hatch for a detail page’s avatar+status pill or a form page’s eyebrow date line, which don’t fit the same three props. color/barsColor override the field and the bars independently - the same device as ColorField, and the same reason: a sister brand reuses this shell with its own palette instead of a second component. countColor styles the count figure independently of all three - its default white/70 assumes a dark-enough field, which a custom color doesn’t guarantee.',
    demos: frame(demosFromModule(PageHeaderStories), 260),
    wide: true,
  },
  {
    name: 'Modal',
    summary: 'Centered overlay, closes on Escape or backdrop click. title + description cover the confirm/edit shape every real modal already hand-rolls; children still renders under them for the actual body.',
    notes: 'Click a button below to open a real modal - it is a genuine fixed, full-viewport overlay, not a boxed-in preview. TitleOnly uses the title prop (no description) for its plain stacked heading; CustomChildren omits title/description entirely and hand-builds an icon-beside-heading row instead - a shape the built-in props can’t produce, which is the actual reason children is the escape hatch.',
    demos: modalDemos,
  },
  {
    name: 'ErrorBoundary',
    summary: 'Class boundary with a branded fallback; auto-reloads once on a stale deployed-chunk error.',
    notes: 'Both demos below intentionally throw inside children, so what you see IS the real fallback UI catching a real error. background/lineColor let a sister brand reuse the same shell (corner bracket, texture, one action) with its own palette instead of a second fallback component.',
    demos: frame(demosFromModule(ErrorBoundaryStories), 340, true),
    wide: true,
  },
];
