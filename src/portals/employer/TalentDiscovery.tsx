import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { MapPin, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { AiNote } from '@/components/AiNote';
import { Button } from '@/components/Button';
import { Card, PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { Checkbox, Field, TextArea } from '@/components/Field';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { inputClass } from '@/components/classes';
import { cx } from '@/lib/cx';
import { useDomId } from '@/lib/useId';
import { fill, formatAEDRange, formatInt, formatPct } from '@/lib/format';
import {
  availabilityGroups,
  discoveryCopy as copy,
  eqs,
  introductions,
  retention,
  roleProfile,
  talentCards,
  type AvailabilityKey,
  type TalentCard,
} from '@/data/employer';
import { focusInView } from './focus';

type GroupState = Record<AvailabilityKey, boolean>;

const allGroupsOn = Object.fromEntries(availabilityGroups.map((g) => [g.key, true])) as GroupState;

/** One Introduction Request per Talent Card. Once sent, it keeps what was sent. */
interface Draft {
  payFrom: string;
  payTo: string;
  hours: string;
  message: string;
  /** Set by the first send attempt, so a pay error shows only once it matters. */
  tried: boolean;
}

/** A fresh request: terms from the Role Profile and the Employer Agent's draft message for this card. */
function newDraft(card: TalentCard): Draft {
  return {
    payFrom: formatInt(roleProfile.payMin.value),
    payTo: formatInt(roleProfile.payMax.value),
    hours: fill(copy.request.hoursValue, { hours: roleProfile.hours, site: roleProfile.site }),
    message: fill(copy.request.messageDraft, { title: roleProfile.title, site: roleProfile.site, gap: card.gap }),
    tried: false,
  };
}

/** Reads "9,500" or "9500"; null when empty, NaN when it is not a positive number. */
function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[\s,]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : Number.NaN;
}

function payProblem(from: string, to: string): string | null {
  const low = parseAmount(from);
  const high = parseAmount(to);
  if (low === null || high === null) return copy.request.payMissing;
  if (Number.isNaN(low) || Number.isNaN(high)) return copy.request.payNumbers;
  if (low > high) return copy.request.payOrder;
  return null;
}

function RoleProfileBar() {
  const r = copy.role;
  return (
    <Card aria-labelledby="role-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink2">{r.eyebrow}</p>
          <h2 id="role-heading" className="m-0 mt-0.5 text-[20px] font-semibold leading-snug text-ink">
            {fill(r.heading, { title: roleProfile.title, site: roleProfile.site })}
          </h2>
        </div>
        <DataTag status={roleProfile.payMin.status} />
      </div>
      <dl className="m-0 flex flex-wrap gap-x-10 gap-y-3">
        <div className="min-w-0">
          <dt className="text-[13px] font-medium text-ink2">{r.pay}</dt>
          <dd className="m-0 mt-0.5 text-[15px] font-semibold text-ink">
            {formatAEDRange(roleProfile.payMin.value, roleProfile.payMax.value)} {r.payUnit}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] font-medium text-ink2">{r.hours}</dt>
          <dd className="m-0 mt-0.5 text-[15px] font-semibold text-ink">{roleProfile.hours}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] font-medium text-ink2">{r.start}</dt>
          <dd className="m-0 mt-0.5 text-[15px] font-semibold text-ink">{roleProfile.start}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] font-medium text-ink2">{r.mustHaves}</dt>
          <dd className="m-0 mt-1">
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {roleProfile.mustHaves.map((m) => (
                <li key={m}>
                  <Chip size="sm" tone="outline">
                    {m}
                  </Chip>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </Card>
  );
}

function FiltersCard({ groups, onToggle }: { groups: GroupState; onToggle: (key: AvailabilityKey, on: boolean) => void }) {
  const f = copy.filters;
  return (
    <Card aria-labelledby="filters-heading">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h2 id="filters-heading" className="m-0 text-[17px] font-semibold leading-snug text-ink">
          {f.heading}
        </h2>
        <DataTag status={availabilityGroups[0]?.available.status ?? 'sample'} />
      </div>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-1 p-0 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink2">{f.legend}</legend>
        <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
          {availabilityGroups.map((g) => (
            <Checkbox
              key={g.key}
              label={g.label}
              description={fill(f.count, { count: formatInt(g.available.value) })}
              checked={groups[g.key]}
              onChange={(on) => onToggle(g.key, on)}
            />
          ))}
        </div>
      </fieldset>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <p className="m-0 flex items-start gap-2 rounded-control bg-ground px-3 py-2.5 text-[13px] leading-relaxed text-ink">
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink2" />
          <span>{f.travel}</span>
        </p>
        <p className="m-0 flex items-start gap-2 rounded-control bg-ground px-3 py-2.5 text-[13px] leading-relaxed text-ink">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink2" />
          <span>{f.notFilters}</span>
        </p>
      </div>
    </Card>
  );
}

function TalentCardView({ card, selected, sent, onChoose }: { card: TalentCard; selected: boolean; sent: boolean; onChoose: () => void }) {
  const c = copy.card;
  const headingId = `talent-card-${card.code}`;
  return (
    <article
      aria-labelledby={headingId}
      className={cx(
        'flex h-full min-w-0 flex-col gap-4 rounded-card border bg-surface p-5 transition-colors',
        selected ? 'border-accent ring-1 ring-inset ring-accent' : 'border-line',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="m-0 text-[13px] font-medium text-ink2">{c.eyebrow}</p>
          <h3 id={headingId} className="m-0 font-heading text-[20px] font-bold tracking-[0.02em] text-ink">
            {card.code}
          </h3>
        </div>
        <Chip tone="neutral">{card.availability}</Chip>
      </div>
      <p className="m-0 text-sm leading-relaxed text-ink">{card.background}</p>
      <div>
        <p className="m-0 mb-1.5 text-[13px] font-medium text-ink2">{c.skills}</p>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {card.skills.map((s) => (
            <li key={s}>
              <Chip size="sm" tone="outline">
                {s}
              </Chip>
            </li>
          ))}
        </ul>
      </div>
      <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm leading-snug">
        <dt className="text-ink2">{c.fit}</dt>
        <dd className="m-0 font-semibold text-ink">{card.fit}</dd>
        <dt className="text-ink2">{c.terms}</dt>
        <dd className="m-0 text-ink">
          {card.terms}
          {card.termsNote ? <span className="mt-0.5 block text-ink2">{card.termsNote}</span> : null}
        </dd>
        <dt className="text-ink2">{c.gap}</dt>
        <dd className="m-0 text-ink">{card.gap}</dd>
      </dl>
      <p className="m-0 text-[13px] leading-relaxed text-ink2">
        <span className="font-semibold text-ink">{c.why}</span> {card.why}
      </p>
      <div className="mt-auto flex min-h-touch flex-wrap items-center gap-2 border-t border-line2 pt-3">
        {selected ? (
          <StatusPill tone="accent">{c.selected}</StatusPill>
        ) : (
          <Button variant={sent ? 'secondary' : 'primary'} size="sm" onClick={onChoose}>
            {sent ? c.view : c.write}
            <span className="sr-only"> for {card.code}</span>
          </Button>
        )}
        {sent ? <StatusPill tone="good">{c.sent}</StatusPill> : null}
      </div>
    </article>
  );
}

interface RequestPanelProps {
  headingRef: RefObject<HTMLHeadingElement>;
  payFromRef: RefObject<HTMLInputElement>;
  sentRef: RefObject<HTMLDivElement>;
  card: TalentCard | null;
  draft: Draft | null;
  hiddenSelected: boolean;
  isSent: boolean;
  /** The pay problem to show inline, or null. */
  payError: string | null;
  notice: string | null;
  left: number;
  total: number;
  onDraft: (patch: Partial<Draft>) => void;
  onSend: () => void;
}

function RequestPanel(p: RequestPanelProps) {
  const r = copy.request;
  const payHintId = useDomId('pay-hint');
  const payErrorId = useDomId('pay-error');
  const fromId = useDomId('pay-from');
  const toId = useDomId('pay-to');
  const messageId = useDomId('message');
  const messageNoteId = useDomId('message-note');
  const payDescribedBy = [payHintId, p.payError ? payErrorId : null].filter(Boolean).join(' ');
  const draft = p.draft;

  function submit(e: FormEvent) {
    e.preventDefault();
    p.onSend();
  }

  return (
    <Card aria-labelledby="request-heading" className="flex min-w-0 flex-col gap-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 id="request-heading" ref={p.headingRef} tabIndex={-1} className="m-0 text-[17px] font-semibold leading-snug text-ink">
            {r.heading}
          </h2>
          <DataTag status={introductions.perMonth.status} />
        </div>
        {p.card ? <p className="m-0 mt-1 text-sm font-medium text-ink">{fill(r.to, { code: p.card.code })}</p> : null}
      </div>

      {p.card && draft ? (
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <fieldset disabled={p.isSent} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
            <legend className="sr-only">{fill(r.to, { code: p.card.code })}</legend>
            <Field label={r.role} hint={r.roleHint}>
              {(ids) => (
                <input
                  id={ids.id}
                  aria-describedby={ids.describedBy}
                  className={inputClass}
                  value={fill(r.roleValue, { title: roleProfile.title, site: roleProfile.site })}
                  readOnly
                />
              )}
            </Field>

            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-1 p-0 text-sm font-semibold text-ink">
                {r.pay} <span className="font-normal text-ink2">{r.required}</span>
              </legend>
              <p id={payHintId} className="m-0 mb-2 text-[13px] leading-snug text-ink2">
                {r.payHint}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <label htmlFor={fromId} className="text-[13px] font-medium text-ink2">
                    {r.payFrom}
                  </label>
                  <input
                    ref={p.payFromRef}
                    id={fromId}
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    aria-invalid={p.payError ? true : undefined}
                    aria-describedby={payDescribedBy}
                    className={cx(inputClass, 'tabular', p.payError && 'border-crit-text')}
                    value={draft.payFrom}
                    onChange={(e) => p.onDraft({ payFrom: e.target.value })}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <label htmlFor={toId} className="text-[13px] font-medium text-ink2">
                    {r.payTo}
                  </label>
                  <input
                    id={toId}
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    aria-invalid={p.payError ? true : undefined}
                    aria-describedby={payDescribedBy}
                    className={cx(inputClass, 'tabular', p.payError && 'border-crit-text')}
                    value={draft.payTo}
                    onChange={(e) => p.onDraft({ payTo: e.target.value })}
                  />
                </div>
              </div>
              {p.payError ? (
                <p id={payErrorId} className="m-0 mt-2 text-[13px] font-medium leading-snug text-crit-text">
                  {p.payError}
                </p>
              ) : null}
            </fieldset>

            <Field label={r.hours}>
              {(ids) => (
                <input
                  id={ids.id}
                  aria-describedby={ids.describedBy}
                  className={inputClass}
                  value={draft.hours}
                  onChange={(e) => p.onDraft({ hours: e.target.value })}
                />
              )}
            </Field>

            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor={messageId} className="text-sm font-semibold text-ink">
                {r.message}
              </label>
              <div id={messageNoteId}>
                <AiNote agent="Employer Agent" prefix={r.draftedBy}>
                  {r.draftedDecide}
                </AiNote>
              </div>
              <TextArea
                id={messageId}
                aria-describedby={messageNoteId}
                rows={5}
                value={draft.message}
                onChange={(e) => p.onDraft({ message: e.target.value })}
              />
            </div>
          </fieldset>

          <p className="m-0 rounded-control bg-ground px-3 py-2.5 text-sm leading-relaxed text-ink">
            {fill(r.coachNote, { band: eqs.band, retention: formatPct(retention.company.value) })}
          </p>

          {!p.isSent ? (
            <Button type="submit" variant="primary" className="w-full">
              {r.send}
            </Button>
          ) : null}
        </form>
      ) : (
        <p className="m-0 rounded-control bg-ground px-3 py-3 text-sm leading-relaxed text-ink2">{p.hiddenSelected ? r.hidden : r.choose}</p>
      )}

      {/* Focus moves here after a send, so screen readers read the confirmation once. */}
      {p.card && p.isSent ? (
        <div ref={p.sentRef} tabIndex={-1} className="rounded-control">
          <StatusBanner tone="good">{r.sent}</StatusBanner>
        </div>
      ) : null}
      <div role="status">{p.notice && !p.isSent ? <StatusBanner tone="critical">{p.notice}</StatusBanner> : null}</div>

      <p className="m-0 text-sm font-semibold text-ink" aria-live="polite">
        {fill(r.counter, { left: formatInt(p.left), total: formatInt(p.total) })}
      </p>
      <p className="m-0 border-t border-line2 pt-3 text-[13px] leading-relaxed text-ink2">{r.footnote}</p>
    </Card>
  );
}

/** Talent Discovery: anonymous Talent Cards ranked for one Role Profile, and an Introduction Request. */
export function TalentDiscovery() {
  const [groups, setGroups] = useState<GroupState>(allGroupsOn);
  const [selected, setSelected] = useState<string | null>(talentCards[0]?.code ?? null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => Object.fromEntries(talentCards.map((c) => [c.code, newDraft(c)])));
  const [notice, setNotice] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const payFromRef = useRef<HTMLInputElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  /** Where focus goes once the next render is on screen. */
  const pendingFocus = useRef<'heading' | 'sent' | null>(null);

  const visible = talentCards.filter((c) => groups[c.group]);
  const count = availabilityGroups.filter((g) => groups[g.key]).reduce((sum, g) => sum + g.available.value, 0);
  const card = visible.find((c) => c.code === selected) ?? null;
  const draft = card ? (drafts[card.code] ?? null) : null;
  const isSent = card ? Boolean(sent[card.code]) : false;
  const total = introductions.perMonth.value;
  const left = Math.max(0, total - Object.keys(sent).length);
  const payError = draft ? payProblem(draft.payFrom, draft.payTo) : null;

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    focusInView(target === 'sent' ? sentRef.current : headingRef.current);
  });

  function updateDraft(patch: Partial<Draft>) {
    if (!card) return;
    const code = card.code;
    setDrafts((all) => {
      const current = all[code];
      return current ? { ...all, [code]: { ...current, ...patch } } : all;
    });
  }

  function choose(code: string) {
    setNotice(null);
    if (code === selected) {
      focusInView(headingRef.current);
      return;
    }
    pendingFocus.current = 'heading';
    setSelected(code);
  }

  function send() {
    if (!card || !draft || isSent) return;
    if (payError) {
      // Render the inline error first, so the pay field is announced with it. Runs on every attempt.
      flushSync(() => {
        updateDraft({ tried: true });
        setNotice(fill(copy.request.notSent, { reason: payError }));
      });
      focusInView(payFromRef.current);
      return;
    }
    if (left < 1) {
      setNotice(copy.request.noneLeft);
      return;
    }
    setNotice(null);
    pendingFocus.current = 'sent';
    setSent((s) => ({ ...s, [card.code]: true }));
  }

  const res = copy.results;

  return (
    <AppShell portal="employer" persona="huda">
      <PageHeader title={copy.title} description={copy.intro} />
      <div className="flex flex-col gap-6">
        <RoleProfileBar />
        <FiltersCard groups={groups} onToggle={(key, on) => setGroups((g) => ({ ...g, [key]: on }))} />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-labelledby="results-heading" className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h2 id="results-heading" className="m-0 text-[20px] font-semibold leading-snug text-ink">
                  {fill(visible.length ? res.heading : res.emptyHeading, { count: formatInt(count) })}
                </h2>
                <DataTag status={talentCards[0]?.status ?? 'sample'} />
              </div>
              <p className="m-0 text-sm text-ink2" aria-live="polite">
                {visible.length ? fill(res.showing, { shown: formatInt(visible.length), count: formatInt(count) }) : res.none}
              </p>
            </div>
            {visible.length ? (
              <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
                {visible.map((c) => (
                  <li key={c.code} className="min-w-0">
                    <TalentCardView card={c} selected={c.code === card?.code} sent={Boolean(sent[c.code])} onChoose={() => choose(c.code)} />
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-col gap-1 text-[13px] leading-relaxed text-ink2">
              <p className="m-0">{res.anonymous}</p>
              <p className="m-0">{res.rankNote}</p>
            </div>
          </section>

          <RequestPanel
            headingRef={headingRef}
            payFromRef={payFromRef}
            sentRef={sentRef}
            card={card}
            draft={draft}
            hiddenSelected={selected != null && card == null}
            isSent={isSent}
            payError={draft?.tried ? payError : null}
            notice={notice}
            left={left}
            total={total}
            onDraft={(patch) => {
              updateDraft(patch);
              if (patch.payFrom !== undefined || patch.payTo !== undefined) setNotice(null);
            }}
            onSend={send}
          />
        </div>
      </div>
    </AppShell>
  );
}
