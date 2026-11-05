import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cx } from '@/lib/cx';
import { Chip } from '@/components/Chip';
import { personaById, portalById, type PersonaId, type PortalId } from '@/data/platform';
import { SkipLink, TopBar } from './TopBar';

export interface AppShellProps {
  portal: PortalId;
  persona: PersonaId;
  /** Replace the default organisation chip from the persona. */
  orgChip?: ReactNode;
  /** Replace the default role chip from the persona. */
  roleChip?: ReactNode;
  /** Extra chips after the role chip, for example an access tier. */
  extraChips?: ReactNode;
  /** Screen-specific content shown under the nav links (for example a certified metrics list). */
  navExtra?: ReactNode;
  children: ReactNode;
}

/**
 * Desktop portal shell: sticky top bar, a left nav (up to 240px) that stacks
 * above the content below 900px, and content up to 1360px with 24px gutters.
 */
export function AppShell({ portal, persona, orgChip, roleChip, extraChips, navExtra, children }: AppShellProps) {
  const p = portalById(portal);
  const who = personaById(persona);
  return (
    <div className="min-h-screen bg-ground">
      <SkipLink />
      <TopBar
        brand={<>NAFIS · {p.brand}</>}
        brandTo={p.home}
        persona={persona}
        initial={who.initial}
        personaName={`${who.name}, ${who.role}`}
        chips={
          <>
            {orgChip ?? <Chip>{who.org}</Chip>}
            {roleChip ?? <Chip tone="neutral">{who.role}</Chip>}
            {extraChips}
          </>
        }
      />
      <div className="mx-auto flex max-w-[1408px] flex-col gap-6 px-4 py-6 sm:px-6 nav:flex-row">
        <nav aria-label={`${p.brand} sections`} className="min-w-0 nav:sticky nav:top-[76px] nav:w-[240px] nav:shrink-0 nav:self-start">
          <p className="m-0 mb-2 hidden text-[13px] font-semibold uppercase tracking-[0.06em] text-ink2 nav:block">{p.name}</p>
          <ul className="m-0 flex list-none flex-wrap gap-1 p-0 nav:flex-col">
            {p.built.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    cx(
                      'flex min-h-touch items-center rounded-control px-3 text-sm font-medium no-underline',
                      isActive ? 'bg-accent-tint text-ink ring-1 ring-inset ring-accent' : 'text-accent hover:bg-accent-tint hover:text-accent-hover',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {navExtra ? <div className="mt-4">{navExtra}</div> : null}
          <details className="mt-3 nav:hidden">
            <summary className="flex min-h-touch cursor-pointer items-center px-3 text-sm font-medium text-ink2">
              Planned screens in this portal ({p.planned.length})
            </summary>
            <ul className="m-0 list-none px-3 pb-2 text-sm text-ink2">
              {p.planned.map((name) => (
                <li key={name} className="py-1">
                  {name}
                </li>
              ))}
            </ul>
          </details>
          <div className="mt-5 hidden nav:block">
            <p className="m-0 mb-1 px-3 text-[13px] font-semibold text-ink2">Planned, not built in this demo</p>
            <ul className="m-0 list-none p-0 text-sm text-ink2">
              {p.planned.map((name) => (
                <li key={name} className="px-3 py-1.5">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
