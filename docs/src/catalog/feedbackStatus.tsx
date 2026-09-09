import type { ComponentDoc } from '../components/doc/ComponentBlock';
import { demosFromModule } from '../lib/renderStory';

import * as AlertStories from '../../../src/components/Alert/Alert.stories';
import * as ToasterStories from '../../../src/components/Toaster/Toaster.stories';
import * as StatusBadgeStories from '../../../src/components/StatusBadge/StatusBadge.stories';
import * as StatusDotStories from '../../../src/components/StatusDot/StatusDot.stories';
import * as CountBadgeStories from '../../../src/components/CountBadge/CountBadge.stories';
import * as RankBadgeStories from '../../../src/components/RankBadge/RankBadge.stories';

export const feedbackStatus: ComponentDoc[] = [
  {
    name: 'Alert',
    summary: 'Inline banner. variant: error / success / warning / info, each with its own icon and left-edge accent.',
    notes: 'text, not children - every real use is one line of message text, not a composition slot.',
    demos: demosFromModule(AlertStories),
  },
  {
    name: 'Toaster',
    summary: 'A full toast subsystem, not just the display component: wrap the app in ToastProvider once, mount Toaster once, call useToast().toast(message, variant) anywhere.',
    notes: 'emitToast(...) fires one from outside React entirely (an axios interceptor, a top-level handler) - a no-op if no provider is mounted yet. Toaster itself takes no props, correctly - it only ever displays whatever the context currently holds. Click a button below to fire a real toast (it lands at the real bottom-right of this browser window, not a boxed-in preview).',
    demos: demosFromModule(ToasterStories),
    propsKey: 'Toaster',
  },
  {
    name: 'StatusBadge',
    summary: 'Capitalized pill. tone covers the four standard colors (success/warning/error/neutral) with no Tailwind classes to write - defaults to neutral when neither tone nor colorClass is given.',
    notes: 'colorClass stays for anything outside those four - an app’s own semantic wrapper (RoleBadge, TimesheetStatusBadge) still owns its own status vocabulary; this only saves rewriting the same 4 color pairs by hand. Optional style passthrough covers a color that isn’t a Tailwind class at all - an arbitrary brand color, e.g. RankBadge’s own filled top step.',
    demos: demosFromModule(StatusBadgeStories),
  },
  {
    name: 'StatusDot',
    summary: 'Three-state access dot (active + optional identityActive). variant="presence" pins it to an avatar’s corner.',
    demos: demosFromModule(StatusDotStories),
  },
  {
    name: 'CountBadge',
    summary: 'Small red pill for a total - e.g. sitting next to a PageHeader title.',
    demos: demosFromModule(CountBadgeStories),
  },
  {
    name: 'RankBadge',
    summary: 'One badge out of an ordered ramp - a role, a priority, a tier - where each step should read as more or less weight than its neighbors.',
    notes: 'Give it levels (your values, ordered low to high) for the built-in on-brand ramp - outline opacity/ink weight stepping up, filled color (defaults to Premium red) on the top entry - with no Tailwind classes to write. Pass styles instead for full manual control, e.g. a sister brand with its own complete color system. A value missing from either still renders as a neutral outline pill rather than coming out unstyled.',
    demos: demosFromModule(RankBadgeStories),
  },
];
