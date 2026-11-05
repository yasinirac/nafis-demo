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
        'inline-flex min-h-touch items-center gap-1.5 rounded-control px-3 text-sm font-medium no-underline',
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

/**
 * Sticky top bar: brand, organisation and role chips, the concept chip,
 * the role switcher, the Platform map link and the persona's initial.
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
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1408px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
        <Link to={brandTo} className="me-1 font-heading text-[15px] font-bold leading-tight text-ink no-underline hover:text-ink">
          {brand}
        </Link>
        {chips ? <div className="flex flex-wrap items-center gap-2">{chips}</div> : null}
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <ConceptChip />
          <RoleSwitcher current={persona} />
          <PlatformMapLink current={mapCurrent} />
          {initial ? (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
              <span aria-hidden="true">{initial}</span>
              <span className="sr-only">Demo persona: {personaName}</span>
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
