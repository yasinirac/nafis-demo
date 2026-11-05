import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, TrendingUp, Undo2 } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { AiNote } from '@/components/AiNote';
import { Button, ButtonLink, TextLink } from '@/components/Button';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { DataTag } from '@/components/Chip';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { Tile } from '@/components/Tile';
import { Bars, type BarDatum } from '@/charts/Bars';
import { ChartFrame } from '@/charts/ChartFrame';
import { chartColors } from '@/charts/core';
import { fill, formatAED, formatInt, formatNumber, formatPct } from '@/lib/format';
import {
  agentActions,
  contribution,
  dashboardCopy as copy,
  employerScenario,
  eqs,
  legalCount,
  money,
  pipeline,
  qualityLowestKey,
  qualityParts,
  qualityPoints,
  qualityScaleMax,
  qualityTotal,
  qualityWeightTotal,
  reportsDue,
  retention,
  teamRows,
  tenureSummary,
  type ActionKey,
  type AgentAction,
  type TeamRow,
} from '@/data/employer';
import { focusInView } from './focus';

const sectionHeading = 'm-0 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink2';

/** A trend label: icon plus word, styled like a good-tone StatusPill. */
function TrendPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-good-bg px-2.5 py-1 text-[13px] font-medium leading-tight text-ink">
      <TrendingUp aria-hidden="true" className="h-4 w-4 shrink-0 text-good-icon" strokeWidth={2} />
      <span className="min-w-0">{children}</span>
    </span>
  );
}

function TenureDisclosure() {
  const t = copy.tenure;
  type Row = (typeof tenureSummary)[number];
  // The long headers may wrap (DataTable keeps headers on one line), so all four columns fit at phone width.
  const columns: Column<Row>[] = [
    { key: 'band', header: t.columns.band, rowHeader: true, className: '!whitespace-normal', render: (r) => r.label },
    { key: 'weight', header: t.columns.weight, numeric: true, render: (r) => formatNumber(r.weight, 1) },
    { key: 'people', header: t.columns.people, numeric: true, render: (r) => formatInt(r.people.value) },
    { key: 'countsAs', header: t.columns.countsAs, numeric: true, className: '!whitespace-normal', render: (r) => formatNumber(r.countsAs.value, 1) },
  ];
  return (
    <details className="group rounded-card border border-line bg-surface">
      <summary className="flex min-h-touch cursor-pointer list-none items-center gap-2 rounded-card px-5 py-2 text-sm font-medium text-accent hover:text-accent-hover [&::-webkit-details-marker]:hidden">
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
        <span>{t.summary}</span>
      </summary>
      <div className="grid gap-5 border-t border-line2 px-5 pb-5 pt-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2 text-sm leading-relaxed">
          <p className="m-0 text-ink">{t.rule}</p>
          <p className="m-0 text-ink2">{t.why}</p>
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="m-0 text-[13px] font-semibold text-ink2">{t.caption}</p>
            <DataTag status={legalCount.weighted.status} />
          </div>
          <DataTable
            dense
            caption={t.caption}
            hideCaption
            columns={columns}
            rows={tenureSummary}
            getKey={(r) => r.key}
            footer={
              <tr className="border-t border-line">
                <th scope="row" className="px-3 py-2 text-start font-semibold text-ink">
                  {t.total}
                </th>
                <td className="px-3 py-2" />
                <td className="tabular px-3 py-2 text-right font-semibold text-ink">{formatInt(legalCount.counted.value)}</td>
                <td className="tabular px-3 py-2 text-right font-semibold text-ink">{formatNumber(legalCount.weighted.value, 1)}</td>
              </tr>
            }
          />
        </div>
      </div>
    </details>
  );
}

/** Tile labels share a two-line box on wide screens so the five values line up. */
function TileLabel({ children }: { children: ReactNode }) {
  return <span className="block lg:min-h-[2.75em]">{children}</span>;
}

function KeyFigures() {
  const t = copy.tiles;
  return (
    <section aria-labelledby="kpi-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="kpi-heading" className={sectionHeading}>
          {copy.kpiHeading}
        </h2>
        <DataTag status={legalCount.counted.status} />
      </div>
      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Tile
          as="li"
          label={<TileLabel>{t.legal.label}</TileLabel>}
          value={formatInt(legalCount.counted.value)}
          unit={t.legal.unit}
          badge={<StatusPill tone="warning">{t.legal.short}</StatusPill>}
          sub={t.legal.sub}
        />
        <Tile
          as="li"
          label={<TileLabel>{t.contribution.label}</TileLabel>}
          value={formatAED(contribution.monthly.value)}
          unit={t.contribution.unit}
          badge={<StatusPill tone="warning">{t.contribution.badge}</StatusPill>}
          sub={t.contribution.sub}
        />
        <Tile
          as="li"
          label={<TileLabel>{t.retention.label}</TileLabel>}
          value={formatPct(retention.company.value)}
          badge={<StatusPill tone="good">{t.retention.badge}</StatusPill>}
          sub={fill(t.retention.sub, { sector: formatPct(retention.sector.value) })}
        />
        <Tile
          as="li"
          label={<TileLabel>{t.eqs.label}</TileLabel>}
          value={`${eqs.band} · ${formatInt(eqs.score.value)}`}
          badge={<TrendPill>{eqs.trend}</TrendPill>}
          sub={t.eqs.sub}
        />
        <Tile
          as="li"
          label={<TileLabel>{t.reports.label}</TileLabel>}
          value={formatInt(reportsDue.value)}
          sub={t.reports.sub}
          footer={
            <TextLink to="/employer/monthly-report" className="inline-flex min-h-touch items-center">
              {t.reports.link}
            </TextLink>
          }
        />
      </ul>
      <TenureDisclosure />
    </section>
  );
}

type ActionState = 'open' | 'done' | 'dismissed';

function ActionItem({ action, state, onChange }: { action: AgentAction; state: ActionState; onChange: (next: ActionState) => void }) {
  const a = copy.actions;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moveFocus = useRef(false);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    focusInView(headingRef.current);
  }, [state]);

  function change(next: ActionState) {
    moveFocus.current = true;
    onChange(next);
  }

  return (
    <li className="border-b border-line2 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <h3 ref={headingRef} tabIndex={-1} className="m-0 text-[15px] font-semibold leading-snug text-ink">
        {action.title}
      </h3>
      {state === 'dismissed' ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink2">
          <span>{a.dismissed}</span>
          <Button variant="ghost" size="sm" icon={<Undo2 aria-hidden="true" className="h-4 w-4" />} onClick={() => change('open')}>
            {a.undo}
          </Button>
        </div>
      ) : (
        <>
          <p className="m-0 mt-1 text-sm leading-relaxed text-ink2">
            <span className="font-semibold text-ink">{a.whyLabel}</span> {action.why}
          </p>
          {state === 'open' ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {action.to ? (
                <ButtonLink to={action.to} variant="primary" size="sm">
                  {action.primary}
                </ButtonLink>
              ) : (
                <Button variant="primary" size="sm" onClick={() => change('done')}>
                  {action.primary}
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => change('dismissed')}>
                {a.notNow}
              </Button>
            </div>
          ) : null}
        </>
      )}
      <div role="status" className={state === 'done' ? 'mt-3' : undefined}>
        {state === 'done' && action.done ? <StatusBanner tone="good">{action.done}</StatusBanner> : null}
      </div>
    </li>
  );
}

function ActionsCard() {
  const a = copy.actions;
  const [states, setStates] = useState<Record<ActionKey, ActionState>>({ find: 'open', pay: 'open', buddy: 'open' });
  return (
    <Card aria-labelledby="actions-heading" className="xl:col-span-2">
      <CardHeader
        id="actions-heading"
        title={a.heading}
        description={
          <AiNote agent="Employer Agent" prefix={a.suggestedBy}>
            {a.decide}
          </AiNote>
        }
      />
      <ul className="m-0 flex list-none flex-col p-0">
        {agentActions.map((action) => (
          <ActionItem
            key={action.key}
            action={action}
            state={states[action.key]}
            onChange={(next) => setStates((s) => ({ ...s, [action.key]: next }))}
          />
        ))}
      </ul>
    </Card>
  );
}

function PipelineChart() {
  const p = copy.pipeline;
  const data: BarDatum[] = pipeline.map((s) => ({
    key: s.key,
    label: s.label,
    value: s.value.value,
    valueLabel: formatInt(s.value.value),
  }));
  const max = Math.max(...pipeline.map((s) => s.value.value));
  return (
    <ChartFrame
      titleAs="h2"
      title={p.title}
      status={pipeline[0]?.value.status}
      footnote={p.footnote}
      table={{
        columns: [
          { key: 'stage', label: p.table.stage },
          { key: 'people', label: p.table.people, numeric: true },
        ],
        rows: pipeline.map((s) => ({ stage: s.label, people: formatInt(s.value.value) })),
      }}
    >
      <Bars ariaLabel={p.ariaLabel} data={data} max={max} />
    </ChartFrame>
  );
}

function TeamTable() {
  const t = copy.team;
  const columns: Column<TeamRow>[] = [
    { key: 'name', header: t.columns.name, rowHeader: true, className: 'whitespace-nowrap', render: (r) => r.person.name },
    { key: 'role', header: t.columns.role, className: 'min-w-[150px]', render: (r) => r.person.role },
    { key: 'licence', header: t.columns.licence, className: 'whitespace-nowrap', render: (r) => r.person.site ?? '—' },
    { key: 'tenure', header: t.columns.tenure, className: 'whitespace-nowrap', render: (r) => r.person.tenure ?? '—' },
    {
      key: 'training',
      header: t.columns.training,
      numeric: true,
      render: (r) => fill(t.hours, { hours: formatInt(r.trainingHours.value) }),
    },
    {
      key: 'report',
      header: t.columns.report,
      render: (r) => (
        <div className="flex flex-col items-start gap-1">
          <StatusPill tone={r.report.state === 'due' ? 'neutral' : 'good'} className="whitespace-nowrap">
            {r.report.text}
          </StatusPill>
          {r.report.detail ? <span className="text-[13px] text-ink2">{r.report.detail}</span> : null}
          {r.report.open ? (
            // relative: keeps the visually hidden name inside the table's scroll box at phone widths.
            <TextLink to="/employer/monthly-report" className="relative inline-flex min-h-touch items-center text-[13px]">
              {t.openReport}
              <span className="sr-only"> {fill(t.openReportFor, { name: r.person.name })}</span>
            </TextLink>
          ) : null}
        </div>
      ),
    },
    { key: 'next', header: t.columns.next, className: 'min-w-[160px]', render: (r) => r.nextStep },
  ];
  return (
    <Card aria-labelledby="team-heading">
      <CardHeader id="team-heading" title={t.heading} description={t.shown} actions={<DataTag status={teamRows[0]?.trainingHours.status ?? 'sample'} />} />
      <DataTable
        caption={t.heading}
        hideCaption
        regionLabel={t.tableRegion}
        columns={columns}
        rows={teamRows}
        getKey={(r) => r.person.id}
      />
      <div className="mt-3 flex flex-col gap-1.5">
        <AiNote agent="Employer Agent" prefix={t.nextBy}>
          {t.nextDecide}
        </AiNote>
        <p className="m-0 text-[13px] leading-relaxed text-ink2">{t.footnote}</p>
      </div>
    </Card>
  );
}

function QualityChart() {
  const q = copy.quality;
  const data: BarDatum[] = qualityParts.map((p) => {
    const lowest = p.key === qualityLowestKey;
    const vars = { label: p.label, weight: p.weight, score: p.score.value };
    return {
      key: p.key,
      label: p.label,
      sublabel: fill(q.weight, { weight: p.weight }),
      value: p.score.value,
      valueLabel: formatInt(p.score.value),
      color: lowest ? chartColors.warning : chartColors.series1,
      tooltipRows: [{ label: q.points, value: formatNumber(qualityPoints(p), 1) }],
      ariaLabel: fill(lowest ? q.barNameLowest : q.barName, vars),
    };
  });
  return (
    <ChartFrame
      className="xl:col-span-2"
      titleAs="h2"
      title={q.title}
      subtitle={fill(q.subtitle, { score: formatInt(eqs.score.value) })}
      status={eqs.score.status}
      footnote={q.note}
      table={{
        columns: [
          { key: 'part', label: q.table.part },
          { key: 'weight', label: q.table.weight, numeric: true },
          { key: 'result', label: q.table.result, numeric: true },
          { key: 'points', label: q.table.points, numeric: true },
        ],
        rows: [
          ...qualityParts.map((p) => ({
            part: p.label,
            weight: fill(q.percent, { value: p.weight }),
            result: formatInt(p.score.value),
            points: formatNumber(qualityPoints(p), 1),
          })),
          {
            part: q.totalRow,
            weight: fill(q.percent, { value: qualityWeightTotal }),
            result: formatInt(eqs.score.value),
            points: formatNumber(qualityTotal.value, 1),
          },
        ],
      }}
    >
      <Bars
        ariaLabel={q.ariaLabel}
        data={data.map((d) => (d.key === qualityLowestKey ? { ...d, flag: q.lowest } : d))}
        max={qualityScaleMax}
        tooltipTitle={(d) => (d.key === qualityLowestKey ? fill(q.tooltipLowest, { label: d.label }) : d.label)}
      />
    </ChartFrame>
  );
}

function MoneyCard() {
  const m = copy.money;
  const rows = [
    { key: 'owed', label: m.owed, value: formatAED(money.owed.value) },
    { key: 'support', label: m.support, value: formatAED(money.supportPaid.value) },
    { key: 'club', label: m.club, value: money.partnersClubTier.value },
    { key: 'checkpoint', label: m.checkpoint, value: money.nextCheckpoint.value },
  ];
  return (
    <Card aria-labelledby="money-heading" className="flex flex-col">
      <CardHeader id="money-heading" title={m.heading} actions={<DataTag status={money.supportPaid.status} />} />
      <dl className="m-0 flex flex-col">
        {rows.map((r) => (
          <div
            key={r.key}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-line2 py-3 first:pt-0 last:border-b-0"
          >
            <dt className="text-sm leading-snug text-ink2">{r.label}</dt>
            <dd className="tabular m-0 text-end text-[17px] font-semibold text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 mt-3 border-t border-line2 pt-3 text-[13px] leading-relaxed text-ink2">{m.note}</p>
    </Card>
  );
}

/** Employer dashboard for Huda, HR Admin at Qasr Logistics (2 licences). */
export function EmployerDashboard() {
  return (
    <AppShell portal="employer" persona="huda">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={fill(copy.greeting, { name: employerScenario.hrAdmin.name })}
        description={fill(copy.lead, { date: employerScenario.date })}
      />
      <div className="flex flex-col gap-6">
        <KeyFigures />
        <div className="grid gap-4 xl:grid-cols-3">
          <ActionsCard />
          <PipelineChart />
        </div>
        <TeamTable />
        <div className="grid gap-4 xl:grid-cols-3">
          <QualityChart />
          <MoneyCard />
        </div>
      </div>
    </AppShell>
  );
}
