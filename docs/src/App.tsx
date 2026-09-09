import { useState, useLayoutEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { PremiumLogo, DarkModeToggle, SearchInput, useDarkMode } from '../../src/index';
import { Foundations } from './Foundations';
import { CategoryPage } from './pages/CategoryPage';
import { CATEGORIES } from './catalog/categories';

const INSTALL_CMD = 'npm install @premiummg/ui';

function InstallSnippet() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable - nothing to fall back to
    }
  };
  return (
    <button
      onClick={copy}
      className="mt-4 inline-flex items-center gap-3 bg-black/25 hover:bg-black/35 rounded-lg pl-3 pr-2.5 py-2 text-xs text-white/90 font-mono transition"
    >
      {INSTALL_CMD}
      <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-white/15">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}

// Foundations first (path "/"), then one nav group per category - each
// group's own path is a real separate page (CATEGORIES' own `id` doubles as
// the route segment), so a link to one specific component always lands on
// the page that actually contains it, not a scroll position on a page that
// might not have loaded it.
const NAV_GROUPS = [
  {
    title: 'Foundations', path: '/',
    links: [
      { id: 'colors', label: 'Color' },
      { id: 'typography', label: 'Typography' },
      { id: 'graphic-devices', label: 'Graphic devices' },
      { id: 'known-caveats', label: 'Known caveats' },
    ],
  },
  ...CATEGORIES.map(c => ({
    title: c.title,
    path: `/${c.id}`,
    links: c.items.map(i => ({ id: i.name, label: i.name })),
  })),
];

// React Router doesn't scroll on its own the way a full page load does -
// this restores that (to the #hash target if the link had one, to the top
// otherwise). useLayoutEffect, not useEffect: a few real components
// autofocus an input by design when a given demo variant starts already in
// that state (UnitField's "already a custom value" story, for one) -
// correct in a real app, but on a page showing many demos at once it means
// the browser auto-scrolls to whichever one mounts last unless this runs
// (synchronously, before paint) to put the scroll position back where the
// navigation actually asked for.
function ScrollManager() {
  const location = useLocation();
  useLayoutEffect(() => {
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return null;
}

// Every link already carries where it goes (group.path + link.id) regardless
// of which page happens to be open right now, so filtering search results is
// just filtering this same list down - no separate results dropdown needed,
// and a match still shows which category it lives in.
function filterGroups(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return NAV_GROUPS;
  return NAV_GROUPS
    .map(group => ({
      ...group,
      links: group.title.toLowerCase().includes(q) ? group.links : group.links.filter(l => l.label.toLowerCase().includes(q)),
    }))
    .filter(group => group.links.length > 0);
}

function Sidebar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const groups = useMemo(() => filterGroups(query), [query]);

  const close = () => { setOpen(false); };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="lg:hidden fixed bottom-4 right-4 z-40 w-11 h-11 rounded-full grid place-items-center text-white shadow-lg"
        style={{ backgroundColor: 'var(--premium-red)' }}
        aria-label="Toggle navigation"
      >
        {open ? '×' : '☰'}
      </button>
      <nav
        className={`fixed lg:sticky top-0 lg:top-6 left-0 h-screen lg:h-[calc(100vh-3rem)] w-64 shrink-0 overflow-y-auto
          bg-white dark:bg-(--premium-dark-grey) lg:bg-transparent dark:lg:bg-transparent
          border-r lg:border-r-0 border-gray-100 dark:border-white/10 px-5 py-6 z-30
          transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search components…"
          debounceMs={100}
          className="mb-5"
        />

        {groups.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">No matches for "{query}".</p>
        )}

        {groups.map(group => {
          const isCurrentPage = location.pathname === group.path;
          return (
            <div key={group.path} className="mb-5">
              <Link
                to={group.path}
                onClick={close}
                className={`pmg-eyebrow block mb-2 transition ${
                  isCurrentPage ? 'text-(--premium-red)' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {group.title}
              </Link>
              <ul className="space-y-1">
                {group.links.map(link => (
                  <li key={link.id}>
                    <Link
                      to={`${group.path}#${link.id}`}
                      onClick={() => { close(); setQuery(''); }}
                      className="block text-sm text-gray-600 dark:text-gray-300 hover:text-(--premium-red) dark:hover:text-(--premium-red) py-0.5 transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </>
  );
}

function Shell() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen">
      <ScrollManager />
      {/* Page chrome - a real .pmg-field/.pmg-bars band, the same device every
          real app page opens with (see PageHeader in the Data Display
          section), so this page's own header is a live example of itself. */}
      <div className="pmg-field relative overflow-hidden pmg-diagonal-bottom">
        <div className="absolute inset-0 pmg-bars pointer-events-none" />
        <div className="relative max-w-[1920px] mx-auto px-6 lg:px-10 py-10 pb-16 flex items-start justify-between gap-4">
          <div>
            {/* white in light mode, Premium Black in dark - a surface that
                flips with the theme, exactly like the real navbar tones in
                timesheet-payroll-system - so PremiumLogo's own mode="auto"
                (not a fixed "light") is the right pick here, matching its
                own doc comment: auto is for a surface that itself flips
                with the theme, not one whose color is fixed. */}
            <Link to="/" className="inline-block bg-white dark:bg-(--premium-black) rounded-xl px-4 py-3 shadow-sm">
              <PremiumLogo size="md" variant="horizontal" mode="auto" />
            </Link>
            <h1 className="font-heading font-black text-3xl text-white mt-4">Premium UI</h1>
            <p className="text-white/80 text-sm mt-2 max-w-xl leading-relaxed">
              The Premium MG design system: brand tokens, a Tailwind preset, and every ready-to-use
              React component shared across Premium's apps. Every preview below is the real,
              installed component - not a screenshot.
            </p>
            <InstallSnippet />
          </div>
          <DarkModeToggle
            isDark={isDark}
            onToggle={toggle}
            className="shrink-0 text-white/80! hover:text-white! hover:bg-white/15!"
          />
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-10 flex gap-10 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Foundations />} />
          <Route path=":categoryId" element={<CategoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
