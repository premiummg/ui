// The z-index/corner-radius/shadow trio for every dropdown/menu/calendar
// popover in this library - the specific chrome that had drifted
// independently in each one (z-30 vs z-50, rounded-xl vs rounded-2xl,
// shadow-lg/xl/2xl) with no apparent reason for the split. If two of these
// ever end up stacked (an OverflowMenu action opening a ConfirmDialog, two
// menus open in the same toolbar), a z-30 one could render behind page
// content a z-50 one would have cleared - sharing one constant makes that
// impossible to reintroduce by accident.
// Background/border color and positioning (absolute/top/left/right/mt-*/w-*)
// stay per-component since those genuinely vary by trigger shape.
export const POPOVER_PANEL = 'z-50 rounded-2xl shadow-2xl';
