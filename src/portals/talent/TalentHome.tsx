import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, BookOpen, CalendarClock, ChevronDown, ChevronRight, ClipboardCheck, Clock, Info, Undo2 } from 'lucide-react';
import { PhoneHeader, PhoneShell } from '@/app/PhoneShell';
import { AiNote } from '@/components/AiNote';
import { Button, TextLink } from '@/components/Button';
import { Chip, DataTag } from '@/components/Chip';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { SegmentProgress, Stepper, type Step } from '@/components/Stepper';
import { cx } from '@/lib/cx';
import { fill, formatAEDRange, formatPct } from '@/lib/format';
import { introRequest, talentHome as copy, talentStages } from '@/data/talent';
import { useFocusOnChange } from './focus';
import { IconTile, PhoneCard, SectionHeading } from './parts';

type RequestState = 'pending' | 'accepted' | 'declined';
type CoachState = 'asking' | 'drafted' | 'later';

const payRange = formatAEDRange(introRequest.pay.value.min, introRequest.pay.value.max);

function NotificationButton({ open, unread, onToggle }: { open: boolean; unread: number; onToggle: () => void }) {
  const label = unread > 0 ? fill(copy.notifications.label, { count: unread }) : copy.notifications.labelNone;
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="th-notes"
      aria-label={label}
      onClick={onToggle}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-control border border-control bg-surface text-ink hover:bg-accent-tint"
    >
      <Bell aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
      {unread > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -end-1.5 -top-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-crit-text px-1 text-[11px] font-semibold leading-none text-white"
        >
          {unread}
        </span>
      ) : null}
    </button>
  );
}

function ProgressCard() {
  const [open, setOpen] = useState(false);
  const current = copy.stage.current.value;
  const total = talentStages.length;
  const steps: Step[] = talentStages.map((label, i) => ({
    label,
    state: i + 1 < current ? 'done' : i + 1 === current ? 'current' : 'upcoming',
  }));
  return (
    <PhoneCard aria-labelledby="th-stage">
      <SectionHeading id="th-stage">{fill(copy.stage.heading, { current, total, label: copy.stage.label })}</SectionHeading>
      <Link to="/talent/path" className="group mt-3 block rounded-control no-underline">
        <SegmentProgress total={total} done={current} label={fill(copy.stage.barLabel, { current, total })} />
        <span className="mt-1 inline-flex min-h-touch items-center gap-1.5 text-[15px] font-medium text-accent group-hover:text-accent-hover group-hover:underline">
          {copy.stage.link}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </span>
      </Link>
      <p className="m-0 text-sm leading-relaxed text-ink2">{copy.stage.summary}</p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="th-stages"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 inline-flex min-h-touch items-center gap-1.5 rounded-control text-sm font-medium text-accent hover:text-accent-hover hover:underline"
      >
        {open ? copy.stage.hide : fill(copy.stage.show, { total })}
        <ChevronDown aria-hidden="true" className={cx('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      <div id="th-stages" hidden={!open}>
        {open ? <Stepper steps={steps} label={fill(copy.stage.listLabel, { total })} orientation="vertical" className="mt-2" /> : null}
      </div>
    </PhoneCard>
  );
}

function NextSteps({ request, onConfirm }: { request: RequestState; onConfirm: () => void }) {
  const n = copy.next;
  return (
    <section aria-labelledby="th-next">
      <SectionHeading id="th-next" className="mb-3">
        {n.heading}
      </SectionHeading>
      <ul className="m-0 list-none overflow-hidden rounded-card border border-line bg-surface p-0">
        <li className="flex items-center gap-3 border-b border-line2 px-4 py-3">
          <IconTile>
            <CalendarClock className="h-[18px] w-[18px]" strokeWidth={2} />
          </IconTile>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[15px] font-semibold leading-snug text-ink">{n.interview.title}</p>
            <p className="m-0 mt-0.5 text-[13px] leading-snug text-ink2">{n.interview.detail}</p>
          </div>
          {request === 'pending' ? (
            <Button variant="primary" size="sm" aria-label={n.interview.actionLabel} onClick={onConfirm}>
              {n.interview.action}
            </Button>
          ) : (
            <StatusPill tone={request === 'accepted' ? 'good' : 'neutral'}>
              {request === 'accepted' ? n.interview.confirmed : n.interview.declined}
            </StatusPill>
          )}
        </li>
        <li className="flex items-center gap-3 border-b border-line2 px-4 py-3">
          <IconTile>
            <BookOpen className="h-[18px] w-[18px]" strokeWidth={2} />
          </IconTile>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[15px] font-semibold leading-snug text-ink">{n.excel.title}</p>
            <p className="m-0 mt-0.5 text-[13px] leading-snug text-ink2">
              {fill(n.excel.detail, { lessons: n.excel.lessons.value, minutes: n.excel.minutes.value })}
            </p>
          </div>
        </li>
        <li>
          <Link
            to="/talent/alignment-check"
            className="group flex min-h-touch items-center gap-3 px-4 py-3 text-ink no-underline hover:bg-accent-tint hover:text-ink"
          >
            <IconTile>
              <ClipboardCheck className="h-[18px] w-[18px]" strokeWidth={2} />
            </IconTile>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-snug text-accent group-hover:text-accent-hover group-hover:underline">
                {n.alignment.title}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink2">{n.alignment.detail}</span>
            </span>
            <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-ink2" />
          </Link>
        </li>
      </ul>
    </section>
  );
}

function CoachCard() {
  const c = copy.coach;
  const [state, setState] = useState<CoachState>('asking');
  const focusRef = useRef<HTMLElement | null>(null);
  useFocusOnChange(state, focusRef);
  const setFocus = (el: HTMLElement | null) => {
    focusRef.current = el;
  };

  return (
    <PhoneCard aria-labelledby="th-coach">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <SectionHeading id="th-coach">{c.heading}</SectionHeading>
        <AiNote agent="Coach Agent">{c.decides}</AiNote>
      </div>
      <p className="m-0 mt-3 rounded-control bg-ground px-3 py-2.5 text-[15px] leading-relaxed text-ink">{c.message}</p>

      {state === 'asking' ? (
        <div className="mt-3 flex gap-2">
          <Button ref={setFocus} variant="primary" className="flex-1" onClick={() => setState('drafted')}>
            {c.draft}
          </Button>
          <Button className="flex-1" onClick={() => setState('later')}>
            {c.notNow}
          </Button>
        </div>
      ) : null}

      {state === 'drafted' ? (
        <div className="mt-3 rounded-control border border-line p-3">
          <h3 ref={setFocus} tabIndex={-1} className="m-0 text-[15px] font-semibold leading-snug text-ink">
            {c.draftedHeading}
          </h3>
          <ol className="m-0 mt-2 flex list-decimal flex-col gap-2.5 ps-5 text-sm leading-snug text-ink">
            {c.drafted.map((d) => (
              <li key={d.q} className="ps-1">
                <span className="font-medium">{d.q}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink2">{d.answer}</span>
              </li>
            ))}
          </ol>
          <p className="m-0 mt-3 text-[13px] leading-snug text-ink2">{c.draftedNote}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <AiNote agent="Coach Agent">{c.draftedDecides}</AiNote>
            <Button variant="ghost" size="sm" icon={<Undo2 aria-hidden="true" className="h-4 w-4" />} onClick={() => setState('asking')}>
              {c.undo}
            </Button>
          </div>
        </div>
      ) : null}

      {state === 'later' ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p ref={setFocus} tabIndex={-1} className="m-0 text-sm leading-snug text-ink">
            {c.later}
          </p>
          <Button variant="ghost" size="sm" icon={<Undo2 aria-hidden="true" className="h-4 w-4" />} onClick={() => setState('asking')}>
            {c.undo}
          </Button>
        </div>
      ) : null}

      <p className="m-0 mt-3 text-[13px] leading-snug text-ink2">{c.why}</p>
    </PhoneCard>
  );
}

interface RequestCardProps {
  state: RequestState;
  onStateChange: (next: RequestState) => void;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  showHint: boolean;
  headingRef: RefObject<HTMLHeadingElement>;
}

function RequestCard({ state, onStateChange, open, onOpenChange, showHint, headingRef }: RequestCardProps) {
  const r = copy.request;
  const focusRef = useRef<HTMLElement | null>(null);
  useFocusOnChange(state, focusRef);
  const setFocus = (el: HTMLElement | null) => {
    focusRef.current = el;
  };

  const rows: Array<{ label: string; value: ReactNode }> = [
    { label: r.rows.pay, value: `${payRange} ${r.payUnit}` },
    { label: r.rows.role, value: introRequest.role },
    { label: r.rows.site, value: introRequest.site },
    { label: r.rows.hours, value: introRequest.hours },
    { label: r.rows.start, value: introRequest.start },
    { label: r.rows.interview, value: introRequest.interview },
    { label: r.rows.eqs, value: introRequest.eqsBand },
    {
      label: r.rows.retention,
      value: fill(r.retentionValue, {
        value: formatPct(introRequest.retention.value),
        sector: formatPct(introRequest.sectorRetention.value),
      }),
    },
  ];

  return (
    <PhoneCard aria-labelledby="th-request">
      <div className="flex items-center justify-between gap-3">
        <h2 ref={headingRef} id="th-request" tabIndex={-1} className="m-0 text-[17px] font-semibold leading-snug text-ink">
          {r.heading}
        </h2>
        <DataTag status={introRequest.pay.status} />
      </div>

      {/* Pay range first, always: it leads the request, before the role and the deadline. */}
      <p className="m-0 mt-2 flex flex-wrap items-baseline gap-x-1.5 font-heading leading-tight text-ink">
        <span className="text-[24px] font-semibold">{payRange}</span>
        <span className="font-sans text-sm font-medium text-ink2">{r.payUnit}</span>
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <p className="m-0 text-[15px] font-medium leading-snug text-ink">
          {fill(r.roleLine, { role: introRequest.role, employer: introRequest.employer })}
        </p>
        {state === 'pending' ? (
          <Chip tone="warning" size="sm" icon={<Clock aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />}>
            {fill(r.daysLeft, { days: introRequest.daysLeft.value })}
          </Chip>
        ) : null}
      </div>
      <p className="m-0 mt-1.5 text-[13px] leading-snug text-ink2">{r.anonNote}</p>

      <Button
        ref={state === 'pending' ? setFocus : undefined}
        className="mt-3 w-full"
        aria-expanded={open}
        aria-controls="th-request-details"
        onClick={() => onOpenChange(!open)}
        iconEnd={<ChevronDown aria-hidden="true" className={cx('h-4 w-4 transition-transform', open && 'rotate-180')} />}
      >
        {open ? r.hide : r.see}
      </Button>

      <div id="th-request-details" hidden={!open}>
        {open ? (
          <div className="mt-4 flex flex-col gap-4">
            {showHint && state === 'pending' ? (
              <StatusBanner tone="neutral" icon={<Info aria-hidden="true" className="h-4 w-4 text-ink2" strokeWidth={2} />}>
                {r.confirmHint}
              </StatusBanner>
            ) : null}
            <dl className="m-0 overflow-hidden rounded-control border border-line">
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className={cx('flex items-baseline justify-between gap-3 px-3 py-2.5', i > 0 && 'border-t border-line2', i === 0 && 'bg-ground')}
                >
                  <dt className={cx('text-[13px] text-ink2', i === 0 && 'font-semibold text-ink')}>{row.label}</dt>
                  <dd className={cx('m-0 text-end text-sm text-ink', i === 0 ? 'font-semibold' : 'font-medium')}>{row.value}</dd>
                </div>
              ))}
            </dl>
            <figure className="m-0">
              <figcaption className="text-[13px] font-semibold text-ink2">{r.messageLabel}</figcaption>
              <blockquote className="m-0 mt-1 border-s-2 border-line ps-3 text-sm leading-relaxed text-ink">{introRequest.message}</blockquote>
            </figure>
            <p className="m-0 text-sm leading-relaxed text-ink">{r.shares}</p>
            {state === 'pending' ? (
              <div className="flex flex-col gap-2">
                <Button variant="primary" onClick={() => onStateChange('accepted')}>
                  {r.accept}
                </Button>
                <Button onClick={() => onStateChange('declined')}>{r.decline}</Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {state !== 'pending' ? (
        <div className="mt-4">
          <div ref={setFocus} tabIndex={-1}>
            <StatusBanner tone={state === 'accepted' ? 'good' : 'neutral'}>{state === 'accepted' ? r.accepted : r.declined}</StatusBanner>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4">
            {state === 'accepted' ? (
              <TextLink to="/talent/privacy" className="inline-flex min-h-touch items-center text-sm">
                {r.privacyLink}
              </TextLink>
            ) : (
              <span />
            )}
            <Button variant="ghost" size="sm" icon={<Undo2 aria-hidden="true" className="h-4 w-4" />} onClick={() => onStateChange('pending')}>
              {r.undo}
            </Button>
          </div>
        </div>
      ) : null}
    </PhoneCard>
  );
}

export function TalentHome() {
  const [notesOpen, setNotesOpen] = useState(false);
  const [unread, setUnread] = useState(copy.notifications.items.length);
  const [request, setRequest] = useState<RequestState>('pending');
  const [requestOpen, setRequestOpen] = useState(false);
  const [confirmHint, setConfirmHint] = useState(false);
  const requestHeadingRef = useRef<HTMLHeadingElement>(null);

  function toggleNotes() {
    setNotesOpen((v) => !v);
    setUnread(0);
  }

  function confirmInterview() {
    setRequestOpen(true);
    setConfirmHint(true);
    requestHeadingRef.current?.focus();
  }

  return (
    <PhoneShell persona="mariam">
      <PhoneHeader actions={<NotificationButton open={notesOpen} unread={unread} onToggle={toggleNotes} />}>
        <p className="m-0 text-[13px] leading-snug text-ink2">{copy.date}</p>
        <h1 className="m-0 mt-1 flex flex-col items-start gap-0.5">
          <span lang="ar" dir="rtl" className="font-arabic-heading text-[24px] font-bold leading-snug text-ink">
            {copy.greetingAr}
          </span>
          <span className="font-sans text-base font-medium leading-snug text-ink2">{copy.greetingEn}</span>
        </h1>
      </PhoneHeader>

      <div id="th-notes" hidden={!notesOpen} className="mb-6">
        {notesOpen ? (
          <PhoneCard aria-labelledby="th-notes-heading">
            <SectionHeading id="th-notes-heading" className="text-[15px]">
              {copy.notifications.heading}
            </SectionHeading>
            <ul className="m-0 mt-1 list-none p-0">
              {copy.notifications.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 border-b border-line2 py-2.5 last:border-b-0 last:pb-0">
                  <span className="text-sm leading-snug text-ink">{item.text}</span>
                  <span className="shrink-0 text-[13px] leading-snug text-ink2">{item.when}</span>
                </li>
              ))}
            </ul>
          </PhoneCard>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        <ProgressCard />
        <NextSteps request={request} onConfirm={confirmInterview} />
        <CoachCard />
        <RequestCard
          state={request}
          onStateChange={setRequest}
          open={requestOpen}
          onOpenChange={setRequestOpen}
          showHint={confirmHint}
          headingRef={requestHeadingRef}
        />
      </div>
    </PhoneShell>
  );
}
