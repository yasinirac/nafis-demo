import { useEffect, useRef, useState } from 'react';
import { ArrowDown, CalendarClock, Clock, Eye, Info, Phone, PhoneOff, TriangleAlert, UserRoundCheck } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { AiNote } from '@/components/AiNote';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { Field, Select, TextArea } from '@/components/Field';
import { RadioGroup } from '@/components/RadioGroup';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { Tile } from '@/components/Tile';
import { ChartFrame } from '@/charts/ChartFrame';
import { SegmentedBar } from '@/charts/SegmentedBar';
import { chartColors } from '@/charts/core';
import { counsellorConsole as cc, type CallCase, type OutcomeId, type Priority } from '@/data/cases';
import { cx } from '@/lib/cx';
import { fill, formatInt, formatPct } from '@/lib/format';
import { useDomId } from '@/lib/useId';

type CallState = 'idle' | 'calling' | 'ended';

interface CaseWork {
  outcome: OutcomeId | null;
  notes: string;
  checkIn: string;
  saved: boolean;
  call: CallState;
}

const copy = cc.copy;

function initialWork(): Record<string, CaseWork> {
  return Object.fromEntries(
    cc.cases.map((c) => [c.id, { outcome: null, notes: '', checkIn: cc.defaultCheckIn, saved: false, call: 'idle' as CallState }]),
  );
}

const priorityTone: Record<Priority, 'warning' | 'neutral' | 'outline'> = {
  High: 'warning',
  Medium: 'neutral',
  Routine: 'outline',
};

function PriorityChip({ priority, id }: { priority: Priority; id?: string }) {
  return (
    <Chip
      size="sm"
      tone={priorityTone[priority]}
      className="shrink-0"
      icon={priority === 'High' ? <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} /> : undefined}
    >
      <span id={id}>
        {cc.priorityLabels[priority]}
        <span className="sr-only"> {cc.queue.priorityWord}</span>
      </span>
    </Chip>
  );
}

/* ---------------------------------------------------------------- */
/* Summary tiles                                                     */
/* ---------------------------------------------------------------- */

function Summary({ callsThisWeek }: { callsThisWeek: number }) {
  const t = cc.tiles;
  const mix = cc.supportMix;
  const total = mix.segments.reduce((sum, s) => sum + s.value.value, 0) || 1;
  return (
    <section aria-label={cc.tilesLabel} className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
      <Tile
        label={t.caseload.label}
        value={formatInt(t.caseload.value.value)}
        sub={fill(t.caseload.sub, { cap: formatInt(t.caseload.cap.value) })}
        footer={<DataTag status={t.caseload.value.status} />}
      />
      <Tile
        label={t.flagged.label}
        value={formatInt(t.flagged.value.value)}
        sub={fill(t.flagged.sub, { calls: formatInt(callsThisWeek) })}
        footer={<DataTag status={t.flagged.value.status} />}
      />
      <Tile
        label={t.median.label}
        value={formatInt(t.median.value.value)}
        sub={fill(t.median.sub, { target: formatInt(t.median.target.value) })}
        footer={<DataTag status={t.median.value.status} />}
      />
      <ChartFrame
        className="sm:col-span-3 xl:col-span-2"
        titleAs="h2"
        title={mix.title}
        subtitle={mix.subtitle}
        status={mix.segments[0]?.value.status}
        table={{
          caption: mix.title,
          columns: [
            { key: 'level', label: mix.tableColumns.level },
            { key: 'people', label: mix.tableColumns.people, numeric: true },
            { key: 'share', label: mix.tableColumns.share, numeric: true },
          ],
          rows: mix.segments.map((s) => ({
            level: s.level,
            people: formatInt(s.value.value),
            share: formatPct((s.value.value / total) * 100),
          })),
        }}
      >
        <SegmentedBar
          ariaLabel={fill(mix.ariaLabel, { list: mix.segments.map((s) => `${s.level} ${formatInt(s.value.value)}`).join(', ') })}
          segments={mix.segments.map((s) => ({ key: s.level, label: s.level, value: s.value.value }))}
          colors={[...chartColors.ord]}
          unit={mix.unit}
        />
      </ChartFrame>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Queue                                                             */
/* ---------------------------------------------------------------- */

function QueueCard({
  c,
  selected,
  onSelect,
  onOpen,
  moved,
  savedOutcome,
}: {
  c: CallCase;
  selected: boolean;
  onSelect: () => void;
  /** Jump to the case detail when it sits below the list. */
  onOpen: () => void;
  moved: boolean;
  savedOutcome: string | null;
}) {
  const nameId = useDomId('call-name');
  const priorityId = useDomId('call-priority');
  const detailId = useDomId('call-detail');
  const due = moved && c.preference ? c.preference.due : c.due;
  return (
    <li>
      <label className="block">
        <input
          type="radio"
          name="counsellor-queue"
          value={c.id}
          checked={selected}
          onChange={onSelect}
          aria-labelledby={nameId}
          aria-describedby={`${priorityId} ${detailId}`}
          className="peer sr-only"
        />
        <span
          className={cx(
            'peer-ring block cursor-pointer rounded-card border bg-surface p-4 transition-colors',
            selected ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-control',
          )}
        >
          <span className="flex items-start justify-between gap-3">
            <span id={nameId} className="min-w-0 text-[15px] font-semibold leading-snug text-ink">
              {c.name}
            </span>
            <PriorityChip priority={c.priority} id={priorityId} />
          </span>
          <span id={detailId} className="block">
            <span className="mt-0.5 block text-[13px] leading-snug text-ink2">{c.roleLine}</span>
            <span className="mt-3 flex flex-wrap gap-1.5">
              {c.reasons.map((reason) => (
                <Chip key={reason} size="sm" tone="neutral">
                  {reason}
                </Chip>
              ))}
            </span>
            <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-snug">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                <Clock aria-hidden="true" className="h-4 w-4 shrink-0 text-ink2" />
                {due}
              </span>
              {c.deadline ? <span className="text-ink2">{c.deadline}</span> : null}
            </span>
            {moved && c.preference ? (
              <span className="mt-3 flex">
                <StatusPill tone="neutral">{c.preference.chip}</StatusPill>
              </span>
            ) : null}
            {savedOutcome ? (
              <span className="mt-3 flex">
                <StatusPill tone="good">{fill(copy.savedChip, { outcome: savedOutcome })}</StatusPill>
              </span>
            ) : null}
          </span>
        </span>
      </label>
      {selected ? (
        <Button variant="ghost" size="sm" className="mt-1 xl:hidden" icon={<ArrowDown aria-hidden="true" className="h-4 w-4" />} onClick={onOpen}>
          {fill(cc.queue.openCase, { name: c.firstName })}
        </Button>
      ) : null}
    </li>
  );
}

/* ---------------------------------------------------------------- */
/* Case detail                                                       */
/* ---------------------------------------------------------------- */

function SignalsList({ c }: { c: CallCase }) {
  return (
    <section aria-labelledby="why-heading" className="mt-6">
      <h3 id="why-heading" className="m-0 text-[16px] font-semibold">
        {fill(copy.whyTitle, { name: c.firstName })}
      </h3>
      <ul className="m-0 mt-2 list-none divide-y divide-line2 p-0">
        {c.signals.map((s) => (
          <li key={s.id} className="grid gap-1 py-3 sm:grid-cols-[136px_minmax(0,1fr)] sm:gap-4">
            <span className="text-[13px] font-semibold leading-snug text-ink2">{s.tag}</span>
            <span className="min-w-0">
              <span className="block text-sm leading-relaxed text-ink">{s.detail}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink2">
                <span className="sr-only">{copy.sourceWord}: </span>
                {s.source}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-1 text-[13px] leading-snug text-ink2">{copy.whyNote}</p>
    </section>
  );
}

function GapPanel({ gap }: { gap: NonNullable<CallCase['gap']> }) {
  return (
    <section aria-labelledby="gap-heading" className="mt-6 rounded-control border border-line p-4">
      <h3 id="gap-heading" className="m-0 text-[15px] font-semibold">
        {gap.title}
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-control bg-ground p-3">
          <p className="m-0 text-[13px] text-ink2">{gap.managerLabel}</p>
          <p className="m-0 mt-1 text-sm font-semibold leading-snug text-ink">{gap.managerSays}</p>
        </div>
        <div className="rounded-control bg-ground p-3">
          <p className="m-0 text-[13px] text-ink2">{gap.personLabel}</p>
          <p className="m-0 mt-1 text-sm font-semibold leading-snug text-ink">{gap.personSays}</p>
        </div>
      </div>
      <p className="m-0 mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-ink2">
        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        {gap.note}
      </p>
    </section>
  );
}

function CallPlan({ c }: { c: CallCase }) {
  return (
    <section aria-labelledby="plan-heading" className="mt-6 rounded-control bg-ground p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id="plan-heading" className="m-0 text-[16px] font-semibold">
          {copy.planTitle}
        </h3>
        <AiNote agent="Counsellor Copilot">{copy.planAgentNote}</AiNote>
      </div>
      <h4 className="m-0 mt-4 text-sm font-semibold text-ink">{copy.questionsTitle}</h4>
      <ol className="m-0 mt-2 flex list-decimal flex-col gap-1.5 ps-5 text-sm leading-relaxed text-ink marker:text-ink2">
        {c.plan.questions.map((q) => (
          <li key={q} className="ps-1">
            {q}
          </li>
        ))}
      </ol>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <h4 className="m-0 text-sm font-semibold text-ink">{copy.offerTitle}</h4>
          <ul className="m-0 mt-1.5 flex list-disc flex-col gap-1 ps-5 text-sm leading-relaxed text-ink marker:text-ink2">
            {c.plan.offer.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <h4 className="m-0 text-sm font-semibold text-ink">{copy.avoidTitle}</h4>
          <ul className="m-0 mt-1.5 flex list-disc flex-col gap-1 ps-5 text-sm leading-relaxed text-ink marker:text-ink2">
            {c.plan.avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="m-0 mt-4 text-[13px] leading-snug text-ink2">{fill(copy.planFootnote, { name: c.firstName })}</p>
    </section>
  );
}

function AfterCall({ c, w, update }: { c: CallCase; w: CaseWork; update: (patch: Partial<CaseWork>) => void }) {
  const noteId = useDomId('outcome-note');
  const hintId = useDomId('save-hint');
  const outcome = cc.outcomes.find((o) => o.id === w.outcome) ?? null;
  const checkIn = cc.checkIns.find((o) => o.id === w.checkIn);
  const savedRef = useRef<HTMLDivElement>(null);
  const focusSaved = useRef(false);
  useEffect(() => {
    // Saving disables the button, so move focus to the confirmation.
    if (w.saved && focusSaved.current) savedRef.current?.focus();
    focusSaved.current = false;
  }, [w.saved]);
  return (
    <section aria-labelledby="after-heading" className="mt-6 border-t border-line pt-6">
      <h3 id="after-heading" className="m-0 text-[16px] font-semibold">
        {copy.afterTitle}
      </h3>
      <RadioGroup
        className="mt-3"
        legend={copy.outcomeLegend}
        legendClassName="mb-2 p-0 text-sm font-semibold text-ink"
        name={`outcome-${c.id}`}
        variant="compact"
        value={w.outcome}
        onChange={(value) => update({ outcome: value, saved: false })}
        options={cc.outcomes.map((o) => ({ value: o.id, label: o.label }))}
        describedBy={outcome ? noteId : undefined}
      />
      <div aria-live="polite">
        {outcome ? (
          <p id={noteId} className="m-0 mt-3 flex items-start gap-2 rounded-control bg-line2 px-3 py-2.5 text-sm leading-relaxed text-ink">
            <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink2" />
            {fill(outcome.note, { name: c.firstName })}
          </p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <Field label={copy.notesLabel} hint={copy.notesHint}>
          {({ id, describedBy }) => (
            <TextArea id={id} aria-describedby={describedBy} rows={3} value={w.notes} onChange={(e) => update({ notes: e.target.value, saved: false })} />
          )}
        </Field>
        <Field label={copy.checkInLabel}>
          {({ id }) => (
            // The shared select class greys out every select (Chrome matches select:read-only); keep this one white.
            <Select id={id} className="!bg-surface !text-ink" value={w.checkIn} onChange={(e) => update({ checkIn: e.target.value, saved: false })}>
              {cc.checkIns.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          disabled={!outcome || w.saved}
          aria-describedby={outcome ? undefined : hintId}
          onClick={() => {
            focusSaved.current = true;
            update({ saved: true });
          }}
        >
          {copy.save}
        </Button>
        {!outcome ? (
          <p id={hintId} className="m-0 text-[13px] text-ink2">
            {copy.saveHint}
          </p>
        ) : null}
      </div>
      <div aria-live="polite">
        {w.saved && outcome ? (
          <div ref={savedRef} tabIndex={-1} className="mt-4 rounded-control">
            <StatusBanner tone="good">{fill(copy.saved, { name: c.firstName, date: checkIn?.label ?? '' })}</StatusBanner>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CaseDetail({
  c,
  w,
  update,
  moved,
  onReassign,
  onUndo,
}: {
  c: CallCase;
  w: CaseWork;
  update: (patch: Partial<CaseWork>) => void;
  moved: boolean;
  onReassign: () => void;
  onUndo: () => void;
}) {
  const reassigned = moved && Boolean(c.preference);
  const undoRef = useRef<HTMLButtonElement>(null);
  const reassignRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef<'undo' | 'reassign' | null>(null);
  useEffect(() => {
    // The banner swaps its button, so keep keyboard focus on the new one.
    const target = focusNext.current;
    focusNext.current = null;
    if (target === 'undo') undoRef.current?.focus();
    else if (target === 'reassign') reassignRef.current?.focus();
  }, [reassigned]);
  return (
    <section id="case-detail" aria-labelledby="case-name" className="min-w-0 scroll-mt-32 rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-[260px]">
          <h2 id="case-name" tabIndex={-1} className="m-0 rounded-control text-[22px] font-bold leading-tight">
            {c.name}
          </h2>
          <p className="m-0 mt-1 text-sm leading-snug text-ink2">{c.roleLine}</p>
        </div>
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          {w.call === 'calling' ? (
            <Button variant="secondary" icon={<PhoneOff aria-hidden="true" className="h-4 w-4" />} onClick={() => update({ call: 'ended' })}>
              {copy.endCall}
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={reassigned}
              icon={<Phone aria-hidden="true" className="h-4 w-4" />}
              onClick={() => update({ call: 'calling' })}
            >
              {copy.call}
            </Button>
          )}
          {reassigned && c.preference ? <p className="m-0 text-[13px] text-ink2">{c.preference.callNote}</p> : null}
        </div>
      </div>
      <p className="m-0 mt-3 flex flex-wrap gap-2">
        <PriorityChip priority={c.priority} />
        <Chip tone="neutral">{fill(copy.supportLevel, { level: c.supportLevel })}</Chip>
        <Chip icon={<CalendarClock aria-hidden="true" className="h-4 w-4" />}>{fill(copy.lastContact, { when: c.lastContact })}</Chip>
      </p>

      <div aria-live="polite">
        {w.call === 'calling' ? (
          <StatusBanner tone="accent" className="mt-4" icon={<Phone aria-hidden="true" className="h-4 w-4 text-accent" />}>
            {copy.calling}
          </StatusBanner>
        ) : null}
        {w.call === 'ended' ? (
          <StatusBanner tone="neutral" className="mt-4">
            {copy.ended}
          </StatusBanner>
        ) : null}
      </div>

      {c.preference ? (
        <div aria-live="polite">
          {reassigned ? (
            <StatusBanner tone="good" className="mt-4" icon={<UserRoundCheck aria-hidden="true" className="h-4 w-4 text-good-icon" />}>
              <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span>{c.preference.done}</span>
                <Button
                  ref={undoRef}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    focusNext.current = 'reassign';
                    onUndo();
                  }}
                >
                  {copy.undo}
                </Button>
              </span>
            </StatusBanner>
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-control bg-warn-bg px-4 py-3">
              <p className="m-0 flex min-w-0 flex-1 basis-[240px] items-start gap-2 text-sm leading-relaxed text-ink">
                <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-warn-text" />
                <span>
                  <span className="font-semibold text-warn-text">{copy.preferenceLabel}: </span>
                  {c.preference.text}
                </span>
              </p>
              <Button
                ref={reassignRef}
                variant="secondary"
                size="sm"
                onClick={() => {
                  focusNext.current = 'undo';
                  onReassign();
                }}
              >
                {c.preference.action}
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <SignalsList c={c} />
      {c.gap ? <GapPanel gap={c.gap} /> : null}
      <CallPlan c={c} />

      {reassigned && c.preference ? (
        <section aria-labelledby="after-heading" className="mt-6 border-t border-line pt-6">
          <h3 id="after-heading" className="m-0 text-[16px] font-semibold">
            {copy.afterTitle}
          </h3>
          <StatusBanner tone="neutral" className="mt-3">
            {c.preference.outcomeNote}
          </StatusBanner>
        </section>
      ) : (
        <AfterCall c={c} w={w} update={update} />
      )}

      <p className="m-0 mt-6 flex items-start gap-2 border-t border-line2 pt-4 text-[13px] leading-relaxed text-ink2">
        <Eye aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        {fill(copy.footnote, { name: c.firstName })}
      </p>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Screen                                                            */
/* ---------------------------------------------------------------- */

export function CounsellorConsole() {
  const firstId = cc.cases[0]?.id ?? '';
  const [selectedId, setSelectedId] = useState<string>(firstId);
  const [moved, setMoved] = useState(false);
  const [work, setWork] = useState<Record<string, CaseWork>>(initialWork);

  const selected = cc.cases.find((c) => c.id === selectedId) ?? cc.cases[0];
  const isMoved = (c: CallCase) => moved && Boolean(c.preference);
  const mine = cc.cases.filter((c) => !isMoved(c));
  const callsToday = mine.filter((c) => c.today).length;
  const movedCount = cc.cases.length - mine.length;

  function updateCase(id: string, patch: Partial<CaseWork>) {
    setWork((all) => {
      const current = all[id];
      if (!current) return all;
      return { ...all, [id]: { ...current, ...patch } };
    });
  }

  const summary =
    movedCount > 0
      ? fill(cc.header.summaryMoved, { calls: mine.length, today: callsToday, moved: movedCount, colleague: cc.header.colleague })
      : fill(cc.header.summary, { calls: mine.length, today: callsToday });

  /** Below the xl breakpoint the case detail sits under the list: scroll to it and move focus to its heading. */
  function openCase() {
    document.getElementById('case-detail')?.scrollIntoView({ block: 'start' });
    document.getElementById('case-name')?.focus({ preventScroll: true });
  }

  return (
    <AppShell
      portal="staff"
      persona="aisha"
      extraChips={
        <Chip tone="outline" icon={<Eye aria-hidden="true" className="h-4 w-4" />}>
          {cc.header.accessChip}
        </Chip>
      }
    >
      <PageHeader
        eyebrow={cc.header.eyebrow}
        title={cc.header.title}
        description={
          <>
            <span className="block font-medium text-ink" aria-live="polite">
              {summary}
            </span>
            <span className="mt-1 block text-sm">{cc.header.copilot}</span>
          </>
        }
      />

      <Summary callsThisWeek={mine.length} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
        <section aria-labelledby="queue-heading" className="min-w-0">
          <h2 id="queue-heading" className="m-0 text-[17px] font-semibold">
            {cc.queue.title}
          </h2>
          <p className="m-0 mb-3 mt-1 text-[13px] leading-snug text-ink2">{cc.queue.subtitle}</p>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="sr-only">{cc.queue.legend}</legend>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {cc.cases.map((c) => {
                const w = work[c.id];
                const saved = w?.saved ? (cc.outcomes.find((o) => o.id === w.outcome)?.label ?? null) : null;
                return (
                  <QueueCard
                    key={c.id}
                    c={c}
                    selected={c.id === selected?.id}
                    onSelect={() => setSelectedId(c.id)}
                    onOpen={openCase}
                    moved={isMoved(c)}
                    savedOutcome={isMoved(c) ? null : saved}
                  />
                );
              })}
            </ul>
          </fieldset>
          <p className="m-0 mt-3 text-[13px] leading-snug text-ink2">{cc.queue.guardrail}</p>
        </section>

        {selected && work[selected.id] ? (
          <CaseDetail
            key={selected.id}
            c={selected}
            w={work[selected.id] as CaseWork}
            update={(patch) => updateCase(selected.id, patch)}
            moved={moved}
            onReassign={() => {
              setMoved(true);
              updateCase(selected.id, { call: 'idle' });
            }}
            onUndo={() => setMoved(false)}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
