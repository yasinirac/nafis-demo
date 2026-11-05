import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cx } from '@/lib/cx';
import { fill } from '@/lib/format';
import { Chip, DataTag } from '@/components/Chip';
import { SkipLink, TopBar } from '@/app/TopBar';
import { coreCards, platformCounts, portalGroups, portals, type PortalInfo } from '@/data/platform';
import { statusDescriptions, statusLabels, tierLabels, type DataStatus } from '@/data/types';
import { mapCopy } from '@/data/mapCopy';

function PortalCard({ portal }: { portal: PortalInfo }) {
  const headingId = `portal-${portal.id}`;
  return (
    <article aria-labelledby={headingId} className="flex min-w-0 flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cx(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] font-heading font-bold',
            portal.group === 'served' ? 'bg-accent-tint text-accent' : 'bg-line2 text-ink',
          )}
        >
          {portal.number}
        </span>
        <div className="min-w-0">
          <h3 id={headingId} className="m-0 text-[18px] font-semibold leading-snug">
            {portal.name}
          </h3>
          <p className="m-0 text-[13px] leading-snug text-ink2">{portal.channel}</p>
        </div>
      </div>
      <div className="rounded-control bg-ground px-3 py-2 text-[13px] leading-snug">
        <p className="m-0">
          <span className="font-semibold">Sees: </span>
          {portal.sees}
        </p>
        <p className="m-0 mt-1.5 flex flex-wrap gap-1.5">
          {portal.tiers.map((t) => (
            <Chip key={t} size="sm" tone="outline">
              {tierLabels[t]}
            </Chip>
          ))}
        </p>
      </div>
      <div>
        <p className="m-0 mb-1 text-[13px] font-semibold text-ink2">{mapCopy.builtLabel}</p>
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          {portal.built.map((screen) => (
            <li key={screen.path}>
              <Link
                to={screen.path}
                className="inline-flex min-h-touch items-center gap-1.5 rounded-control text-[15px] font-semibold no-underline hover:underline"
              >
                {screen.label}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto border-t border-line2 pt-3">
        <p className="m-0 text-[13px] leading-relaxed text-muted">
          <span className="font-semibold text-ink2">{mapCopy.plannedLabel} </span>
          {portal.planned.join(' · ')}
        </p>
      </div>
    </article>
  );
}

const statusOrder: DataStatus[] = ['published', 'sample', 'estimate', 'provisional', 'illustrative'];

export function PlatformMap() {
  const listed = `${Math.floor(platformCounts.planned / 10) * 10}+`;
  return (
    <div className="min-h-screen bg-ground">
      <SkipLink />
      <TopBar brand="NAFIS · Platform map" brandTo="/" persona={null} mapCurrent />
      <main id="main" tabIndex={-1} className="mx-auto flex max-w-[1408px] flex-col gap-8 px-4 pb-16 pt-8 focus:outline-none sm:px-6">
        <header className="flex flex-col gap-2">
          <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">{mapCopy.eyebrow}</p>
          <h1 className="m-0 text-[34px] font-bold leading-tight">{mapCopy.title}</h1>
          <p className="m-0 max-w-[780px] text-base leading-relaxed text-ink2">{mapCopy.lead}</p>
        </header>

        <section aria-labelledby="core-heading">
          <h2 id="core-heading" className="m-0 mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink2">
            {mapCopy.coreHeading}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {coreCards.map((card) => (
              <div
                key={card.title}
                className={cx(
                  'flex min-w-0 flex-col gap-2 rounded-card p-5',
                  card.accent ? 'border-2 border-accent bg-accent-tint' : 'border border-line bg-surface',
                )}
              >
                <h3 className="m-0 text-[18px] font-semibold">{card.title}</h3>
                <p className="m-0 text-sm leading-relaxed text-ink">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {(['served', 'runs'] as const).map((group) => (
          <section key={group} aria-labelledby={`group-${group}`}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 id={`group-${group}`} className="m-0 text-[20px] font-semibold">
                {portalGroups[group].title}
              </h2>
              <p className="m-0 text-sm text-ink2">{portalGroups[group].description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {portals
                .filter((p) => p.group === group)
                .map((portal) => (
                  <PortalCard key={portal.id} portal={portal} />
                ))}
            </div>
          </section>
        ))}

        <section aria-labelledby="status-heading" className="rounded-card border border-line bg-surface p-5">
          <h2 id="status-heading" className="m-0 mb-1 text-[17px] font-semibold">
            {mapCopy.statusHeading}
          </h2>
          <p className="m-0 mb-3 text-sm text-ink2">{mapCopy.statusLead}</p>
          <dl className="m-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {statusOrder.map((s) => (
              <div key={s} className="min-w-0">
                <dt>
                  <DataTag status={s} />
                  <span className="sr-only">{statusLabels[s]}</span>
                </dt>
                <dd className="m-0 mt-1 text-[13px] leading-snug text-ink2">{statusDescriptions[s]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-4 text-[13px] leading-relaxed text-ink2">
          <span className="font-semibold text-ink">{fill(mapCopy.footerCount, { built: platformCounts.built, listed })}</span>
          {mapCopy.footerNotes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </footer>
      </main>
    </div>
  );
}
