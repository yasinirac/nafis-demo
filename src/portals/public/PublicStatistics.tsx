import { useState, type ReactNode } from 'react';
import { BookOpen, CodeXml, Download, MessageSquareWarning } from 'lucide-react';
import { Card, CardHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { Tile } from '@/components/Tile';
import { Button, ButtonLink } from '@/components/Button';
import { DataTable, type Column } from '@/components/DataTable';
import { ChartFrame } from '@/charts/ChartFrame';
import { Bars, type BarDatum } from '@/charts/Bars';
import { chartColors, useMeasure } from '@/charts/core';
import {
  allTablesCsvRows,
  countBars,
  countsChart,
  countsCsvRows,
  dataDictionary,
  emiratesPlanned,
  formatRange,
  howWeCount,
  publicHero,
  publicMeta,
  publicTiles,
  releases,
  sectorRetention,
  type SectorRetentionRow,
} from '@/data/publicStats';
import { cx } from '@/lib/cx';
import { fill, formatCompact, formatInt, formatPct } from '@/lib/format';
import { useDomId } from '@/lib/useId';
import { downloadCsv } from './csv';
import { PublicShell } from './PublicShell';

/** An in-page section the site nav can jump to. */
function Section({ id, labelledBy, className, children }: { id: string; labelledBy: string; className?: string; children: ReactNode }) {
  return (
    // scroll-mt clears the sticky concept strip when the site nav jumps here.
    <section id={id} tabIndex={-1} aria-labelledby={labelledBy} className={cx('min-w-0 scroll-mt-20 focus:outline-none', className)}>
      {children}
    </section>
  );
}

/** "—" for a suppressed cell. The wrapper is positioned so the hidden words stay inside the table's scroll region. */
function NotPublished() {
  return (
    <span className="relative">
      <span aria-hidden="true" className="text-ink2">
        —
      </span>
      <span className="sr-only">{sectorRetention.notPublished}</span>
    </span>
  );
}

function CountsChart() {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [message, setMessage] = useState('');
  const latestKey = countBars.find((b) => b.latest)?.key ?? '';
  const data: BarDatum[] = countBars.map((b) => ({
    key: b.key,
    label: b.label,
    value: b.value,
    valueLabel: b.valueLabel,
    sublabel: b.sublabel,
    color: b.latest ? chartColors.ord[0] : chartColors.series1,
  }));
  const labelAll = width >= 900;
  const narrow = width > 0 && width < 480;
  const table = {
    caption: countsChart.title,
    columns: [
      { key: 'period', label: countsChart.tablePeriod },
      { key: 'value', label: countsChart.tableValue, numeric: true },
      { key: 'note', label: countsChart.tableNote },
    ],
    rows: countBars.map((b) => ({ period: b.label, value: b.valueLabel, note: b.note })),
  };

  function onDownload() {
    downloadCsv(countsChart.fileName, countsCsvRows());
    setMessage(fill(releases.downloaded, { file: countsChart.fileName }));
  }

  return (
    <ChartFrame
      title={countsChart.title}
      titleAs="h2"
      status="published"
      legend={[
        { label: countsChart.legendYearEnd, color: chartColors.series1, kind: 'rect' },
        { label: countsChart.legendLatest, color: chartColors.ord[0], kind: 'rect' },
      ]}
      table={table}
      actions={
        <Button size="sm" onClick={onDownload} icon={<Download aria-hidden="true" className="h-4 w-4" />}>
          {countsChart.download}
        </Button>
      }
      footnote={countsChart.caption}
    >
      <div ref={ref}>
        <Bars
          ariaLabel={countsChart.ariaLabel}
          data={data}
          orientation="vertical"
          height={300}
          formatTick={formatCompact}
          labelKeys={labelAll ? undefined : [latestKey]}
          marker={{ beforeKey: countsChart.markerBeforeKey, label: narrow ? countsChart.markerShort : countsChart.marker }}
          tooltipTitle={(d) => d.label}
        />
      </div>
      <p role="status" className="m-0 mt-2 min-h-[1px] text-[13px] text-ink2">
        {message}
      </p>
    </ChartFrame>
  );
}

/** Column headers may wrap so the table fits a phone screen without scrolling. */
function WrapHeader({ children }: { children: ReactNode }) {
  return <span className="whitespace-normal">{children}</span>;
}

const sectorColumns: Column<SectorRetentionRow>[] = [
  {
    key: 'sector',
    header: sectorRetention.columns.sector,
    rowHeader: true,
    render: (r) =>
      r.hires == null ? (
        <>
          <span className="block">{r.sector}</span>
          <span className="block text-[13px] font-normal text-ink2">{sectorRetention.rowNotPublished}</span>
        </>
      ) : (
        r.sector
      ),
  },
  {
    key: 'hires',
    header: <WrapHeader>{sectorRetention.columns.hires}</WrapHeader>,
    numeric: true,
    render: (r) => (r.hires == null ? <NotPublished /> : formatInt(r.hires)),
  },
  {
    key: 's12',
    header: (
      <WrapHeader>
        <span className="sm:hidden">{sectorRetention.s12Short}</span>
        <span className="hidden sm:inline">{sectorRetention.columns.s12}</span>
      </WrapHeader>
    ),
    numeric: true,
    render: (r) => (r.s12 != null ? formatPct(r.s12) : <NotPublished />),
  },
  {
    key: 'range',
    header: <WrapHeader>{sectorRetention.columns.range}</WrapHeader>,
    numeric: true,
    render: (r) => (r.low == null ? <NotPublished /> : <span className="whitespace-nowrap">{formatRange(r)}</span>),
  },
];

function ReleasesCard({ headingId }: { headingId: string }) {
  const dictId = useDomId('dictionary');
  const reportId = useDomId('report');
  const [dictOpen, setDictOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [message, setMessage] = useState('');

  function onDownloadAll() {
    downloadCsv(releases.allTablesFile, allTablesCsvRows());
    setMessage(fill(releases.downloaded, { file: releases.allTablesFile }));
  }

  return (
    <Card>
      <CardHeader id={headingId} title={releases.title} className="mb-3" />
      <p className="m-0 text-[15px] leading-relaxed text-ink">
        <span className="font-semibold">{releases.nextLabel}:</span> {releases.next}
      </p>
      <p className="m-0 mt-1 text-sm leading-relaxed text-ink2">{releases.schedule}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onDownloadAll} icon={<Download aria-hidden="true" className="h-4 w-4" />}>
          {releases.allTables}
        </Button>
        <Button
          aria-expanded={dictOpen}
          aria-controls={dictId}
          onClick={() => setDictOpen((v) => !v)}
          icon={<BookOpen aria-hidden="true" className="h-4 w-4" />}
        >
          {releases.dictionary}
        </Button>
        <ButtonLink to="/developer" icon={<CodeXml aria-hidden="true" className="h-4 w-4" />}>
          {releases.api}
        </ButtonLink>
      </div>
      <p role="status" className="m-0 mt-2 text-[13px] text-ink2">
        {message}
      </p>
      <div id={dictId} hidden={!dictOpen}>
        <dl className="m-0 mt-3 flex flex-col gap-3 rounded-control bg-ground p-4">
          {dataDictionary.map((d) => (
            <div key={d.term}>
              <dt className="text-sm font-semibold text-ink">{d.term}</dt>
              <dd className="m-0 mt-0.5 text-sm leading-snug text-ink2">{d.definition}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-3 border-t border-line2 pt-2">
        <button
          type="button"
          aria-expanded={reportOpen}
          aria-controls={reportId}
          onClick={() => setReportOpen((v) => !v)}
          className="inline-flex min-h-touch items-center gap-2 rounded-control text-sm font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline"
        >
          <MessageSquareWarning aria-hidden="true" className="h-4 w-4" />
          {releases.report}
        </button>
        <div id={reportId} hidden={!reportOpen}>
          <p className="m-0 mt-1 text-sm leading-relaxed text-ink2">{releases.reportNote}</p>
        </div>
      </div>
    </Card>
  );
}

/** Public statistics: published counts, an illustrative retention table, how we count and the release calendar. */
export function PublicStatistics() {
  const ids = {
    overview: useDomId('overview'),
    sectors: useDomId('sectors'),
    emirates: useDomId('emirates'),
    count: useDomId('count'),
    downloads: useDomId('downloads'),
  };

  return (
    <PublicShell>
      <Section id="overview" labelledBy={ids.overview}>
        <p className="m-0 mb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink2">{publicMeta.eyebrow}</p>
        <h1 id={ids.overview} className="m-0 text-[30px] font-bold leading-tight text-ink sm:text-[34px]">
          {publicMeta.title}
        </h1>
        <p className="m-0 mt-2 max-w-[760px] text-base leading-relaxed text-ink2">{publicMeta.lead}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col justify-center gap-3 rounded-card border border-line bg-surface p-6">
            <p className="m-0 text-[15px] font-medium text-ink2">{publicHero.label}</p>
            <p className="m-0 font-heading text-[52px] font-semibold leading-none text-ink sm:text-[60px]">{publicHero.value}</p>
            <p className="m-0 flex flex-wrap items-center gap-2 text-sm text-ink2">
              <DataTag status={publicHero.status} />
              <span>{publicHero.context}</span>
            </p>
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {publicTiles.map((t) => (
              <Tile key={t.id} label={t.label} value={t.value} status={t.status} sub={t.sub} />
            ))}
          </div>
        </div>
      </Section>

      <CountsChart />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Section id="sectors" labelledBy={ids.sectors}>
            <Card>
              <CardHeader
                id={ids.sectors}
                title={sectorRetention.title}
                description={sectorRetention.subtitle}
                actions={<DataTag status={sectorRetention.status} />}
                className="mb-3"
              />
              <DataTable
                caption={sectorRetention.title}
                hideCaption
                regionLabel={sectorRetention.regionLabel}
                columns={sectorColumns}
                rows={sectorRetention.rows}
                getKey={(r) => r.sector}
                dense
              />
              <p className="m-0 mt-3 text-[13px] leading-relaxed text-ink2">{sectorRetention.note}</p>
            </Card>
          </Section>
          <Section id="emirates" labelledBy={ids.emirates}>
            <Card>
              <CardHeader id={ids.emirates} title={emiratesPlanned.title} actions={<Chip tone="neutral">{emiratesPlanned.status}</Chip>} className="mb-2" />
              <p className="m-0 text-sm leading-relaxed text-ink2">{emiratesPlanned.text}</p>
            </Card>
          </Section>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Section id="how-we-count" labelledBy={ids.count}>
            <Card>
              <CardHeader id={ids.count} title={howWeCount.title} className="mb-3" />
              <ul className="m-0 flex list-disc flex-col gap-2 ps-5 text-[15px] leading-relaxed text-ink marker:text-ink2">
                {howWeCount.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Card>
          </Section>
          <Section id="downloads" labelledBy={ids.downloads}>
            <ReleasesCard headingId={ids.downloads} />
          </Section>
        </div>
      </div>
    </PublicShell>
  );
}
