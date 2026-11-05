import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Clock, Eye, FileSearch, Lock, ShieldCheck, Users, X } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { AiNote } from '@/components/AiNote';
import { Button, ButtonLink } from '@/components/Button';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { Field, TextArea } from '@/components/Field';
import { RadioGroup } from '@/components/RadioGroup';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { Tabs } from '@/components/Tabs';
import { ChartFrame } from '@/charts/ChartFrame';
import { LineWithBand } from '@/charts/LineWithBand';
import { chartColors } from '@/charts/core';
import { integrityCase as ic, type IntegrityDecisionId, type IntegrityReason, type ReasonMark } from '@/data/cases';
import { cx } from '@/lib/cx';
import { fill, formatAED, formatInt, formatNumber } from '@/lib/format';
import { MoneyLinksDiagram } from './MoneyLinksDiagram';

type EvidenceTab = 'pay' | 'links' | 'timeline';
type Marks = Record<string, ReasonMark | null>;

function accessChip() {
  return (
    <Chip icon={<Eye aria-hidden="true" className="h-4 w-4" />} tone="outline">
      {ic.accessChip}
    </Chip>
  );
}

/* ---------------------------------------------------------------- */
/* Reasons                                                           */
/* ---------------------------------------------------------------- */

function ReviewButton({
  pressed,
  onClick,
  icon,
  disabled,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: ReactNode;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-touch items-center gap-1.5 whitespace-nowrap rounded-control border px-3 text-sm font-medium leading-tight transition-colors disabled:cursor-not-allowed',
        pressed ? 'border-accent bg-accent-tint text-ink' : 'border-control bg-surface text-ink enabled:hover:bg-accent-tint',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function ReasonItem({
  reason,
  mark,
  onMark,
  locked,
}: {
  reason: IntegrityReason;
  mark: ReasonMark | null;
  onMark: (next: ReasonMark | null) => void;
  locked: boolean;
}) {
  const m = ic.model;
  const toggle = (value: ReasonMark) => onMark(mark === value ? null : value);
  return (
    <li className="border-t border-line2 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1 basis-[300px]">
          <p className="m-0 flex flex-wrap items-center gap-2">
            <span className="rounded-[6px] bg-line2 px-2 py-0.5 font-mono text-[13px] font-medium text-ink">{reason.code}</span>{' '}
            <span className="text-[15px] font-semibold leading-snug text-ink">{reason.title}</span>
          </p>
          <p className="m-0 mt-1.5 text-sm leading-relaxed text-ink">{reason.detail}</p>
          <p className="m-0 mt-1 text-[13px] leading-snug text-ink2">
            {reason.source} · <span className="whitespace-nowrap">{reason.rule}</span>
          </p>
          <p className="m-0 mt-1 text-[13px] leading-snug text-ink2">
            <span className="font-semibold text-ink">{m.modelUseLabel} </span>
            {reason.modelUse}
          </p>
        </div>
        <div role="group" aria-label={fill(m.groupLabel, { code: reason.code, title: reason.title })} className="flex shrink-0 flex-wrap gap-2">
          <ReviewButton
            pressed={mark === 'confirmed'}
            disabled={locked}
            onClick={() => toggle('confirmed')}
            icon={<Check aria-hidden="true" className={cx('h-4 w-4', mark === 'confirmed' ? 'text-accent' : 'text-ink2')} strokeWidth={2.5} />}
          >
            {m.confirmed}
          </ReviewButton>
          <ReviewButton
            pressed={mark === 'not-confirmed'}
            disabled={locked}
            onClick={() => toggle('not-confirmed')}
            icon={<X aria-hidden="true" className={cx('h-4 w-4', mark === 'not-confirmed' ? 'text-accent' : 'text-ink2')} strokeWidth={2.5} />}
          >
            {m.notConfirmed}
          </ReviewButton>
        </div>
      </div>
    </li>
  );
}

function ReasonsCard({ marks, setMark, locked }: { marks: Marks; setMark: (code: string, next: ReasonMark | null) => void; locked: boolean }) {
  const m = ic.model;
  const done = ic.reasons.filter((r) => marks[r.code]).length;
  const total = ic.reasons.length;
  return (
    <Card aria-labelledby="reasons-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="reasons-heading" className="m-0 min-w-0 flex-[1_1_220px] text-[17px] font-semibold leading-snug text-ink">
          {m.title}
        </h2>
        <span aria-live="polite" className="inline-flex">
          <StatusPill tone={done === total ? 'good' : 'neutral'}>{fill(m.progress, { done, total })}</StatusPill>
        </span>
      </div>
      <div className="mb-5 rounded-control bg-ground p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiNote agent="Ghost-Job Detector">{m.agentNote}</AiNote>
          <DataTag status={m.score.status} />
        </div>
        <p className="m-0 mt-2 text-sm leading-relaxed text-ink">{fill(m.summary, { score: formatNumber(m.score.value, 2), version: m.version })}</p>
        <p className="m-0 mt-1 text-[13px] leading-snug text-ink2">{m.principle}</p>
      </div>
      <ul className="m-0 list-none p-0">
        {ic.reasons.map((reason) => (
          <ReasonItem
            key={reason.code}
            reason={reason}
            mark={marks[reason.code] ?? null}
            onMark={(next) => setMark(reason.code, next)}
            locked={locked}
          />
        ))}
      </ul>
      {locked ? (
        <p className="m-0 mt-4 flex items-start gap-2 text-[13px] leading-snug text-ink2">
          <Lock aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
          {m.lockedNote}
        </p>
      ) : null}
    </Card>
  );
}

/* ---------------------------------------------------------------- */
/* Evidence pack                                                     */
/* ---------------------------------------------------------------- */

function PayPattern() {
  const p = ic.payPattern;
  const xs = p.months.map((_, i) => i + 1);
  const at = (values: number[], x: number) => values[x - 1] ?? 0;
  return (
    <ChartFrame
      card={false}
      title={p.title}
      subtitle={p.subtitle}
      status={p.hires.status}
      legend={[
        { label: p.legendHires, color: chartColors.series1, kind: 'line' },
        { label: p.legendBand, color: chartColors.muted, kind: 'band' },
      ]}
      table={{
        caption: p.title,
        columns: [
          { key: 'month', label: p.tableColumns.month },
          { key: 'hires', label: p.tableColumns.hires, numeric: true },
          { key: 'p25', label: p.tableColumns.p25, numeric: true },
          { key: 'p75', label: p.tableColumns.p75, numeric: true },
        ],
        rows: xs.map((x) => ({
          month: fill(p.tableMonth, { month: p.monthsLong[x - 1] ?? '', year: p.year }),
          hires: formatInt(at(p.hires.value, x)),
          p25: formatInt(at(p.p25.value, x)),
          p75: formatInt(at(p.p75.value, x)),
        })),
      }}
      footnote={p.footnote}
    >
      <LineWithBand
        ariaLabel={fill(p.ariaLabel, {
          hires: formatAED(Math.max(...p.hires.value)),
          low: formatInt(Math.min(...p.p25.value)),
          high: formatInt(Math.max(...p.p75.value)),
        })}
        xValues={xs}
        formatX={(x) => p.months[x - 1] ?? ''}
        formatY={formatAED}
        formatYTick={formatInt}
        yDomain={[0, p.yMax]}
        yTicks={p.yTicks}
        height={260}
        series={[
          {
            id: 'hires',
            label: p.tooltipHires,
            color: chartColors.series1,
            points: xs.map((x) => ({ x, y: at(p.hires.value, x) })),
          },
        ]}
        bands={[
          {
            id: 'similar',
            label: p.tooltipBand,
            color: chartColors.muted,
            opacity: 0.28,
            points: xs.map((x) => ({ x, low: at(p.p25.value, x), high: at(p.p75.value, x) })),
          },
        ]}
        tooltipTitle={(x) => fill(p.tooltipTitle, { month: p.monthsLong[x - 1] ?? '', year: p.year })}
        tooltipRows={(x) => [
          { label: p.tooltipHires, value: formatInt(at(p.hires.value, x)), color: chartColors.series1, kind: 'line' },
          {
            label: p.tooltipBand,
            value: `${formatInt(at(p.p25.value, x))}–${formatInt(at(p.p75.value, x))}`,
            color: chartColors.muted,
            kind: 'band',
          },
        ]}
        pointLabel={(x) =>
          fill(p.pointLabel, {
            month: p.monthsLong[x - 1] ?? '',
            year: p.year,
            hires: formatInt(at(p.hires.value, x)),
            p25: formatInt(at(p.p25.value, x)),
            p75: formatInt(at(p.p75.value, x)),
          })
        }
      />
    </ChartFrame>
  );
}

function MoneyAndLinks() {
  const l = ic.links;
  return (
    <ChartFrame
      card={false}
      title={l.title}
      subtitle={l.subtitle}
      status={ic.status}
      legend={[
        { label: l.legend.salary, color: chartColors.muted, kind: 'line' },
        { label: l.legend.money, color: chartColors.series2, kind: 'line' },
        { label: l.legend.address, color: chartColors.series1, kind: 'dashed' },
        { label: l.legend.owner, color: chartColors.ink, kind: 'line' },
      ]}
      table={{
        caption: l.title,
        columns: [
          { key: 'from', label: l.tableColumns.from },
          { key: 'to', label: l.tableColumns.to },
          { key: 'link', label: l.tableColumns.link },
          { key: 'evidence', label: l.tableColumns.evidence },
        ],
        rows: l.rows.map((row) => ({ ...row })),
      }}
      footnote={l.footnote}
    >
      <MoneyLinksDiagram copy={l} />
    </ChartFrame>
  );
}

function Timeline() {
  const t = ic.timeline;
  return (
    <section aria-labelledby="timeline-heading">
      <h3 id="timeline-heading" className="m-0 mb-4 text-[16px] font-semibold">
        {t.title}
      </h3>
      <ol className="m-0 list-none p-0">
        {t.events.map((e, i) => {
          const last = i === t.events.length - 1;
          return (
            <li key={e.id} aria-current={e.today ? 'step' : undefined} className="relative flex gap-4 pb-5 last:pb-0">
              {!last ? <span aria-hidden="true" className="absolute bottom-0 start-[5px] top-4 w-px bg-line" /> : null}
              <span
                aria-hidden="true"
                className={cx(
                  'relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2',
                  e.today ? 'border-ink bg-surface' : 'border-ink2 bg-ink2',
                )}
              />
              <div className="min-w-0">
                <p className="m-0 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink2">
                  {e.date}
                  {e.today ? (
                    <Chip size="sm" tone="dark">
                      {t.todayLabel}
                    </Chip>
                  ) : null}
                </p>
                <p className="m-0 mt-0.5 text-sm leading-relaxed text-ink">{e.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function EvidenceCard() {
  const [tab, setTab] = useState<EvidenceTab>('pay');
  const e = ic.evidence;
  return (
    <Card aria-labelledby="evidence-heading">
      <CardHeader id="evidence-heading" title={e.title} className="mb-2" />
      <Tabs<EvidenceTab>
        label={e.tabsLabel}
        value={tab}
        onChange={setTab}
        panelClassName="pt-5"
        tabs={[
          { id: 'pay', label: e.tabs.pay, content: <PayPattern /> },
          { id: 'links', label: e.tabs.links, content: <MoneyAndLinks /> },
          { id: 'timeline', label: e.tabs.timeline, content: <Timeline /> },
        ]}
      />
    </Card>
  );
}

/* ---------------------------------------------------------------- */
/* Decision and side panels                                          */
/* ---------------------------------------------------------------- */

function DecisionCard({
  left,
  decision,
  setDecision,
  reason,
  setReason,
  sent,
  onSend,
  onWithdraw,
}: {
  left: number;
  decision: IntegrityDecisionId | null;
  setDecision: (id: IntegrityDecisionId) => void;
  reason: string;
  setReason: (text: string) => void;
  sent: boolean;
  onSend: () => void;
  onWithdraw: () => void;
}) {
  const d = ic.decision;
  const ready = left === 0 && decision !== null;
  const sendRef = useRef<HTMLButtonElement>(null);
  const withdrawRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef<'send' | 'withdraw' | null>(null);
  useEffect(() => {
    // Sending swaps the form for a summary, so move keyboard focus to Withdraw, and back to Send after a withdrawal.
    const target = focusNext.current;
    focusNext.current = null;
    if (target === 'withdraw') withdrawRef.current?.focus();
    else if (target === 'send') sendRef.current?.focus();
  }, [sent]);
  const which = left === 1 ? d.remainingOne : fill(d.remainingMany, { left });
  const hint =
    left > 0 && !decision ? fill(d.needMarksAndDecision, { which }) : left > 0 ? fill(d.needMarks, { which }) : !decision ? d.needDecision : d.ready;
  const chosen = d.options.find((o) => o.id === decision);
  return (
    <section aria-labelledby="decision-heading" className="min-w-0 rounded-card border-2 border-accent bg-surface p-5">
      <h2 id="decision-heading" className="m-0 mb-4 text-[17px] font-semibold leading-snug">
        {d.title}
      </h2>
      {sent ? (
        // Locked while the second reviewer has it: show what was sent, not controls that look live.
        <dl className="m-0 flex flex-col gap-3 rounded-control bg-ground p-4">
          <div>
            <dt className="flex items-center gap-1.5 text-[13px] font-medium text-ink2">
              <Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {d.legend}
            </dt>
            <dd className="m-0 mt-1 text-[15px] font-semibold leading-snug text-ink">{chosen?.label}</dd>
          </div>
          <div>
            <dt className="text-[13px] font-medium text-ink2">{d.reasonLabel}</dt>
            <dd className="m-0 mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{reason.trim() || d.noReason}</dd>
          </div>
        </dl>
      ) : (
        <>
          <RadioGroup<IntegrityDecisionId>
            legend={d.legend}
            hideLegend
            name="integrity-decision"
            variant="card"
            value={decision}
            onChange={setDecision}
            options={d.options.map((o) => ({ value: o.id, label: o.label, description: o.description }))}
          />
          <Field label={d.reasonLabel} hint={d.reasonHint} className="mt-4">
            {({ id, describedBy }) => (
              <TextArea id={id} aria-describedby={describedBy} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
            )}
          </Field>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              ref={sendRef}
              variant="primary"
              className="w-full"
              disabled={!ready}
              aria-describedby="send-hint"
              onClick={() => {
                focusNext.current = 'withdraw';
                onSend();
              }}
            >
              {d.send}
            </Button>
            <p id="send-hint" aria-live="polite" className="m-0 text-[13px] leading-snug text-ink2">
              {hint}
            </p>
          </div>
        </>
      )}
      <div aria-live="polite">
        {sent ? (
          <div className="mt-4 flex flex-col items-start gap-2">
            <StatusBanner tone="good" className="w-full">
              {decision === 'close' ? d.sentClose : d.sent}
            </StatusBanner>
            <Button
              ref={withdrawRef}
              variant="ghost"
              size="sm"
              onClick={() => {
                focusNext.current = 'send';
                onWithdraw();
              }}
            >
              {d.withdraw}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PointsCard({ id, title, icon, points, children }: { id: string; title: string; icon: ReactNode; points: string[]; children?: ReactNode }) {
  return (
    <Card aria-labelledby={id}>
      <h2 id={id} className="m-0 flex items-center gap-2 text-[16px] font-semibold">
        {icon}
        {title}
      </h2>
      <ul className="m-0 mt-3 flex list-disc flex-col gap-2 ps-5 text-sm leading-relaxed text-ink marker:text-ink2">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {children}
    </Card>
  );
}

/* ---------------------------------------------------------------- */
/* Screen                                                            */
/* ---------------------------------------------------------------- */

function CaseView() {
  const [marks, setMarks] = useState<Marks>(() => Object.fromEntries(ic.reasons.map((r) => [r.code, r.preset ?? null])));
  const [decision, setDecision] = useState<IntegrityDecisionId | null>(null);
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);
  const left = ic.reasons.filter((r) => !marks[r.code]).length;
  const c = ic.chips;

  return (
    <AppShell portal="staff" persona="salem" extraChips={accessChip()}>
      <PageHeader
        eyebrow={ic.eyebrow}
        title={ic.title}
        description={ic.headerLine}
        chips={
          <>
            <span aria-live="polite" className="inline-flex">
              <Chip tone={sent ? 'dark' : 'neutral'} icon={<FileSearch aria-hidden="true" className="h-4 w-4" />}>
                {sent ? c.stageSent : c.stage}
              </Chip>
            </span>
            <Chip tone="neutral" icon={<Clock aria-hidden="true" className="h-4 w-4" />}>
              {fill(c.day, { day: formatInt(c.dayValue.value), limit: formatInt(c.dayLimit.value) })}
            </Chip>
            <Chip>{c.investigator}</Chip>
            <Chip>{c.reviewer}</Chip>
            <Chip>{c.atStake}</Chip>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <ReasonsCard marks={marks} setMark={(code, next) => setMarks((all) => ({ ...all, [code]: next }))} locked={sent} />
          <EvidenceCard />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <DecisionCard
            left={left}
            decision={decision}
            setDecision={setDecision}
            reason={reason}
            setReason={setReason}
            sent={sent}
            onSend={() => setSent(true)}
            onWithdraw={() => setSent(false)}
          />
          <PointsCard
            id="employees-heading"
            title={ic.employees.title}
            icon={<Users aria-hidden="true" className="h-5 w-5 text-ink2" />}
            points={ic.employees.points}
          />
          <PointsCard
            id="safeguards-heading"
            title={ic.safeguards.title}
            icon={<ShieldCheck aria-hidden="true" className="h-5 w-5 text-ink2" />}
            points={ic.safeguards.points}
          >
            <p className="m-0 mt-3 flex flex-wrap items-center gap-2 border-t border-line2 pt-3 text-[13px] leading-snug text-ink2">
              <span>{fill(ic.safeguards.modelLine, { version: ic.model.version, precision: formatNumber(ic.safeguards.precision.value, 2) })}</span>
              <DataTag status={ic.safeguards.precision.status} />
            </p>
          </PointsCard>
        </div>
      </div>
    </AppShell>
  );
}

function CaseNotFound({ caseId }: { caseId: string }) {
  const nf = ic.notFound;
  return (
    <AppShell portal="staff" persona="salem" extraChips={accessChip()}>
      <PageHeader title={nf.title} description={<span className="break-all">{fill(nf.body, { id: caseId })}</span>} />
      <ButtonLink to={`/staff/integrity/${ic.id}`} variant="primary">
        {fill(nf.open, { id: ic.id })}
      </ButtonLink>
    </AppShell>
  );
}

export function IntegrityCase() {
  const { caseId = '' } = useParams();
  if (caseId !== ic.id) return <CaseNotFound caseId={caseId} />;
  return <CaseView />;
}
