import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, CornerUpLeft, FileDown, Lock, Undo2 } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { Button } from '@/components/Button';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { Stepper, type Step } from '@/components/Stepper';
import { DataTable, type Column } from '@/components/DataTable';
import { AiNote } from '@/components/AiNote';
import {
  changes,
  changesStatuses,
  decisions,
  decisionsCopy,
  keyNumbers,
  keyNumbersCopy,
  lineageCopy,
  methodNotes,
  packMeta,
  packSections,
  signoffCopy,
  signoffStartIndex,
  signoffSteps,
  summary,
  versions,
  versionsCopy,
  type KeyNumber,
} from '@/data/pack';
import type { DataStatus } from '@/data/types';
import { cx } from '@/lib/cx';
import { fill } from '@/lib/format';
import { useDomId } from '@/lib/useId';

function SectionHeading({ id, number, title }: { id: string; number: string; title: string }) {
  return (
    <h2 id={id} className="m-0 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink2">
      {number} · {title}
    </h2>
  );
}

function PackSection({
  section,
  statuses,
  children,
}: {
  section: { number: string; title: string };
  /** Data status of the figures in this section, shown beside the heading. */
  statuses?: DataStatus[];
  children: ReactNode;
}) {
  const id = useDomId('pack-section');
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 border-t border-line2 pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <SectionHeading id={id} number={section.number} title={section.title} />
        {statuses?.map((s) => <DataTag key={s} status={s} />)}
      </div>
      {children}
    </section>
  );
}

function LineagePanel({ row, titleAs = 'h2' }: { row: KeyNumber; titleAs?: 'h2' | 'h3' }) {
  const headingId = useDomId('lineage');
  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId} title={lineageCopy.title} titleAs={titleAs} className="mb-3" />
      <div aria-live="polite">
        <p className="m-0 text-[15px] font-semibold leading-snug text-ink">{row.name}</p>
        <p className="m-0 mt-1 flex flex-wrap items-center gap-2 text-sm text-ink">
          <span className="tabular font-semibold">{row.value}</span>
          <span className="text-ink2">{row.id}</span>
          <DataTag status={row.dataStatus} />
        </p>
        <ol aria-label={lineageCopy.chainLabel} className="m-0 mt-4 list-none p-0">
          {row.lineage.map((step, i) => {
            const last = i === row.lineage.length - 1;
            return (
              <li key={step} className="flex gap-3">
                <span aria-hidden="true" className="flex w-3 shrink-0 flex-col items-center">
                  <span className={cx('mt-1 h-3 w-3 shrink-0 rounded-full', last ? 'bg-ink' : 'border-2 border-control bg-surface')} />
                  {last ? null : <span className="my-1 w-0.5 flex-1 bg-line" />}
                </span>
                <span className={cx('min-w-0 pb-4 text-sm leading-snug', last ? 'pb-0 font-semibold text-ink' : 'text-ink')}>{step}</span>
              </li>
            );
          })}
        </ol>
        <dl className="m-0 mt-4 flex flex-col gap-2 border-t border-line2 pt-3 text-sm">
          <div>
            <dt className="text-[13px] font-semibold text-ink2">{lineageCopy.owner}</dt>
            <dd className="m-0 leading-snug text-ink">{row.owner}</dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold text-ink2">{lineageCopy.check}</dt>
            <dd className="m-0 leading-snug text-ink">{row.check}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

/** Monthly pack to the Undersecretary's office: sign-off chain, the draft and the lineage of each key number. */
export function MonthlyPack() {
  const [step, setStep] = useState(signoffStartIndex);
  const [returned, setReturned] = useState(false);
  const [exportNote, setExportNote] = useState(false);
  const [selectedId, setSelectedId] = useState(keyNumbers[0]?.id ?? '');
  const statusRef = useRef<HTMLDivElement>(null);
  const signoffHeadingId = useDomId('signoff');
  const total = signoffSteps.length;
  const locked = step >= total;
  const current = signoffSteps[Math.min(step, total - 1)];
  const selected = keyNumbers.find((k) => k.id === selectedId) ?? (keyNumbers[0] as KeyNumber);

  useEffect(() => {
    if (locked) statusRef.current?.focus();
  }, [locked]);

  const steps: Step[] = signoffSteps.map((s, i) => {
    if (i < step) return { label: s.role, state: 'done', detail: s.done };
    if (i === step) {
      return returned ? { label: s.role, state: 'returned', detail: signoffCopy.returnedDetail } : { label: s.role, state: 'current', detail: s.current };
    }
    return { label: s.role, state: 'upcoming', detail: s.upcoming };
  });

  function approve() {
    setReturned(false);
    setExportNote(false);
    setStep((s) => Math.min(total, s + 1));
  }

  function toggleRequest() {
    setExportNote(false);
    setReturned((r) => !r);
  }

  const columns: Column<KeyNumber>[] = [
    {
      key: 'measure',
      header: keyNumbersCopy.measure,
      rowHeader: true,
      className: 'sm:min-w-[210px]',
      render: (r) => (
        <>
          <button
            type="button"
            aria-pressed={selectedId === r.id}
            onClick={() => setSelectedId(r.id)}
            className="-mx-1 flex min-h-touch w-full flex-col items-start justify-center rounded-control px-1 text-start hover:bg-accent-tint"
          >
            <span className="font-semibold leading-snug text-accent underline decoration-1 underline-offset-[3px]">{r.name}</span>
            <span className="text-[13px] font-normal text-ink2">{r.id}</span>
          </button>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-normal sm:hidden">
            <span className="text-[13px] text-ink2">
              {keyNumbersCopy.target}: {r.target}
            </span>
            <StatusPill tone={r.tone}>{r.statusLabel}</StatusPill>
          </span>
        </>
      ),
    },
    {
      key: 'value',
      header: keyNumbersCopy.value,
      numeric: true,
      render: (r) => (
        <span className="inline-flex flex-col items-end gap-1">
          <span className="whitespace-nowrap font-semibold">{r.value}</span>
          <DataTag status={r.dataStatus} />
        </span>
      ),
    },
    {
      key: 'target',
      header: keyNumbersCopy.target,
      numeric: true,
      className: 'max-sm:hidden',
      render: (r) => <span className="whitespace-nowrap text-ink2">{r.target}</span>,
    },
    {
      key: 'status',
      header: keyNumbersCopy.status,
      className: 'max-sm:hidden',
      render: (r) => (
        <StatusPill tone={r.tone} className="whitespace-nowrap">
          {r.statusLabel}
        </StatusPill>
      ),
    },
  ];

  const headerPill = locked ? (
    <StatusPill tone="good">{packMeta.lockedLabel}</StatusPill>
  ) : returned ? (
    <StatusPill tone="warning">{packMeta.returnedLabel}</StatusPill>
  ) : (
    <StatusPill tone="neutral">{packMeta.draftLabel}</StatusPill>
  );

  return (
    <AppShell portal="executive" persona="chief">
      <PageHeader
        eyebrow={packMeta.eyebrow}
        title={packMeta.title}
        description={packMeta.subtitle}
        chips={
          <>
            <Chip tone="outline">{packMeta.scenario}</Chip>
            {headerPill}
          </>
        }
      />
      <div className="flex flex-col gap-4">
        <Card aria-labelledby={signoffHeadingId}>
          <CardHeader
            id={signoffHeadingId}
            title={signoffCopy.title}
            description={
              locked
                ? fill(signoffCopy.allDone, { total })
                : fill(signoffCopy.stepOf, { n: step + 1, total, role: current?.role ?? '' })
            }
            actions={
              <>
                {!locked && !returned ? (
                  <Button key="approve" variant="primary" onClick={approve} icon={<Check aria-hidden="true" className="h-4 w-4" />}>
                    {signoffCopy.approvePrefix}
                    {current?.role}
                  </Button>
                ) : null}
                {!locked ? (
                  <Button
                    key="request"
                    onClick={toggleRequest}
                    icon={returned ? <Undo2 aria-hidden="true" className="h-4 w-4" /> : <CornerUpLeft aria-hidden="true" className="h-4 w-4" />}
                  >
                    {returned ? signoffCopy.withdraw : signoffCopy.requestChanges}
                  </Button>
                ) : null}
                <Button key="export" variant="ghost" onClick={() => setExportNote(true)} icon={<FileDown aria-hidden="true" className="h-4 w-4" />}>
                  {signoffCopy.exportPdf}
                </Button>
              </>
            }
          />
          <Stepper steps={steps} label={signoffCopy.stepperLabel} />
          <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
            {signoffCopy.chips.map((c) => (
              <li key={c.id}>
                <Chip
                  tone={c.tone === 'good' ? 'good' : 'outline'}
                  icon={c.tone === 'good' ? <Check aria-hidden="true" className="h-3.5 w-3.5 text-good-icon" strokeWidth={2.5} /> : undefined}
                >
                  {c.text}
                </Chip>
              </li>
            ))}
          </ul>
          <div ref={statusRef} tabIndex={-1} role="status" className="focus:outline-none">
            {locked ? (
              <StatusBanner tone="good" icon={<Lock aria-hidden="true" className="h-4 w-4 text-good-icon" />} className="mt-4">
                {signoffCopy.locked}
              </StatusBanner>
            ) : returned ? (
              <StatusBanner tone="warning" title={signoffCopy.returnedTitle} className="mt-4">
                {signoffCopy.returned}
              </StatusBanner>
            ) : null}
            {exportNote ? (
              <StatusBanner tone="neutral" className="mt-4">
                {signoffCopy.exportNote}
              </StatusBanner>
            ) : null}
          </div>
        </Card>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <article aria-label={packMeta.title} className="flex min-w-0 flex-col gap-6 rounded-card border border-line bg-surface p-5 sm:p-8">
            <PackSection section={packSections.summary} statuses={summary.statuses}>
              <div className="rounded-control border border-line bg-ground p-4">
                <p className="m-0 mb-2 text-[13px] font-semibold text-ink2">{summary.arabicLabel}</p>
                <p lang="ar" dir="rtl" className="m-0 font-arabic text-[16px] leading-[2] text-ink">
                  {summary.arabic}
                </p>
              </div>
              <div className="px-1">
                <p className="m-0 mb-1.5 text-[13px] font-semibold text-ink2">{summary.englishLabel}</p>
                <p className="m-0 max-w-[760px] text-[15px] leading-relaxed text-ink">{summary.english}</p>
              </div>
              <AiNote agent="Report Writer">{summary.agentNote}</AiNote>
            </PackSection>

            <PackSection section={packSections.keyNumbers}>
              <p className="m-0 text-sm leading-snug text-ink2">
                {keyNumbersCopy.hint} {keyNumbersCopy.provisional}
              </p>
              <DataTable
                caption={keyNumbersCopy.caption}
                hideCaption
                columns={columns}
                rows={keyNumbers}
                getKey={(r) => r.id}
                selectedKey={selectedId}
                dense
              />
              <div className="xl:hidden">
                <LineagePanel row={selected} titleAs="h3" />
              </div>
            </PackSection>

            <PackSection section={packSections.changes} statuses={changesStatuses}>
              <ul className="m-0 flex list-disc flex-col gap-2 ps-5 text-[15px] leading-relaxed text-ink marker:text-ink2">
                {changes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </PackSection>

            <PackSection section={packSections.decisions}>
              <AiNote agent="Report Writer">{decisionsCopy.agentNote}</AiNote>
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {decisions.map((d) => (
                  <li key={d.id} className="rounded-control border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="m-0 min-w-0 flex-1 basis-[240px] text-[15px] font-semibold leading-snug text-ink">{d.title}</h3>
                      <Chip tone="neutral" size="sm">
                        {decisionsCopy.byPrefix}
                        {d.by}
                      </Chip>
                    </div>
                    <p className="m-0 mt-2 text-sm leading-relaxed text-ink">
                      {d.detail}
                      {d.costStatus ? (
                        <>
                          {' '}
                          <DataTag status={d.costStatus} className="align-middle" />
                        </>
                      ) : null}
                    </p>
                    <p className="m-0 mt-2 text-sm leading-relaxed text-ink">
                      <span className="font-semibold">{decisionsCopy.recommendation}</span>
                      {d.recommendation}
                    </p>
                  </li>
                ))}
              </ol>
            </PackSection>

            <PackSection section={packSections.method}>
              <ul className="m-0 flex list-disc flex-col gap-1.5 ps-5 text-sm leading-relaxed text-ink2 marker:text-ink2">
                {methodNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </PackSection>
          </article>

          <aside aria-label={lineageCopy.asideLabel} className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-[116px]">
            <div className="hidden xl:block">
              <LineagePanel row={selected} />
            </div>
            <VersionsCard />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function VersionsCard() {
  const headingId = useDomId('versions');
  return (
    <Card aria-labelledby={headingId}>
      <CardHeader id={headingId} title={versionsCopy.title} actions={<DataTag status={versionsCopy.status} />} className="mb-2" />
      <ol className="m-0 list-none p-0">
        {versions.map((v) => (
          <li key={v.id} className="border-t border-line2 py-2.5 first:border-t-0 first:pt-0 last:pb-0">
            <p className="m-0 text-sm font-semibold text-ink">{v.label}</p>
            <p className="m-0 mt-0.5 text-sm leading-snug text-ink2">{v.text}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
