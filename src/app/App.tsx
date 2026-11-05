import { useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { screenForPath } from '@/data/platform';
import { appRoutes } from './routes';
import { NotFound } from './NotFound';

/** On each route change: set the page title, scroll to top, move focus to main. */
function RouteEffects() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    const screen = screenForPath(pathname);
    document.title = screen ? `${screen.title} · NAFIS concept · sample data` : 'Not found · NAFIS concept';
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    const main = document.getElementById('main');
    main?.focus({ preventScroll: true });
    main?.scrollTo?.(0, 0);
  }, [pathname]);
  return null;
}

/**
 * HashRouter keeps deep links working on GitHub Pages without a server
 * rewrite (see docs/DECISIONS.md).
 */
export function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteEffects />
      <Routes>
        {appRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
