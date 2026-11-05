import { useRef, useState, type KeyboardEvent } from 'react';
import { EyeOff } from 'lucide-react';
import { PhoneHeader, PhoneShell } from '@/app/PhoneShell';
import { Button } from '@/components/Button';
import { DataTag } from '@/components/Chip';
import { StatusBanner } from '@/components/StatusPill';
import { cx } from '@/lib/cx';
import { fill, formatAEDRange } from '@/lib/format';
import {
  careerPath as copy,
  careerPaths,
  likelihoodBands,
  likelihoodOf,
  mariamSkills,
  skillText,
  type CareerPathOption,
  type Likelihood,
  type PathId,
} from '@/data/talent';
import { useFocusOnChange } from './focus';
import { AgentLine, PhoneCard } from './parts';

/** How many of the three meter bars are filled for each band. */
const bandBars: Record<Likelihood, number> = { High: 3, Medium: 2, Low: 1 };
const meterBars = [0, 1, 2];

/** Each skill keeps its level on the same line; lines break only at the separators. */
const baselineSkills = Object.values(mariamSkills).map((s, i) => (
  <span key={s.name}>
    {i > 0 ? ' · ' : null}
    <span className="whitespace-nowrap">{skillText(s)}</span>
  </span>
));

/**
 * Compact ARIA tabs for the three paths: a two-line label ("Path A" over the
 * path name) so all three fit the 390px frame. Arrow keys, Home and End move
 * between tabs and select them.
 */
function PathTabs({ value, onChange }: { value: PathId; onChange: (id: PathId) => void }) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const index = Math.max(
    0,
    careerPaths.findIndex((p) => p.id === value),
  );

  function focusAt(i: number) {
    const next = (i + careerPaths.length) % careerPaths.length;
    const path = careerPaths[next];
    if (!path) return;
    onChange(path.id);
    refs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusAt(careerPaths.length - 1);
    }
  }

  return (
    <div role="tablist" aria-label={copy.tabsLabel} className="grid grid-cols-3 gap-1 rounded-control bg-line2 p-1">
      {careerPaths.map((path, i) => {
        const selected = i === index;
        return (
          <button
            key={path.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`cp-tab-${path.id}`}
            aria-selected={selected}
            aria-controls="cp-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(path.id)}
            onKeyDown={onKeyDown}
            className={cx(
              'flex min-h-[52px] min-w-0 flex-col items-center justify-center rounded-control px-1 py-1.5 text-center leading-tight transition-colors',
              selected ? 'bg-surface text-ink shadow-sm ring-1 ring-accent' : 'text-ink2 hover:bg-surface hover:text-ink',
            )}
          >
            <span className="text-[12px] font-medium text-ink2">{fill(copy.pathLabel, { id: path.id })}</span>
            <span className="mt-0.5 text-[13px] font-semibold">{path.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Three rising bars, filled up to the band: a decorative cue beside the word,
 * never the only signal. Filled bars are solid ink; empty bars are outlined.
 */
function BandMeter({ band }: { band: Likelihood }) {
  const filled = bandBars[band];
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 14 12" className="h-3 w-3.5 shrink-0 overflow-visible">
      {meterBars.map((i) => (
        <rect
          key={i}
          x={i * 5 + 0.5}
          y={8 - i * 4 + 0.5}
          width={3}
          height={3 + i * 4}
          rx={0.75}
          className={i < filled ? 'fill-ink stroke-ink' : 'fill-none stroke-control'}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

function LikelihoodChip({ chance }: { chance: number }) {
  const band = likelihoodOf(chance);
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-line2 px-2.5 py-1 text-[13px] font-medium leading-tight text-ink">
      <BandMeter band={band} />
      <span aria-hidden="true" className="tabular">
        {fill(copy.chance, { band, chance })}
      </span>
      <span className="sr-only">{fill(copy.chanceLabel, { band, chance })}</span>
    </span>
  );
}

/** Rail beside each timeline card: a line in, a dot, a line out. */
function Rail({ now, first, last }: { now?: boolean; first?: boolean; last?: boolean }) {
  return (
    <div aria-hidden="true" className="flex w-3 shrink-0 flex-col items-center">
      <span className={cx('h-[18px] w-px', first ? 'bg-transparent' : 'bg-control')} />
      <span className={cx('h-3 w-3 shrink-0 rounded-full', now ? 'bg-ink' : 'border-2 border-control bg-surface')} />
      <span className={cx('w-px flex-1', last ? 'bg-transparent' : 'bg-control')} />
    </div>
  );
}

function Timeline({ path }: { path: CareerPathOption }) {
  const lastIndex = path.milestones.length - 1;
  return (
    <ol aria-label={fill(copy.timelineLabel, { id: path.id })} className="m-0 list-none p-0">
      <li className="flex gap-3">
        <Rail now first />
        <div className="mb-3 min-w-0 flex-1 rounded-card border border-line bg-surface p-3.5">
          <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink2">{copy.now.when}</p>
          <h3 className="m-0 mt-1 text-[15px] font-semibold leading-snug text-ink">{copy.now.title}</h3>
          <p className="m-0 text-sm leading-snug text-ink">{copy.now.detail}</p>
          <p className="m-0 mt-1.5 text-[13px] leading-snug text-ink2">
            <span className="font-medium text-ink">{copy.now.baseline}:</span> {baselineSkills}
          </p>
        </div>
      </li>
      {path.milestones.map((m, i) => (
        <li key={m.year} className="flex gap-3">
          <Rail last={i === lastIndex} />
          <div className={cx('min-w-0 flex-1 rounded-card border border-line bg-surface p-3.5', i < lastIndex && 'mb-3')}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 font-heading text-[15px] font-semibold leading-tight text-ink">{m.year}</p>
              <LikelihoodChip chance={m.chance.value} />
            </div>
            <h3 className="m-0 mt-1.5 text-[15px] font-semibold leading-snug text-ink">{m.role}</h3>
            <p className="m-0 text-sm leading-snug text-ink">
              {formatAEDRange(m.pay.value.min, m.pay.value.max)} {copy.payUnit}
            </p>
            {m.readiness ? (
              <p className="m-0 mt-1.5 text-[13px] leading-snug text-ink">
                <span className="font-medium">{copy.readiness}</span> {m.readiness}
              </p>
            ) : null}
            <p className="m-0 mt-1 text-[13px] leading-snug text-ink2">
              <span className="font-medium text-ink">{copy.build}</span> {m.build}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CareerPath() {
  const [pathId, setPathId] = useState<PathId>('A');
  const [added, setAdded] = useState<Partial<Record<PathId, boolean>>>({});
  const [changeOpen, setChangeOpen] = useState(false);
  const [asked, setAsked] = useState(false);
  const askedRef = useRef<HTMLElement | null>(null);
  useFocusOnChange(asked, askedRef);

  const path = careerPaths.find((p) => p.id === pathId) ?? (careerPaths[0] as CareerPathOption);
  const isAdded = Boolean(added[path.id]);
  const first = path.milestones[0];
  const bands = fill(copy.bandsNote, likelihoodBands);

  return (
    <PhoneShell persona="mariam">
      <PhoneHeader>
        <h1 className="m-0 text-[24px] font-bold leading-tight text-ink">{copy.title}</h1>
        <p className="m-0 mt-1.5 text-sm leading-relaxed text-ink2">{copy.intro}</p>
        <AgentLine
          className="mt-2"
          before={copy.agentBefore}
          agent="Coach Agent"
          after={copy.agentAfter}
          decides={copy.decides}
        />
      </PhoneHeader>

      <PathTabs value={pathId} onChange={setPathId} />

      <div
        role="tabpanel"
        id="cp-panel"
        aria-labelledby={`cp-tab-${path.id}`}
        tabIndex={0}
        className="mt-5 flex flex-col gap-6 focus-visible:rounded-control"
      >
        <section aria-labelledby="cp-path-title" className="flex flex-col gap-4">
          <h2 id="cp-path-title" className="m-0 text-[19px] font-semibold leading-snug text-ink">
            {path.title}
          </h2>
          <Timeline path={path} />
          <div className="flex flex-col gap-2 text-[13px] leading-snug text-ink2">
            {first ? (
              <>
                <p className="m-0 flex items-start gap-2">
                  <DataTag status={first.chance.status} />
                  <span>
                    {copy.estimateNote} {bands}
                  </span>
                </p>
                <p className="m-0 flex items-start gap-2">
                  <DataTag status={first.pay.status} />
                  <span>{copy.payNote}</span>
                </p>
              </>
            ) : null}
            <p className="m-0 flex items-start gap-2">
              <EyeOff aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink2" strokeWidth={2} />
              <span>{copy.whoSees}</span>
            </p>
          </div>
        </section>

        <PhoneCard aria-labelledby="cp-why">
          <h2 id="cp-why" className="m-0 text-[17px] font-semibold leading-snug text-ink">
            {copy.whyHeading}
          </h2>
          <ul className="m-0 mt-2 flex list-disc flex-col gap-2 ps-5 text-sm leading-relaxed text-ink marker:text-ink2">
            {path.reasons.map((reason) => (
              <li key={reason} className="ps-1">
                {reason}
              </li>
            ))}
          </ul>
        </PhoneCard>

        <div>
          <div className="flex gap-2">
            <Button
              variant={isAdded ? 'secondary' : 'primary'}
              className="flex-1"
              onClick={() => setAdded((prev) => ({ ...prev, [path.id]: !isAdded }))}
            >
              {isAdded ? copy.remove : copy.add}
            </Button>
            <Button className="flex-1" aria-expanded={changeOpen} aria-controls="cp-change" onClick={() => setChangeOpen((v) => !v)}>
              {copy.change}
            </Button>
          </div>
          <div role="status">
            {isAdded ? (
              <StatusBanner tone="good" className="mt-3">
                {fill(copy.added, { title: path.title })}
              </StatusBanner>
            ) : null}
          </div>
          <div id="cp-change" hidden={!changeOpen}>
            {changeOpen ? (
              <PhoneCard className="mt-3">
                <p className="m-0 text-sm leading-relaxed text-ink">{copy.changeBody}</p>
                {asked ? (
                  <div
                    ref={(el) => {
                      askedRef.current = el;
                    }}
                    tabIndex={-1}
                    className="mt-3"
                  >
                    <StatusBanner tone="good">{copy.asked}</StatusBanner>
                  </div>
                ) : (
                  <Button className="mt-3" onClick={() => setAsked(true)}>
                    {copy.ask}
                  </Button>
                )}
              </PhoneCard>
            ) : null}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
