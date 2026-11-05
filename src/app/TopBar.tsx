import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon } from 'lucide-react';
import { cx } from '@/lib/cx';
import type { PersonaId } from '@/data/platform';
import { ConceptChip } from './ConceptChip';
import { RoleSwitcher } from './RoleSwitcher';

/** "Platform map" link shown in every header. */
export function PlatformMapLink({ tone = 'light', current }: { tone?: 'light' | 'dark'; current?: boolean }) {
  return (
    <Link
      to="/"
      aria-current={current ? 'page' : undefined}
      className={cx(
        'inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-control px-3 text-sm font-medium no-underline',
        tone === 'light' ? 'text-accent hover:bg-accent-tint hover:text-accent-hover' : 'text-white hover:bg-white/10 hover:text-white',
      )}
    >
      <MapIcon aria-hidden="true" className="h-4 w-4" />
      Platform map
    </Link>
  );
}

/** Skip link, the first focusable element on every page. */
export function SkipLink() {
  return (
    <a
      href="#main"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.focus();
      }}
      className="sr-only rounded-control bg-accent px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60]"
    >
      Skip to content
    </a>
  );
}

function Avatar({ initial, personaName }: { initial: string; personaName?: string }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
      <span aria-hidden="true">{initial}</span>
      <span className="sr-only">Demo persona: {personaName}</span>
    </span>
  );
}

/**
 * Top bar: brand, organisation and role chips, the concept chip, the role
 * switcher, the Platform map link and the persona's initial.
 * From 640px up it is one sticky bar. On phones the sticky part holds the
 * brand and the concept chip; the switcher and map link sit in a row below.
 */
export function TopBar({
  brand,
  brandTo,
  chips,
  persona,
  initial,
  personaName,
  mapCurrent,
}: {
  brand: ReactNode;
  brandTo: string;
  chips?: ReactNode;
  persona: PersonaId | null;
  initial?: string;
  personaName?: string;
  mapCurrent?: boolean;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1408px] flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2 sm:px-6">
          <Link to={brandTo} className="me-1 font-heading text-[15px] font-bold leading-tight text-ink no-underline hover:text-ink">
            {brand}
          </Link>
          {chips ? <div className="hidden flex-wrap items-center gap-2 sm:flex">{chips}</div> : null}
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-1">
            <ConceptChip className="w-full rounded-control sm:w-auto sm:rounded-full" />
            <div className="hidden items-center gap-2 sm:flex">
              <RoleSwitcher current={persona} />
              <PlatformMapLink current={mapCurrent} />
              {initial ? <Avatar initial={initial} personaName={personaName} /> : null}
            </div>
          </div>
        </div>
      </header>
      <div className="border-b border-line bg-surface sm:hidden">
        <div className="flex flex-wrap items-center gap-2 px-4 py-1.5">
          <RoleSwitcher current={persona} compact />
          <PlatformMapLink current={mapCurrent} />
          {chips ? <div className="flex w-full flex-wrap gap-2 pb-1">{chips}</div> : null}
        </div>
      </div>
    </>
  );
}
