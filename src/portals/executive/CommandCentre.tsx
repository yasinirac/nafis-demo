import { useState } from 'react';
import { ArrowRight, CircleCheck, RotateCcw } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { Tile } from '@/components/Tile';
import { StatusPill } from '@/components/StatusPill';
import { AiNote } from '@/components/AiNote';
import { Button, TextLink } from '@/components/Button';
import { Field, Select } from '@/components/Field';
import { ChartFrame } from '@/charts/ChartFrame';
import { Funnel } from '@/charts/Funnel';
import {
  attention,
  briefing,
  drillCopy,
  emirates,
  execMeta,
  execTiles,
  funnel,
  funnelStages,
  heroTile,
  periodNote,
  periodOptions,
  sectors,
  tileCopy,
} from '@/data/executive';
import { cx } from '@/lib/cx';
import { formatInt, formatPct } from '@/lib/format';
import { useDomId } from '@/lib/useId';
import { AskPanel } from './AskPanel';
import { HistoryForecast } from './HistoryForecast';
import { MoneyReturn } from './MoneyReturn';
import { CoverageHeatmap } from './CoverageHeatmap';
import { noDrill, type Drill } from './types';

const defaultPeriod = periodOptions[0]?.value ?? '';

/**
 * A <select> always matches :read-only, so the shared control class paints it
 * grey as if disabled. Keep these filters white with ink text.
 */
const selectFix = 'read-only:!bg-surface read-only:!text-ink';

/** Looks like a disabled button while aria-disabled is true. */
const inactiveLook =
  'aria-disabled:cursor-not-allowed aria-disabled:border-line aria-disabled:bg-line2 aria-disabled:text-muted aria-disabled:hover:bg-line2 aria-disabled:hover:text-muted';

function DrillBar({
  drill,
  setDrill,
  period,
  setPeriod,
}: {
  drill: Drill;
  setDrill: (next: Drill) => void;
  period: string;
  setPeriod: (next: string) => void;
}) {
  const crumbId = useDomId('crumb');
  const drilled = drill.sector != null || drill.emirate != null;
  const crumbs = [
    { label: drillCopy.root, chosen: false },
    { label: drill.sector != null ? (sectors[drill.sector] ?? drillCopy.allSectors) : drillCopy.allSectors, chosen: drill.sector != null },
    {
      label: drill.emirate != null ? (emirates[drill.emirate]?.name ?? drillCopy.allEmirates) : drillCopy.allEmirates,
      chosen: drill.emirate != null,
    },
  ];
  return (
    <Card padded={false} className="p-4">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-[240px]">
          <p id={crumbId} className="m-0 mb-1.5 text-sm font-semibold text-ink">
            {drillCopy.breadcrumbLabel}
          </p>
          <ol aria-labelledby={crumbId} className="m-0 flex min-h-touch list-none flex-wrap items-center gap-x-1 gap-y-1 p-0 text-[15px] text-ink">
            {crumbs.map((c, i) => (
              <li key={`${i}-${c.label}`} className="inline-flex items-center gap-1.5">
                {i === 0 ? null : (
                  // The spaces keep the text reading "UAE › All sectors › All emirates" when copied or searched.
                  <span aria-hidden="true" className="px-0.5 text-ink2">
                    {` ${drillCopy.separator} `}
                  </span>
                )}
                <span className={c.chosen ? 'font-semibold text-ink' : 'text-ink'}>{c.label}</span>
              </li>
            ))}
          </ol>
        </div>
        <Field label="Period" className="w-full sm:w-[190px]">
          {({ id }) => (
            <Select id={id} value={period} onChange={(e) => setPeriod(e.target.value)} className={selectFix}>
              {periodOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Emirate" className="w-full sm:w-[190px]">
          {({ id }) => (
            <Select
              id={id}
              className={selectFix}
              value={drill.emirate == null ? '' : String(drill.emirate)}
              onChange={(e) => setDrill({ ...drill, emirate: e.target.value === '' ? null : Number(e.target.value) })}
            >
              <option value="">{drillCopy.allEmirates}</option>
              {emirates.map((em, i) => (
                <option key={em.code} value={String(i)}>
                  {em.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Sector" className="w-full sm:w-[190px]">
          {({ id }) => (
            <Select
              id={id}
              className={selectFix}
              value={drill.sector == null ? '' : String(drill.sector)}
              onChange={(e) => setDrill({ ...drill, sector: e.target.value === '' ? null : Number(e.target.value) })}
            >
              <option value="">{drillCopy.allSectors}</option>
              {sectors.map((s, i) => (
                <option key={s} value={String(i)}>
                  {s}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {/* aria-disabled rather than disabled, so focus stays on the button after it clears the drill-down. */}
        <Button
          onClick={() => {
            if (drilled) setDrill(noDrill);
          }}
          aria-disabled={!drilled}
          icon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
          className={cx('w-full sm:w-auto', inactiveLook)}
        >
          {drillCopy.clear}
        </Button>
      </div>
      {/* The live region is always present so the note is announced when it appears. */}
      <p role="status" className={cx('m-0 text-[13px] leading-snug text-ink2', period !== defaultPeriod && 'mt-3')}>
        {period !== defaultPeriod ? periodNote : null}
      </p>
    </Card>
  );
}

function BriefingCard() {
  const headingId = useDomId('briefing');
  return (
    <Card aria-labelledby={headingId}>
      <CardHeader
        id={headingId}
        title={briefing.title}
        actions={
          <TextLink to="/executive/monthly-pack" className="inline-flex min-h-touch items-center gap-1.5 text-sm no-underline">
            {briefing.packLink}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </TextLink>
        }
        className="mb-2"
      />
      <AiNote agent="Report Writer">{briefing.agentNote}</AiNote>
      <ol className="m-0 mt-3 list-none p-0">
        {briefing.points.map((p, i) => (
          <li key={p.metric} className="flex gap-3 border-t border-line2 py-3 last:pb-0">
            <span aria-hidden="true" className="w-5 shrink-0 pt-px font-heading text-[15px] font-bold text-ink2">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[15px] leading-snug text-ink">
                <span className="font-semibold">{p.lead}</span> {p.text}
              </p>
              <p className="m-0 mt-1.5 text-[13px] leading-snug text-ink2">{p.metric}</p>
              <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink2">
                <span>
                  {tileCopy.confidenceLabel} {p.confidence}
                </span>
                <DataTag status={p.status} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function AttentionCard() {
  const headingId = useDomId('attention');
  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId} title={attention.title} className="mb-2" />
      <ul className="m-0 list-none p-0">
        {attention.items.map((item) => (
          <li key={item.text} className="border-t border-line2 py-3 first:border-t-0 first:pt-1 last:pb-0">
            <StatusPill tone={item.tone}>{item.level}</StatusPill>
            <p className="m-0 mt-1.5 text-sm leading-snug text-ink">{item.text}</p>
            <p className="m-0 mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-ink2">
              <span>{item.area}</span>
              <DataTag status={item.status} />
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function HeroTile() {
  return (
    <div className="flex min-w-0 flex-col gap-5 rounded-card border border-line bg-surface p-5 sm:col-span-2 lg:flex-row lg:items-stretch lg:justify-between xl:col-span-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 text-[15px] font-semibold text-ink">{heroTile.label}</p>
          <DataTag status={heroTile.status} />
        </div>
        <p className="m-0 mt-0.5 text-[13px] text-ink2">{heroTile.kicker}</p>
        <p className="m-0 mt-3 font-heading text-[52px] font-semibold leading-none text-ink">{heroTile.value}</p>
        <p className="m-0 mt-3 max-w-[520px] text-[13px] leading-snug text-ink2">{heroTile.sub}</p>
      </div>
      <div className="min-w-0 rounded-control bg-ground p-4 lg:w-[300px] lg:shrink-0">
        <p className="m-0 mb-2 text-[13px] font-semibold text-ink2">{heroTile.outlookLabel}</p>
        <dl className="m-0 flex flex-col gap-2">
          {heroTile.outlook.map((o) => (
            <div key={o.term} className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-ink2">{o.term}</dt>
              <dd className="tabular m-0 text-[15px] font-semibold text-ink">{o.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function KeyNumbers() {
  const headingId = useDomId('kpis');
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="sr-only">
        {tileCopy.keyNumbersLabel}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HeroTile />
        {execTiles.map((t, i) => (
          <Tile
            key={t.id}
            label={t.label}
            value={t.value}
            status={t.status}
            sub={t.sub}
            className={i === 0 ? 'sm:col-span-2 xl:col-span-1' : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function FunnelCard() {
  const table = {
    caption: funnel.title,
    columns: [
      { key: 'stage', label: funnel.tableStage },
      { key: 'people', label: funnel.tablePeople, numeric: true },
      { key: 'conversion', label: funnel.tableConversion, numeric: true },
    ],
    rows: funnelStages.map((s) => ({
      stage: s.label,
      people: formatInt(s.value),
      conversion: s.conversion != null ? formatPct(s.conversion) : undefined,
    })),
  };
  return (
    <ChartFrame title={funnel.title} titleAs="h2" subtitle={funnel.subtitle} status={funnel.status} table={table}>
      <Funnel ariaLabel={funnel.ariaLabel} stages={funnelStages} />
      <p className="m-0 mt-4 rounded-control bg-ground px-4 py-3 text-sm leading-relaxed text-ink">{funnel.note}</p>
    </ChartFrame>
  );
}

/** Executive Command Centre home for the chief executive. */
export function CommandCentre() {
  const [period, setPeriod] = useState(defaultPeriod);
  const [drill, setDrill] = useState<Drill>(noDrill);

  function selectCell(cell: { row: number; col: number }) {
    const same = drill.sector === cell.row && drill.emirate === cell.col;
    setDrill(same ? noDrill : { sector: cell.row, emirate: cell.col });
  }

  return (
    <AppShell portal="executive" persona="chief">
      <PageHeader
        title={execMeta.title}
        description={execMeta.lead}
        chips={
          <Chip tone="good" icon={<CircleCheck aria-hidden="true" className="h-4 w-4 text-good-icon" />}>
            {execMeta.freshness}
          </Chip>
        }
      />
      <div className="flex flex-col gap-4">
        <DrillBar drill={drill} setDrill={setDrill} period={period} setPeriod={setPeriod} />
        <AskPanel />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <BriefingCard />
          <AttentionCard />
        </div>
        <KeyNumbers />
        <HistoryForecast />
        <MoneyReturn />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <FunnelCard />
          <CoverageHeatmap drill={drill} onSelect={selectCell} />
        </div>
      </div>
    </AppShell>
  );
}
