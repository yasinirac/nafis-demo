import { useEffect, useRef, useState } from 'react';
import { BookmarkPlus, Camera, ChevronDown, CircleCheck, FlaskConical, Hourglass, Play, Send, Tag, TriangleAlert } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { AiNote } from '@/components/AiNote';
import { Button } from '@/components/Button';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { DataTable, type Column } from '@/components/DataTable';
import { Field, TextArea } from '@/components/Field';
import { StatusPill } from '@/components/StatusPill';
import { Tabs } from '@/components/Tabs';
import { ChartFrame, type LegendItem } from '@/charts/ChartFrame';
import { StepLines } from '@/charts/StepLines';
import { chartColors } from '@/charts/core';
import { CodePanel } from '@/components/CodePanel';
import { cx } from '@/lib/cx';
import { fill, formatInt, formatPct } from '@/lib/format';
import { useDomId } from '@/lib/useId';
import {
  analystCopy as copy,
  checkStates,
  cohortChart,
  cohortSurvival,
  copilotSummary,
  generatedSql,
  isHidden,
  questionMetricId,
  releaseChecks,
  retentionBySector,
  roundedTotals,

  type RetentionCell,
  type SectorRow,
} from '@/data/analyst';
import { certifiedMetrics, metricsCopy } from '@/data/metrics';

type ResultTab = 'table' | 'cohorts' | 'sql';

/**
 * Older cohorts lighter, the newest darkest. Steps 1, 3 and 4 of the ordinal
 * ramp keep the three lines apart; end labels and the table carry the values.
 */
const cohortColors = [chartColors.ord[0], chartColors.ord[2], chartColors.ord[3]];

function HiresCell({ cell }: { cell: RetentionCell }) {
  if (isHidden(cell)) return <Hidden />;
  return <>{formatInt(cell.hires)}</>;
}

/** The value keeps the column's right edge; a wide interval sits on its own line under it. */
function S12Cell({ cell }: { cell: RetentionCell }) {
  if (isHidden(cell) || cell.s12 == null) return <Hidden />;
  return (
    <>
      {formatPct(cell.s12)}
      {cell.interval != null ? (
        <span className="relative mt-0.5 flex items-center justify-end gap-1 whitespace-nowrap text-[12px] font-medium leading-tight text-warn-text">
          <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span aria-hidden="true">{fill(copy.table.intervalLabel, { n: cell.interval })}</span>
          <span className="sr-only">{fill(copy.table.intervalSr, { n: cell.interval })}</span>
        </span>
      ) : null}
    </>
  );
}

function Hidden() {
  return (
    <span className="relative text-ink2">
      <span aria-hidden="true">—</span>
      <span className="sr-only">{copy.table.hiddenSr}</span>
    </span>
  );
}

const columns: Column<SectorRow>[] = [
  { key: 'sector', header: copy.table.columns.sector, rowHeader: true, render: (r) => r.sector },
  { key: 'shj-hires', header: copy.table.columns.shjHires, numeric: true, render: (r) => <HiresCell cell={r.sharjah} /> },
  { key: 'shj-s12', header: copy.table.columns.shjS12, numeric: true, render: (r) => <S12Cell cell={r.sharjah} /> },
  { key: 'dxb-hires', header: copy.table.columns.dxbHires, numeric: true, render: (r) => <HiresCell cell={r.dubai} /> },
  { key: 'dxb-s12', header: copy.table.columns.dxbS12, numeric: true, render: (r) => <S12Cell cell={r.dubai} /> },
];

function TableView() {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[13px] leading-snug text-ink2 sm:hidden">{copy.table.scrollHint}</p>
      <DataTable
        caption={copy.table.caption}
        hideCaption
        columns={columns}
        rows={retentionBySector.value}
        getKey={(r) => r.sector}
        footer={
          <tr className="border-t border-line">
            <th scope="row" className="whitespace-nowrap px-3 py-3 text-left text-[13px] font-semibold text-ink2">
              {copy.table.totalLabel}
            </th>
            <td className="tabular px-3 py-3 text-right text-ink">
              {fill(copy.table.totalValue, { n: formatInt(roundedTotals.sharjah.value) })}
            </td>
            <td className="px-3 py-3" />
            <td className="tabular px-3 py-3 text-right text-ink">
              {fill(copy.table.totalValue, { n: formatInt(roundedTotals.dubai.value) })}
            </td>
            <td className="px-3 py-3" />
          </tr>
        }
      />
      <p className="m-0 text-[13px] leading-relaxed text-ink2">{copy.table.note}</p>
      <div className="rounded-control border border-line bg-ground px-4 py-3">
        <p className="m-0 text-sm leading-relaxed text-ink">{copilotSummary}</p>
        <AiNote agent="Analyst Copilot" prefix={copy.summary.prefix} className="mt-2">
          {copy.summary.note}
        </AiNote>
      </div>
    </div>
  );
}

function CohortsView() {
  const { months, cohorts } = cohortSurvival.value;
  const series = cohorts.map((c, i) => {
    const last = c.values[c.values.length - 1] ?? 0;
    return {
      id: c.id,
      label: c.label,
      color: cohortColors[i] ?? chartColors.series1,
      points: c.values.map((v, j) => ({ x: months[j] ?? 0, y: v })),
      endLabel: fill(copy.cohorts.endLabel, { year: c.year, value: formatPct(last) }),
    };
  });
  const legend: LegendItem[] = series.map((s) => ({ label: s.label, color: s.color, kind: 'line' }));
  const valueAt = (values: number[], month: number) => {
    const j = months.indexOf(month);
    return j >= 0 && j < values.length ? (values[j] ?? null) : null;
  };
  return (
    <ChartFrame
      card={false}
      title={copy.cohorts.title}
      subtitle={copy.cohorts.subtitle}
      status={cohortSurvival.status}
      legend={legend}
      footnote={copy.cohorts.footnote}
      table={{
        caption: copy.cohorts.title,
        columns: [
          { key: 'month', label: copy.cohorts.monthColumn },
          ...cohorts.map((c) => ({ key: c.id, label: c.label, numeric: true })),
        ],
        rows: months.map((m) => {
          const row: Record<string, string> = { month: String(m) };
          cohorts.forEach((c) => {
            const v = valueAt(c.values, m);
            row[c.id] = v == null ? copy.cohorts.notYet : formatPct(v);
          });
          return row;
        }),
      }}
    >
      <StepLines
        ariaLabel={copy.cohorts.ariaLabel}
        xValues={months}
        xTicks={cohortChart.xTicks}
        formatX={(m) => String(m)}
        formatY={(v) => formatPct(v)}
        yDomain={cohortChart.yDomain}
        yTicks={cohortChart.yTicks}
        series={series}
        height={300}
        rightMargin={88}
        tooltipTitle={(m) => fill(copy.cohorts.tooltipTitle, { m })}
        tooltipRows={(m) =>
          cohorts.flatMap((c, i) => {
            const v = valueAt(c.values, m);
            return v == null
              ? []
              : [{ label: c.label, value: formatPct(v), color: cohortColors[i] ?? chartColors.series1, kind: 'line' as const }];
          })
        }
        pointLabel={(m) =>
          fill(copy.cohorts.pointLabel, {
            title: fill(copy.cohorts.tooltipTitle, { m }),
            rows: cohorts
              .map((c) => {
                const v = valueAt(c.values, m);
                return `${c.label} ${v == null ? copy.cohorts.notYet.toLowerCase() : formatPct(v)}`;
              })
              .join('; '),
          })
        }
      />
      <p className="m-0 mt-1 pe-[88px] text-end text-[12px] text-ink2">{copy.cohorts.xAxis}</p>
    </ChartFrame>
  );
}

function SqlView() {
  return (
    <div className="flex flex-col gap-3">
      <AiNote agent="Analyst Copilot" prefix={copy.sql.prefix}>
        {copy.sql.note}
      </AiNote>
      <CodePanel label={copy.sql.regionLabel} lines={generatedSql} comment="--" />
      <p className="m-0 text-[13px] leading-relaxed text-ink2">{copy.sql.footnote}</p>
    </div>
  );
}

function ReleaseCheckCard() {
  const [linkageOpen, setLinkageOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [added, setAdded] = useState(false);
  const linkageId = useDomId('linkage');
  const message = [requested ? copy.release.requested : '', added ? copy.release.added : ''].filter(Boolean).join(' ');

  return (
    <Card aria-labelledby="release-heading">
      <CardHeader
        id="release-heading"
        title={copy.release.heading}
        description={
          <Chip tone="neutral" size="sm" className="mt-1" icon={<Tag aria-hidden="true" className="h-3.5 w-3.5" />}>
            {copy.release.label}
          </Chip>
        }
      />
      <ul className="m-0 flex list-none flex-col p-0">
        {releaseChecks.map((check) => {
          const state = checkStates[check.state];
          return (
            <li key={check.id} className="border-t border-line2 py-3 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <StatusPill tone={state.tone}>{state.label}</StatusPill>
                <span className="text-sm font-semibold text-ink">{check.title}</span>
              </div>
              <p className="m-0 mt-1.5 text-[13px] leading-snug text-ink2">{check.detail}</p>
              {check.id === 'export' ? (
                <>
                  <button
                    type="button"
                    aria-expanded={linkageOpen}
                    aria-controls={linkageId}
                    onClick={() => setLinkageOpen((v) => !v)}
                    className="-ms-1 mt-1 inline-flex min-h-touch items-center gap-1 rounded-control px-1 text-[13px] font-medium text-accent hover:text-accent-hover hover:underline"
                  >
                    {copy.linkage.toggle}
                    <ChevronDown aria-hidden="true" className={cx('h-4 w-4 transition-transform', linkageOpen && 'rotate-180')} />
                  </button>
                  <div id={linkageId} hidden={!linkageOpen} className="rounded-control bg-ground px-3 py-2.5 text-[13px] leading-snug text-ink">
                    <p className="m-0">{copy.linkage.intro}</p>
                    <ul className="m-0 mt-1.5 list-disc ps-5">
                      {copy.linkage.items.map((item) => (
                        <li key={item} className="py-0.5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex flex-wrap gap-2 border-t border-line2 pt-4">
        <Button variant="primary" size="sm" icon={<Send aria-hidden="true" className="h-4 w-4" />} onClick={() => setRequested(true)}>
          {copy.release.request}
        </Button>
        <Button variant="secondary" size="sm" icon={<BookmarkPlus aria-hidden="true" className="h-4 w-4" />} onClick={() => setAdded(true)}>
          {copy.release.add}
        </Button>
      </div>
      <p role="status" className={cx('m-0 text-[13px] leading-snug text-ink', message && 'mt-3 rounded-control bg-good-bg px-3 py-2')}>
        {message}
      </p>
      <p className="m-0 mt-3 text-[13px] leading-relaxed text-ink2">{copy.release.note}</p>
    </Card>
  );
}

function CertifiedMetricsCard() {
  return (
    <Card aria-labelledby="metrics-heading" padding="sm">
      <CardHeader id="metrics-heading" title={metricsCopy.heading} description={metricsCopy.lead} />
      <ul className="m-0 list-none p-0">
        {certifiedMetrics.map((m) => (
          <li
            key={m.id}
            className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-baseline gap-x-2 border-t border-line2 py-2 text-[13px] leading-snug first:border-t-0 first:pt-0"
          >
            <span className="tabular font-semibold text-ink2">{m.id}</span>
            <span className="min-w-0 text-ink">
              {m.name}
              {m.id === questionMetricId ? (
                <span className="mt-1 block">
                  <Chip size="sm" tone="neutral">
                    {metricsCopy.inUse}
                  </Chip>
                </span>
              ) : null}
            </span>
            <span className="tabular text-ink2">{m.version}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-3 border-t border-line2 pt-3 text-[13px] leading-relaxed text-ink2">{metricsCopy.note}</p>
    </Card>
  );
}

export function AnalystWorkbench() {
  const sample = copy.question.sample;
  const [question, setQuestion] = useState(sample);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<ResultTab>('table');
  const [saves, setSaves] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const edited = question.trim() !== sample;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function run() {
    window.clearTimeout(timer.current);
    setRunning(true);
    timer.current = window.setTimeout(() => setRunning(false), 700);
  }

  const saveMessage =
    saves === 0 ? '' : fill(saves === 1 ? copy.run.saved : copy.run.savedAgain, { title: copy.run.notebookTitle });

  return (
    <AppShell portal="analyst" persona="noor" navExtra={<CertifiedMetricsCard />}>
      <PageHeader
        title={copy.title}
        description={copy.lead}
        chips={
          <>
            <Chip tone="good" icon={<CircleCheck aria-hidden="true" className="h-4 w-4 text-good-icon" />}>
              {copy.grades.final}
            </Chip>
            <Chip tone="warning" icon={<Hourglass aria-hidden="true" className="h-4 w-4" />}>
              {copy.grades.provisional}
            </Chip>
            <Chip icon={<Camera aria-hidden="true" className="h-4 w-4" />}>{copy.grades.snapshot}</Chip>
            <Chip icon={<FlaskConical aria-hidden="true" className="h-4 w-4" />}>{copy.grades.synthetic}</Chip>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card aria-labelledby="question-heading">
            <CardHeader id="question-heading" title={copy.question.heading} />
            <Field label={copy.question.label} hideLabel>
              {(ids) => (
                <TextArea
                  id={ids.id}
                  aria-describedby={ids.describedBy}
                  rows={2}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="!min-h-[60px] text-base [field-sizing:content]"
                />
              )}
            </Field>
            <div className="mt-3 rounded-control border border-line bg-ground px-4 py-3">
              <p className="m-0 text-sm leading-relaxed text-ink">
                <span className="me-1.5 font-semibold">{copy.readAs.label}</span>
                {copy.readAs.text}
              </p>
              <AiNote agent="Analyst Copilot" className="mt-2">
                {copy.readAs.note}
              </AiNote>
              {edited ? (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3">
                  <p className="m-0 min-w-0 flex-1 basis-[260px] text-[13px] leading-snug text-ink2">{copy.question.edited}</p>
                  <Button variant="ghost" size="sm" onClick={() => setQuestion(sample)}>
                    {copy.question.reset}
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="primary" icon={<Play aria-hidden="true" className="h-4 w-4" />} onClick={run}>
                {copy.run.run}
              </Button>
              <Button icon={<BookmarkPlus aria-hidden="true" className="h-4 w-4" />} onClick={() => setSaves((n) => n + 1)}>
                {copy.run.save}
              </Button>
              <p role="status" className="m-0 text-[13px] text-ink2">
                {running ? copy.run.running : copy.run.done}
              </p>
            </div>
            <p role="status" className={cx('m-0 text-[13px] text-ink', saveMessage && 'mt-3')}>
              {saveMessage}
            </p>
          </Card>

          <Card aria-labelledby="result-heading">
            <CardHeader
              id="result-heading"
              title={copy.result.heading}
              actions={<DataTag status={retentionBySector.status} asOf={retentionBySector.asOf} />}
            />
            <div aria-busy={running} className={cx('transition-opacity', running && 'opacity-50')}>
              <Tabs<ResultTab>
                label={copy.result.tabsLabel}
                value={tab}
                onChange={setTab}
                tabs={[
                  { id: 'table', label: copy.result.tabs.table, content: <TableView /> },
                  { id: 'cohorts', label: copy.result.tabs.cohorts, content: <CohortsView /> },
                  { id: 'sql', label: copy.result.tabs.sql, content: <SqlView /> },
                ]}
              />
            </div>
          </Card>

        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <ReleaseCheckCard />
        </div>
      </div>
    </AppShell>
  );
}
