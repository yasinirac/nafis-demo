import { useEffect, useRef, useState, type RefObject } from 'react';
import { CircleCheck, CircleMinus, FlaskConical, Lock, RotateCcw, RotateCw, Send, Server, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { Button } from '@/components/Button';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { RadioGroup } from '@/components/RadioGroup';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { Stepper, type Step } from '@/components/Stepper';
import { Tabs } from '@/components/Tabs';
import { cx } from '@/lib/cx';
import { fill } from '@/lib/format';
import {
  agentTools,
  apiById,
  apis,
  certification,
  certStates,
  changelog,
  defaultApi,
  developerCopy as copy,
  purposeCodes,
  quickStart,
  sandbox,
  type ApiDef,
  type ApiId,
  type SampleKind,
} from '@/data/apis';
import { CodePanel } from '@/components/CodePanel';

const sampleKinds: SampleKind[] = ['request', 'response', 'error'];

/** Tailwind's xl breakpoint, where the catalogue and the reference sit side by side. */
const twoColumnMinWidth = 1280;

function ReleaseChip({ release }: { release: ApiDef['release'] }) {
  return (
    <Chip size="sm" tone={release === 'GA' ? 'neutral' : 'outline'}>
      {copy.catalogue.release[release]}
    </Chip>
  );
}

function AccessChip({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <Chip size="sm" tone="good" icon={<CircleCheck aria-hidden="true" className="h-3.5 w-3.5 text-good-icon" />}>
      {copy.catalogue.allowed}
    </Chip>
  ) : (
    <Chip size="sm" tone="critical" icon={<Lock aria-hidden="true" className="h-3.5 w-3.5" />}>
      {copy.catalogue.notAllowed}
    </Chip>
  );
}

function ScopeChip({ scope }: { scope: string }) {
  return (
    <Chip size="sm" tone="neutral" className={scope.includes('.') ? 'font-mono' : undefined}>
      {scope}
    </Chip>
  );
}

function ApiDetail({
  api,
  keySuffix,
  tab,
  onTab,
  sent,
  onSend,
  headingRef,
}: {
  api: ApiDef;
  keySuffix: string;
  tab: SampleKind;
  onTab: (kind: SampleKind) => void;
  sent: boolean;
  onSend: () => void;
  headingRef: RefObject<HTMLHeadingElement>;
}) {
  return (
    <section
      aria-labelledby="api-detail-heading"
      className="min-w-0 scroll-mt-[200px] rounded-card border border-line bg-surface p-5 nav:scroll-mt-[120px] xl:self-start"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-[260px]">
          <h2 id="api-detail-heading" ref={headingRef} tabIndex={-1} className="m-0 text-[20px] font-semibold leading-snug focus:outline-none">
            {api.name}
          </h2>
          <p className="m-0 mt-1 text-sm text-ink2">{fill(copy.detail.forLine, { who: api.audience })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <ReleaseChip release={api.release} />
          <AccessChip allowed={api.allowed} />
        </div>
      </div>

      {!api.allowed ? (
        <StatusBanner
          tone="critical"
          className="mt-4"
          icon={<Lock aria-hidden="true" className="h-4 w-4 text-crit-text" />}
          title={copy.detail.notAllowedTitle}
        >
          {fill(copy.detail.notAllowedBody, { who: api.audience })}
        </StatusBanner>
      ) : null}

      <dl className="m-0 mt-4 grid gap-x-6 gap-y-3 rounded-control bg-ground p-4 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-[13px] font-semibold text-ink2">{copy.detail.purpose}</dt>
          <dd className="m-0 mt-0.5 text-ink">
            <code className="font-mono text-[13px] font-medium">{api.purposeCode}</code>
            <span className="text-ink2"> · {purposeCodes[api.purposeCode]}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] font-semibold text-ink2">{copy.detail.scope}</dt>
          <dd className="m-0 mt-0.5 text-ink">
            {api.scope.includes('.') ? <code className="font-mono text-[13px]">{api.scope}</code> : api.scope}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] font-semibold text-ink2">{copy.detail.tier}</dt>
          <dd className="m-0 mt-0.5 text-ink">{api.tier}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] font-semibold text-ink2">{copy.detail.consent}</dt>
          <dd className="m-0 mt-0.5 text-ink">{api.consent}</dd>
        </div>
      </dl>
      {api.usesTokens ? (
        <p className="m-0 mt-3 flex items-start gap-2 text-[13px] leading-snug text-ink2">
          <ShieldCheck aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
          <span>{copy.detail.revocation}</span>
        </p>
      ) : null}

      <h3 className="m-0 mb-2 mt-5 text-[15px] font-semibold">{copy.detail.endpoints}</h3>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {api.endpoints.map((e) => (
          <li key={e}>
            <code className="block whitespace-pre-wrap rounded-control bg-ground px-3 py-1.5 font-mono text-[13px] text-ink [overflow-wrap:anywhere]">
              {e}
            </code>
          </li>
        ))}
      </ul>

      <div className="mb-2 mt-5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-[15px] font-semibold">{copy.detail.samples}</h3>
        <DataTag status={api.sampleStatus} />
      </div>
      <Tabs<SampleKind>
        label={fill(copy.detail.samplesLabel, { api: api.name })}
        variant="pill"
        value={tab}
        onChange={onTab}
        panelClassName="pt-3"
        tabs={sampleKinds.map((kind) => ({
          id: kind,
          label: copy.detail.tabs[kind],
          content: (
            <CodePanel
              label={fill(copy.detail.panelLabel, { api: api.name, kind: copy.detail.tabs[kind].toLowerCase() })}
              lines={kind === 'request' ? api.samples.request.map((line) => line.replace('{key}', keySuffix)) : api.samples[kind]}
            />
          ),
        }))}
      />
      <p className="m-0 mt-4 text-sm leading-relaxed text-ink2">{api.note}</p>

      {api.allowed ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line2 pt-4">
          <Button variant="primary" icon={<Send aria-hidden="true" className="h-4 w-4" />} onClick={onSend}>
            {copy.detail.send}
          </Button>
          <p role="status" className="m-0 min-w-0 flex-1 basis-[240px] text-[13px] leading-snug text-ink">
            {sent ? fill(api.sampleStatus === 'published' ? copy.detail.sentPublished : copy.detail.sent, { status: api.responseStatus }) : ''}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function SandboxCard({ keySuffix, onRotate }: { keySuffix: string; onRotate: () => string }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const resetRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  function rotate() {
    const next = onRotate();
    setMessage(fill(copy.sandbox.rotated, { key: next }));
  }

  function closeConfirm(done: boolean) {
    setConfirming(false);
    if (done) setMessage(copy.sandbox.resetDone);
    resetRef.current?.focus();
  }

  return (
    <Card aria-labelledby="sandbox-heading">
      <CardHeader id="sandbox-heading" title={copy.sandbox.heading} actions={<DataTag status={sandbox.talentRecords.status} />} />
      <p className="m-0 text-sm leading-relaxed text-ink">{copy.sandbox.body}</p>
      <p className="m-0 mt-2 text-[13px] text-ink2">
        {fill(copy.sandbox.app, { app: sandbox.appName, key: keySuffix, created: sandbox.created })}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" icon={<RotateCw aria-hidden="true" className="h-4 w-4" />} onClick={rotate}>
          {copy.sandbox.rotate}
        </Button>
        <Button
          ref={resetRef}
          size="sm"
          icon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
          aria-expanded={confirming}
          aria-controls="sandbox-reset-confirm"
          onClick={() => setConfirming(true)}
        >
          {copy.sandbox.reset}
        </Button>
      </div>
      <div id="sandbox-reset-confirm" hidden={!confirming} className="mt-3 rounded-control border border-warn-bar bg-warn-bg px-3 py-3">
        <p className="m-0 text-[13px] leading-snug text-warn-text">{copy.sandbox.confirm}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button ref={confirmRef} size="sm" variant="primary" onClick={() => closeConfirm(true)}>
            {copy.sandbox.resetNow}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => closeConfirm(false)}>
            {copy.sandbox.cancel}
          </Button>
        </div>
      </div>
      <p role="status" className={cx('m-0 text-[13px] leading-snug text-ink', message && 'mt-3')}>
        {message}
      </p>
    </Card>
  );
}

function CertificationCard() {
  const passed = certification.filter((c) => c.state === 'passed').length;
  return (
    <Card aria-labelledby="cert-heading">
      <CardHeader
        id="cert-heading"
        title={copy.certification.heading}
        actions={<Chip tone="neutral">{fill(copy.certification.count, { passed, total: certification.length })}</Chip>}
      />
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {certification.map((c) => {
          const state = certStates[c.state];
          return (
            <li key={c.label} className="flex items-start gap-2 text-sm leading-snug text-ink">
              {c.state === 'passed' ? (
                <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-good-icon" />
              ) : (
                <CircleMinus aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink2" />
              )}
              <span>
                <span className="font-semibold">{state.label}:</span> {c.label}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function AgentRegistryCard() {
  return (
    <Card aria-labelledby="agents-heading">
      <CardHeader id="agents-heading" title={copy.agents.heading} description={copy.agents.lead} />
      <ul className="m-0 list-none p-0">
        {agentTools.map((t) => (
          <li key={t.level} className="border-t border-line2 py-3 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">{t.level}</span>
              <StatusPill tone={t.tone}>{t.rule}</StatusPill>
            </div>
            <p className="m-0 mt-1 font-mono text-[13px] text-ink2 [overflow-wrap:anywhere]">{t.tools.join(' · ')}</p>
            <p className="m-0 mt-0.5 text-[13px] leading-snug text-ink2">{t.detail}</p>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-1 border-t border-line2 pt-3 text-[13px] leading-relaxed text-ink">{copy.agents.principal}</p>
    </Card>
  );
}

function ChangelogCard({ className }: { className?: string }) {
  return (
    <Card aria-labelledby="changelog-heading" className={className}>
      <CardHeader id="changelog-heading" title={copy.changelog.heading} />
      <ol className="m-0 grid list-none gap-x-6 gap-y-3 p-0 md:grid-cols-3">
        {changelog.map((entry) => (
          <li
            key={entry.version}
            className="border-t border-line2 pt-3 text-sm leading-snug first:border-t-0 first:pt-0 md:border-s md:border-t-0 md:ps-4 md:pt-0 md:first:border-s-0 md:first:ps-0"
          >
            <p className="m-0 font-semibold text-ink">{fill(copy.changelog.entry, { version: entry.version, date: entry.date })}</p>
            <p className="m-0 mt-0.5 text-ink2">{entry.text}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function DeveloperPortal() {
  const [apiId, setApiId] = useState<ApiId>(defaultApi);
  const [tab, setTab] = useState<SampleKind>('request');
  const [sentId, setSentId] = useState<ApiId | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [keyIndex, setKeyIndex] = useState(0);
  const [focusTick, setFocusTick] = useState(0);
  const [revealTick, setRevealTick] = useState(0);
  const pointerSelect = useRef(false);
  const catalogueRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const api = apiById(apiId);
  const keySuffix = sandbox.keySuffixes[keyIndex % sandbox.keySuffixes.length] ?? '';

  useEffect(() => {
    if (focusTick === 0) return;
    const heading = headingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.closest('section')?.scrollIntoView({ block: 'start' });
  }, [focusTick]);

  // Below the two-column layout the reference sits under the whole catalogue,
  // so a tap on a card brings it into view. Arrow keys never scroll the page.
  useEffect(() => {
    const el = catalogueRef.current;
    if (!el) return;
    const onPointer = () => {
      pointerSelect.current = true;
    };
    const onKey = () => {
      pointerSelect.current = false;
    };
    el.addEventListener('pointerdown', onPointer, true);
    el.addEventListener('keydown', onKey, true);
    return () => {
      el.removeEventListener('pointerdown', onPointer, true);
      el.removeEventListener('keydown', onKey, true);
    };
  }, []);

  useEffect(() => {
    if (revealTick === 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    headingRef.current?.closest('section')?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }, [revealTick]);

  function selectApi(id: ApiId) {
    setApiId(id);
    setTab('request');
    if (pointerSelect.current && !window.matchMedia(`(min-width: ${twoColumnMinWidth}px)`).matches) setRevealTick((t) => t + 1);
    pointerSelect.current = false;
  }

  function openEvents() {
    pointerSelect.current = false;
    selectApi('placement-events');
    setFocusTick((t) => t + 1);
  }

  function send() {
    setTab('response');
    setSentId(api.id);
    if (api.id === 'placement-events') setSubscribed(true);
  }

  function rotate(): string {
    const next = (keyIndex + 1) % sandbox.keySuffixes.length;
    setKeyIndex(next);
    return sandbox.keySuffixes[next] ?? '';
  }

  const steps: Step[] = quickStart.map((s) =>
    s.id === 'events'
      ? { label: s.label, detail: subscribed ? s.doneDetail : s.detail, state: subscribed ? 'done' : 'current' }
      : { label: s.label, detail: s.detail, state: 'done' },
  );

  return (
    <AppShell portal="developer" persona="reem">
      <PageHeader
        title={copy.title}
        description={copy.intro}
        chips={
          <>
            <Chip icon={<FlaskConical aria-hidden="true" className="h-4 w-4" />}>{copy.chips.sandbox}</Chip>
            <Chip icon={<Server aria-hidden="true" className="h-4 w-4" />}>{copy.chips.host}</Chip>
          </>
        }
      />

      <Card aria-labelledby="quick-start-heading" className="mb-6">
        <CardHeader
          id="quick-start-heading"
          title={copy.quickStart.heading}
          actions={
            subscribed ? null : (
              <Button size="sm" onClick={openEvents}>
                {copy.quickStart.open}
              </Button>
            )
          }
        />
        <Stepper label={copy.quickStart.label} steps={steps} showStateWords={false} />
        <p role="status" className={cx('m-0 text-[13px] leading-snug text-ink', subscribed && 'mt-4 rounded-control bg-good-bg px-3 py-2')}>
          {subscribed ? copy.quickStart.complete : ''}
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <section ref={catalogueRef} aria-labelledby="catalogue-heading" className="min-w-0">
          <h2 id="catalogue-heading" className="m-0 mb-3 text-[17px] font-semibold leading-snug">
            {copy.catalogue.heading}
          </h2>
          <RadioGroup<ApiId>
            legend={copy.catalogue.legend}
            hideLegend
            name="api-catalogue"
            variant="card"
            value={apiId}
            onChange={selectApi}
            options={apis.map((a) => ({
              value: a.id,
              label: a.name,
              badge: <ReleaseChip release={a.release} />,
              description: (
                <>
                  <span className="block">{a.summary}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <ScopeChip scope={a.scope} />
                    <Chip size="sm" tone="outline">
                      {a.tier}
                    </Chip>
                    <AccessChip allowed={a.allowed} />
                  </span>
                </>
              ),
            }))}
          />
        </section>

        <ApiDetail
          api={api}
          keySuffix={keySuffix}
          tab={tab}
          onTab={setTab}
          sent={sentId === api.id}
          onSend={send}
          headingRef={headingRef}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <SandboxCard keySuffix={keySuffix} onRotate={rotate} />
          <CertificationCard />
        </div>
        <AgentRegistryCard />
        <ChangelogCard className="lg:col-span-2" />
      </div>
    </AppShell>
  );
}
