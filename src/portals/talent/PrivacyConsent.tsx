import { useState, type ReactNode } from 'react';
import { Clock, EyeOff, TrendingUp, Undo2 } from 'lucide-react';
import { PhoneHeader, PhoneShell } from '@/app/PhoneShell';
import { Button } from '@/components/Button';
import { Chip, DataTag } from '@/components/Chip';
import { RadioGroup } from '@/components/RadioGroup';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { Switch } from '@/components/Toggle';
import { cx } from '@/lib/cx';
import { fill } from '@/lib/format';
import { privacy as copy, type ScoreRow, type Visibility } from '@/data/talent';
import { useFocusTarget } from './focus';
import { LinkButton, PhoneCard, SectionHeading, ValuePill } from './parts';

function FindMe() {
  const f = copy.findMe;
  const [value, setValue] = useState<Visibility>(f.defaultValue);
  const [changed, setChanged] = useState(false);
  const label = f.options.find((o) => o.value === value)?.label ?? '';
  return (
    <section aria-labelledby="pc-find">
      <RadioGroup
        name="pc-visibility"
        legend={
          <h2 id="pc-find" className="m-0 text-[17px] font-semibold leading-snug text-ink">
            {f.heading}
          </h2>
        }
        legendClassName="mb-3"
        variant="card"
        value={value}
        onChange={(next) => {
          setValue(next);
          setChanged(true);
        }}
        describedBy="pc-find-note"
        options={f.options.map((o) => ({
          value: o.value,
          label: o.label,
          description: o.description,
          badge: o.recommended ? (
            <Chip size="sm" tone="neutral">
              {f.recommended}
            </Chip>
          ) : undefined,
        }))}
      />
      <p id="pc-find-note" className="m-0 mt-3 text-[13px] leading-relaxed text-ink2">
        {f.note}
      </p>
      <div role="status">
        {changed ? (
          <StatusBanner tone="good" className="mt-3">
            {fill(f.changed, { label })}
          </StatusBanner>
        ) : null}
      </div>
    </section>
  );
}

const moveIcons = [EyeOff, Clock, TrendingUp];

function OpenToMove() {
  const o = copy.openToMove;
  const [on, setOn] = useState(false);
  return (
    <PhoneCard aria-labelledby="pc-move">
      <h2 id="pc-move" className="sr-only">
        {o.label}
      </h2>
      <Switch checked={on} onChange={setOn} label={<span className="text-[17px] leading-snug">{o.label}</span>} description={o.off} />
      <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 border-t border-line2 p-0 pt-3">
        {o.points.map((point, i) => {
          const Icon = moveIcons[i] ?? Clock;
          return (
            <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
              <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink2" strokeWidth={2} />
              <span>{point}</span>
            </li>
          );
        })}
      </ul>
      <p className="m-0 mt-3 text-[13px] leading-snug text-ink2">{o.noJob}</p>
      <div role="status">
        {on ? (
          <StatusBanner tone="good" className="mt-3">
            {o.on}
          </StatusBanner>
        ) : null}
      </div>
    </PhoneCard>
  );
}

function ScoreItem({ row }: { row: ScoreRow }) {
  const s = copy.scores;
  const [questioned, setQuestioned] = useState(false);
  const setFocus = useFocusTarget(questioned);
  return (
    <li className="border-b border-line2 p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <h3 className="m-0 text-[15px] font-semibold leading-snug text-ink">{row.title}</h3>
        <ValuePill>{row.value}</ValuePill>
      </div>
      <p className="m-0 mt-1 text-sm leading-relaxed text-ink2">{row.why}</p>
      {row.employerNote ? <p className="m-0 mt-1 text-sm leading-relaxed text-ink">{row.employerNote}</p> : null}
      {row.moveUp && row.moveUpHeading ? (
        <div className="mt-3">
          <p className="m-0 text-[13px] font-semibold leading-snug text-ink">{row.moveUpHeading}</p>
          <ul className="m-0 mt-1 flex list-disc flex-col gap-1 ps-5 text-sm leading-snug text-ink marker:text-ink2">
            {row.moveUp.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {questioned ? (
        <div className="mt-3">
          <div ref={setFocus} tabIndex={-1}>
            <StatusBanner tone="good">{row.questioned}</StatusBanner>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1"
            aria-label={`${s.withdraw}: ${row.title}`}
            icon={<Undo2 aria-hidden="true" className="h-4 w-4" />}
            onClick={() => setQuestioned(false)}
          >
            {s.withdraw}
          </Button>
        </div>
      ) : (
        <Button ref={setFocus} size="sm" className="mt-3" aria-label={`${s.question}: ${row.title}`} onClick={() => setQuestioned(true)}>
          {s.question}
        </Button>
      )}
    </li>
  );
}

function Scores() {
  const s = copy.scores;
  return (
    <section aria-labelledby="pc-scores">
      <div className="flex items-center justify-between gap-3">
        <SectionHeading id="pc-scores">{s.heading}</SectionHeading>
        <DataTag status={s.status} />
      </div>
      <p className="m-0 mb-3 mt-1 text-sm leading-relaxed text-ink2">{s.intro}</p>
      <ul className="m-0 list-none rounded-card border border-line bg-surface p-0">
        {s.rows.map((row) => (
          <ScoreItem key={row.id} row={row} />
        ))}
      </ul>
    </section>
  );
}

interface PermissionItem {
  recipient: string;
  purpose: string;
  fields: string;
  until: string;
}

function PermissionDetails({ item, status }: { item: PermissionItem; status?: ReactNode }) {
  const labels = copy.permissions.labels;
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="m-0 text-[15px] font-semibold leading-snug text-ink">{item.recipient}</h3>
        {status}
      </div>
      <dl className="m-0 mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm leading-snug">
        <dt className="text-ink2">{labels.purpose}</dt>
        <dd className="m-0 text-ink">{item.purpose}</dd>
        <dt className="text-ink2">{labels.fields}</dt>
        <dd className="m-0 text-ink">{item.fields}</dd>
        <dt className="text-ink2">{labels.until}</dt>
        <dd className="m-0 text-ink">{item.until}</dd>
      </dl>
    </>
  );
}

type GrantState = 'active' | 'confirm' | 'revoked';

function Permissions() {
  const p = copy.permissions;
  const [qasr, setQasr] = useState<GrantState>('active');
  const [optedOut, setOptedOut] = useState(false);
  const setQasrFocus = useFocusTarget(qasr);
  const setUniFocus = useFocusTarget(optedOut);
  return (
    <section aria-labelledby="pc-perm">
      <SectionHeading id="pc-perm">{p.heading}</SectionHeading>
      <p className="m-0 mb-3 mt-1 text-sm leading-relaxed text-ink2">{p.intro}</p>
      <ul className="m-0 list-none rounded-card border border-line bg-surface p-0">
        <li className="border-b border-line2 p-4">
          <PermissionDetails item={p.qasr} status={qasr === 'revoked' ? <StatusPill tone="neutral">{p.revokedState}</StatusPill> : null} />
          {qasr === 'active' ? (
            <Button ref={setQasrFocus} size="sm" className="mt-3" aria-label={`${p.revoke}: ${p.qasr.recipient}`} onClick={() => setQasr('confirm')}>
              {p.revoke}
            </Button>
          ) : null}
          {qasr === 'confirm' ? (
            <div className="mt-3 rounded-control border border-line bg-ground p-3">
              <p ref={setQasrFocus} tabIndex={-1} className="m-0 text-sm leading-relaxed text-ink">
                {p.revokeConfirm}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={() => setQasr('revoked')}>
                  {p.revokeYes}
                </Button>
                <Button size="sm" onClick={() => setQasr('active')}>
                  {p.revokeNo}
                </Button>
              </div>
            </div>
          ) : null}
          {qasr === 'revoked' ? (
            <div ref={setQasrFocus} tabIndex={-1} className="mt-3">
              <StatusBanner tone="neutral">{p.revoked}</StatusBanner>
            </div>
          ) : null}
        </li>
        <li className="p-4">
          <PermissionDetails item={p.university} status={optedOut ? <StatusPill tone="neutral">{p.optedOutState}</StatusPill> : null} />
          {optedOut ? (
            <div className="mt-3">
              <div ref={setUniFocus} tabIndex={-1}>
                <StatusBanner tone="neutral">{p.optedOut}</StatusBanner>
              </div>
              <Button variant="ghost" size="sm" className="mt-1" icon={<Undo2 aria-hidden="true" className="h-4 w-4" />} onClick={() => setOptedOut(false)}>
                {p.optIn}
              </Button>
            </div>
          ) : (
            <Button ref={setUniFocus} size="sm" className="mt-3" aria-label={`${p.optOut}: ${p.university.recipient}`} onClick={() => setOptedOut(true)}>
              {p.optOut}
            </Button>
          )}
        </li>
      </ul>
    </section>
  );
}

function WhoViewed() {
  const v = copy.viewed;
  return (
    <section aria-labelledby="pc-viewed">
      <SectionHeading id="pc-viewed">{v.heading}</SectionHeading>
      <p className="m-0 mb-3 mt-1 text-sm leading-relaxed text-ink2">{v.intro}</p>
      <ul className="m-0 list-none rounded-card border border-line bg-surface p-0">
        {v.rows.map((row) => (
          <li key={row.id} className="border-b border-line2 p-4 last:border-b-0">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="m-0 text-[15px] font-semibold leading-snug text-ink">{row.who}</h3>
              <p className="m-0 shrink-0 text-[13px] leading-snug text-ink2">{row.date}</p>
            </div>
            <p className="m-0 mt-0.5 text-sm leading-snug text-ink">{row.purpose}</p>
            <p className="m-0 mt-1 text-[13px] leading-snug text-ink2">
              <span className="font-medium text-ink">{v.seen}</span> {row.seen}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

type CoachPower = 'on' | 'confirm' | 'off';

function CoachSettings() {
  const c = copy.coach;
  const [ramadan, setRamadan] = useState(c.ramadanDefault);
  const [power, setPower] = useState<CoachPower>('on');
  const setFocus = useFocusTarget(power);
  return (
    <section aria-labelledby="pc-coach">
      <SectionHeading id="pc-coach" className="mb-3">
        {c.heading}
      </SectionHeading>
      <PhoneCard>
        <dl className="m-0">
          {c.rows.map((row, i) => (
            <div key={row.label} className={cx('flex items-baseline justify-between gap-3 pb-2.5', i > 0 && 'border-t border-line2 pt-2.5')}>
              <dt className="text-sm text-ink2">{row.label}</dt>
              <dd className="m-0 text-end text-sm font-semibold text-ink">{row.value}</dd>
            </div>
          ))}
          <div className="border-t border-line2 py-2.5">
            <dt className="text-sm text-ink2">{c.channelsLabel}</dt>
            <dd className="m-0 mt-0.5 text-sm leading-relaxed text-ink">{c.channels}</dd>
          </div>
        </dl>
        <div className="border-t border-line2 pt-3">
          <Switch checked={ramadan} onChange={setRamadan} label={c.ramadan} description={c.ramadanHelp} />
        </div>
        <div className="mt-3 border-t border-line2 pt-1">
          {power === 'on' ? (
            <LinkButton ref={setFocus} onClick={() => setPower('confirm')} className="text-sm">
              {c.off}
            </LinkButton>
          ) : null}
          {power === 'confirm' ? (
            <div className="mt-2 rounded-control border border-line bg-ground p-3">
              <p ref={setFocus} tabIndex={-1} className="m-0 text-sm leading-relaxed text-ink">
                {c.offConfirm}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={() => setPower('off')}>
                  {c.offYes}
                </Button>
                <Button size="sm" onClick={() => setPower('on')}>
                  {c.offNo}
                </Button>
              </div>
            </div>
          ) : null}
          {power === 'off' ? (
            <div className="mt-2">
              <div ref={setFocus} tabIndex={-1}>
                <StatusBanner tone="neutral">{c.offDone}</StatusBanner>
              </div>
              <Button size="sm" className="mt-2" onClick={() => setPower('on')}>
                {c.onAgain}
              </Button>
            </div>
          ) : null}
        </div>
      </PhoneCard>
    </section>
  );
}

function DataRights() {
  const r = copy.rights;
  const [download, setDownload] = useState(false);
  const [correct, setCorrect] = useState(false);
  return (
    <div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => setDownload(true)}>
          {r.download}
        </Button>
        <Button className="flex-1" onClick={() => setCorrect(true)}>
          {r.correct}
        </Button>
      </div>
      <div role="status">
        {download ? (
          <StatusBanner tone="neutral" className="mt-3">
            {r.downloaded}
          </StatusBanner>
        ) : null}
        {correct ? (
          <StatusBanner tone="neutral" className="mt-3">
            {r.corrected}
          </StatusBanner>
        ) : null}
      </div>
    </div>
  );
}

export function PrivacyConsent() {
  return (
    <PhoneShell persona="mariam">
      <PhoneHeader>
        <h1 className="m-0 text-[24px] font-bold leading-tight text-ink">{copy.title}</h1>
        <p className="m-0 mt-1 text-sm leading-relaxed text-ink2">{copy.intro}</p>
      </PhoneHeader>
      <div className="flex flex-col gap-6">
        <FindMe />
        <OpenToMove />
        <Scores />
        <Permissions />
        <WhoViewed />
        <CoachSettings />
        <DataRights />
      </div>
    </PhoneShell>
  );
}
