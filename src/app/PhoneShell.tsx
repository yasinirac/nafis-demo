import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Briefcase, Home, Route, UserRound } from 'lucide-react';
import { cx } from '@/lib/cx';
import { personaById, type PersonaId } from '@/data/platform';
import { SkipLink, TopBar } from './TopBar';

type PlannedTab = 'Learn' | 'Jobs';

/**
 * Phone shell for the Talent app: a 390×844 frame centred on desktop,
 * full-bleed on phones, with the bottom nav Home / Path / Learn / Jobs / Me.
 * Learn and Jobs are planned screens: they say so instead of navigating.
 */
export function PhoneShell({ persona, children }: { persona: PersonaId; children: ReactNode }) {
  const who = personaById(persona);
  const [planned, setPlanned] = useState<PlannedTab | null>(null);

  const tabClass = (active: boolean) =>
    cx(
      'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-control px-1 text-[12px] font-medium no-underline',
      active ? 'text-accent' : 'text-ink2 hover:text-accent',
    );

  return (
    <div className="min-h-screen bg-ground">
      <SkipLink />
      <TopBar brand={<>NAFIS · Talent</>} brandTo="/talent" persona={persona} initial={who.initial} personaName={who.name} />
      <div className="flex justify-center sm:px-6 sm:py-6">
        <div className="relative flex w-full flex-col bg-ground sm:h-[844px] sm:w-[390px] sm:overflow-hidden sm:rounded-[36px] sm:border sm:border-line sm:shadow-[0_8px_30px_rgba(18,22,31,0.12)]">
          <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 pb-28 pt-4 focus:outline-none sm:overflow-y-auto sm:pb-6">
            {children}
          </main>
          {planned ? (
            <div role="status" className="fixed inset-x-4 bottom-24 z-30 rounded-control bg-ink px-4 py-3 text-sm text-white shadow-lg sm:absolute sm:bottom-[76px]">
              {planned} is a planned screen. It is not built in this demo.{' '}
              <button type="button" onClick={() => setPlanned(null)} className="ms-1 min-h-touch font-semibold text-white underline underline-offset-2">
                Close
              </button>
            </div>
          ) : (
            <div role="status" className="sr-only" />
          )}
          <nav aria-label="Talent app" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface sm:static">
            <ul className="m-0 flex list-none gap-1 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
              <li className="flex flex-1">
                <NavLink to="/talent" end className={({ isActive }) => tabClass(isActive)}>
                  <Home aria-hidden="true" className="h-5 w-5" />
                  Home
                </NavLink>
              </li>
              <li className="flex flex-1">
                <NavLink to="/talent/path" className={({ isActive }) => tabClass(isActive)}>
                  <Route aria-hidden="true" className="h-5 w-5" />
                  Path
                </NavLink>
              </li>
              <li className="flex flex-1">
                <button type="button" onClick={() => setPlanned('Learn')} className={tabClass(false)}>
                  <BookOpen aria-hidden="true" className="h-5 w-5" />
                  Learn
                </button>
              </li>
              <li className="flex flex-1">
                <button type="button" onClick={() => setPlanned('Jobs')} className={tabClass(false)}>
                  <Briefcase aria-hidden="true" className="h-5 w-5" />
                  Jobs
                </button>
              </li>
              <li className="flex flex-1">
                <NavLink to="/talent/privacy" className={({ isActive }) => tabClass(isActive)}>
                  <UserRound aria-hidden="true" className="h-5 w-5" />
                  Me
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

/** Phone screen header row: a title block and optional actions on the right. */
export function PhoneHeader({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">{children}</div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}
