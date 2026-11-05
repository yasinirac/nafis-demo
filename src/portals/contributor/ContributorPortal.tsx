import { useRef, useState } from 'react';
import { Lock, TriangleAlert } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { AiNote } from '@/components/AiNote';
import { Button } from '@/components/Button';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { Field, Select, TextInput } from '@/components/Field';
import { RadioGroup } from '@/components/RadioGroup';
import { StatusPill } from '@/components/StatusPill';
import { Tile } from '@/components/Tile';
import { ChartFrame } from '@/charts/ChartFrame';
import { Bars } from '@/charts/Bars';
import { chartColors } from '@/charts/core';
import { cx } from '@/lib/cx';
import { fill, formatInt, formatNumber, formatPct } from '@/lib/format';
import { useDomId } from '@/lib/useId';
import { tierLabels } from '@/data/types';
import {
  classOutcomes,
  classYears,
  defaultClass,
  destinationsFor,
  feeds,
  feedsStatus,
  monthsDelta,
  payRange,
  pointsDelta,
  previousClass,
  programmes,
  skillGapLabels,
  skillGapsShown,
  suggestionsFor,
  unmatchedInternships,
  universityCopy as copy,
  universityRules,
  type ClassYear,
  type Programme,
} from '@/data/university';

function ClassTiles({ year }: { year: ClassYear }) {
  const c = classOutcomes[year];
  const prevYear = previousClass(year);
  const prev = prevYear ? classOutcomes[prevYear] : null;
  const skilledHidden = destinationsFor(year)[0]?.hidden ?? false;
  return (
    <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-6">
      <Tile as="li" className="lg:col-span-2" label={copy.tiles.graduates} value={formatInt(c.graduates.value)} sub={fill(copy.tiles.graduatesSub, { year })} />
      <Tile
        as="li"
        className="lg:col-span-2"
        label={copy.tiles.skilled}
        value={skilledHidden ? '—' : formatPct(c.skilledAt12.value)}
        sub={
          <>
            <span className="block">{pointsDelta(c.skilledAt12.value, prev?.skilledAt12.value ?? null, prevYear)}</span>
            <span className="block">{fill(copy.tiles.national, { n: formatPct(c.nationalAccounting.value) })}</span>
          </>
        }
      />
      <Tile
        as="li"
        className="lg:col-span-2"
        label={copy.tiles.months}
        value={formatNumber(c.medianMonthsToSkilledJob.value, 1)}
        unit={copy.tiles.monthsUnit}
        sub={monthsDelta(c.medianMonthsToSkilledJob.value, prev?.medianMonthsToSkilledJob.value ?? null, prevYear)}
      />
      <Tile as="li" className="lg:col-span-3" label={copy.tiles.pay} value={payRange(year)} unit={copy.tiles.payUnit} sub={copy.tiles.paySub} />
      <Tile
        as="li"
        className="sm:col-span-2 lg:col-span-3"
        label={copy.tiles.stay}
        value={formatPct(c.stillWithFirstEmployer.value)}
        sub={pointsDelta(c.stillWithFirstEmployer.value, prev?.stillWithFirstEmployer.value ?? null, prevYear)}
      />
    </ul>
  );
}

function DestinationsChart({ year }: { year: ClassYear }) {
  const c = classOutcomes[year];
  const groups = destinationsFor(year);
  const list = groups
    .map((g) => (g.hidden ? fill(copy.destinations.hiddenAria, { label: g.label.toLowerCase() }) : `${formatPct(g.share)} ${g.label.toLowerCase()}`))
    .join(', ');
  return (
    <ChartFrame
      title={copy.destinations.title}
      subtitle={fill(copy.destinations.subtitle, { n: formatInt(c.graduates.value), year })}
      status={c.destinations.status}
      footnote={copy.destinations.note}
      table={{
        columns: [
          { key: 'group', label: copy.destinations.groupColumn },
          { key: 'share', label: copy.destinations.shareColumn, numeric: true },
        ],
        rows: groups.map((g) => ({ group: g.label, share: g.hidden ? copy.destinations.hiddenCell : formatPct(g.share) })),
      }}
    >
      <Bars
        ariaLabel={fill(copy.destinations.ariaLabel, { year, list })}
        max={100}
        data={groups.map((g, i) => ({
          key: g.key,
          label: g.label,
          value: g.hidden ? null : g.share,
          valueLabel: g.hidden ? '—' : formatPct(g.share),
          color: i === 0 ? chartColors.series1 : chartColors.muted,
        }))}
      />
    </ChartFrame>
  );
}

function SkillsChart({ year }: { year: ClassYear }) {
  const c = classOutcomes[year];
  const shown = skillGapsShown(year);
  const values = c.skillGaps.value;
  const list = skillGapLabels.map((label, i) => `${formatPct(values[i] ?? 0)} ${label}`).join(', ');
  return (
    <ChartFrame
      title={copy.skills.title}
      subtitle={fill(copy.skills.subtitle, { year })}
      status={c.skillGaps.status}
      footnote={copy.skills.note}
      table={{
        columns: [
          { key: 'skill', label: copy.skills.skillColumn },
          { key: 'share', label: copy.skills.shareColumn, numeric: true },
        ],
        rows: shown ? skillGapLabels.map((label, i) => ({ skill: label, share: formatPct(values[i] ?? 0) })) : [],
      }}
    >
      {shown ? (
        <Bars
          ariaLabel={fill(copy.skills.ariaLabel, { year, list })}
          max={universityRules.skillScaleMax}
          track
          data={skillGapLabels.map((label, i) => ({
            key: `skill-${i}`,
            label,
            value: values[i] ?? 0,
            valueLabel: formatPct(values[i] ?? 0),
          }))}
        />
      ) : (
        <p className="m-0 text-sm text-ink2">{copy.skills.notShown}</p>
      )}
    </ChartFrame>
  );
}

function SuggestionsCard({ year }: { year: ClassYear }) {
  return (
    <Card aria-labelledby="suggestions-heading">
      <CardHeader
        id="suggestions-heading"
        title={copy.suggestions.title}
        description={
          <AiNote agent="Contributor Assistant" prefix={copy.suggestions.prefix}>
            {copy.suggestions.decides}
          </AiNote>
        }
        actions={<DataTag status={classOutcomes[year].skillGaps.status} />}
      />
      <ul className="m-0 list-none p-0">
        {suggestionsFor(year).map((s) => (
          <li key={s.id} className="border-t border-line2 py-4 first:border-t-0 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
              <h3 className="m-0 min-w-0 flex-1 basis-[220px] text-[15px] font-semibold leading-snug">{s.title}</h3>
              <Chip size="sm" tone="neutral">
                {fill(copy.suggestions.confidence, { level: s.confidence.toLowerCase() })}
              </Chip>
            </div>
            <p className="m-0 mt-1 text-sm leading-relaxed text-ink">{s.why}</p>
            <p className="m-0 mt-1.5 text-[13px] leading-snug text-ink2">{s.evidence}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function FeedsCard() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fixed, setFixed] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const panelId = useDomId('internship-fixes');
  const errorId = `${panelId}-error`;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const remaining = unmatchedInternships.filter((r) => !fixed.includes(r.id));

  function save() {
    const filled = remaining.filter((r) => (values[r.id] ?? '').trim() !== '');
    if (filled.length === 0) {
      setError(true);
      setMessage('');
      return;
    }
    setError(false);
    const nextFixed = [...fixed, ...filled.map((r) => r.id)];
    setFixed(nextFixed);
    if (nextFixed.length === unmatchedInternships.length) {
      setMessage(copy.feeds.allFixed);
      closeRef.current?.focus();
    } else {
      setMessage(filled.length === 1 ? copy.feeds.savedOne : fill(copy.feeds.savedMany, { n: filled.length }));
    }
  }

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  const internshipDetail =
    remaining.length === 0
      ? copy.feeds.unknownNone
      : remaining.length === 1
        ? copy.feeds.unknownOne
        : fill(copy.feeds.unknownMany, { n: remaining.length });

  return (
    <Card aria-labelledby="feeds-heading">
      <CardHeader id="feeds-heading" title={copy.feeds.title} actions={<DataTag status={feedsStatus} />} />
      <ul className="m-0 list-none p-0">
        {feeds.map((f) => (
          <li key={f.id} className="border-t border-line2 py-3 first:border-t-0 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="min-w-0 flex-1 basis-[180px]">
                <p className="m-0 text-sm font-semibold leading-snug text-ink">{f.name}</p>
                <p className="m-0 mt-0.5 text-[13px] leading-snug text-ink2">{f.id === 'internships' ? internshipDetail : f.detail}</p>
              </div>
              {f.id === 'internships' ? (
                <div className="flex flex-wrap items-center gap-2">
                  {remaining.length === 0 ? <StatusPill tone="good">{copy.feeds.upToDate}</StatusPill> : null}
                  <Button
                    ref={toggleRef}
                    size="sm"
                    variant={remaining.length ? 'secondary' : 'ghost'}
                    icon={remaining.length ? <TriangleAlert aria-hidden="true" className="h-4 w-4 text-warn-text" /> : undefined}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpen((v) => !v)}
                  >
                    {remaining.length ? fill(copy.feeds.fix, { n: remaining.length }) : copy.feeds.review}
                  </Button>
                </div>
              ) : (
                <StatusPill tone={f.status.tone}>{f.status.label}</StatusPill>
              )}
            </div>
            {f.id === 'internships' ? (
              <div id={panelId} hidden={!open} className="mt-3 rounded-control border border-line bg-ground p-4">
                <p className="m-0 text-[13px] leading-snug text-ink">{copy.feeds.fixIntro}</p>
                <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
                  {unmatchedInternships.map((r) => (
                    <li key={r.id}>
                      {fixed.includes(r.id) ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink">
                          <span>
                            <span className="font-mono text-[13px]">{r.id}</span> · {r.term}
                          </span>
                          <StatusPill tone="good">{copy.feeds.fixed}</StatusPill>
                        </div>
                      ) : (
                        <Field label={fill(copy.feeds.fixField, { id: r.id })} hint={r.term}>
                          {(ids) => (
                            <TextInput
                              id={ids.id}
                              aria-describedby={[ids.describedBy, error ? errorId : null].filter(Boolean).join(' ') || undefined}
                              aria-invalid={error || undefined}
                              value={values[r.id] ?? ''}
                              onChange={(e) => {
                                const next = e.target.value;
                                setValues((v) => ({ ...v, [r.id]: next }));
                                if (error && next.trim() !== '') setError(false);
                              }}
                              placeholder={copy.feeds.fixPlaceholder}
                              autoComplete="off"
                              spellCheck={false}
                              className="aria-[invalid=true]:border-crit-text aria-[invalid=true]:shadow-[0_0_0_1px_var(--crit-text)]"
                            />
                          )}
                        </Field>
                      )}
                    </li>
                  ))}
                </ul>
                <p id={errorId} role="alert" className={cx('m-0 text-[13px] font-medium text-crit-text', error && 'mt-3')}>
                  {error ? copy.feeds.error : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {remaining.length ? (
                    <Button size="sm" variant="primary" onClick={save}>
                      {copy.feeds.save}
                    </Button>
                  ) : null}
                  <Button ref={closeRef} size="sm" variant="ghost" onClick={close}>
                    {copy.feeds.close}
                  </Button>
                </div>
                <p role="status" className={cx('m-0 text-[13px] leading-snug text-ink', message && 'mt-3')}>
                  {message}
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function NoDataCard({ programme, onReset }: { programme: Programme; onReset: () => void }) {
  return (
    <Card aria-labelledby="no-data-heading">
      <CardHeader id="no-data-heading" title={fill(copy.noData.title, { programme: programme.label })} description={copy.noData.body} />
      <Button onClick={onReset}>{copy.noData.action}</Button>
    </Card>
  );
}

export function ContributorPortal() {
  const [programmeId, setProgrammeId] = useState(programmes[0]?.id ?? '');
  const [year, setYear] = useState<ClassYear>(defaultClass);
  const programme = programmes.find((p) => p.id === programmeId) ?? (programmes[0] as Programme);

  return (
    <AppShell portal="contributor" persona="hessa" extraChips={<Chip tone="neutral">{tierLabels.T1}</Chip>}>
      <PageHeader title={copy.title} description={copy.lead} />

      <section aria-label={copy.filters.label} className="mb-6 rounded-card border border-line bg-surface px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <Field label={copy.filters.programme} className="w-full sm:w-[280px]">
            {(ids) => (
              <Select
                id={ids.id}
                aria-describedby={ids.describedBy}
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                className="!bg-surface !text-ink"
              >
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <RadioGroup<ClassYear>
            legend={copy.filters.classLegend}
            legendClassName="!mb-1.5 !text-sm"
            name="graduating-class"
            variant="segmented"
            value={year}
            onChange={setYear}
            options={classYears.map((y) => ({ value: y, label: y }))}
            disabled={!programme.hasData}
            className={cx('w-full sm:w-auto sm:min-w-[260px]', !programme.hasData && 'opacity-60')}
          />
          <p className="m-0 min-w-0 flex-1 basis-[240px] pb-3 text-[13px] leading-snug text-ink2">{copy.filters.followed}</p>
        </div>
      </section>

      {programme.hasData ? (
        <section aria-labelledby="class-heading" className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 id="class-heading" className="m-0 text-[20px] font-semibold leading-snug">
              {fill(copy.classHeading, { programme: programme.label, year })}
            </h2>
            <DataTag status={classOutcomes[year].graduates.status} />
          </div>
          <ClassTiles year={year} />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DestinationsChart year={year} />
            <SkillsChart year={year} />
          </div>
        </section>
      ) : null}

      {/* The feeds card keeps its place in the tree, so fixes survive a programme switch. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        {programme.hasData ? (
          <SuggestionsCard year={year} />
        ) : (
          <NoDataCard programme={programme} onReset={() => setProgrammeId(programmes[0]?.id ?? '')} />
        )}
        <FeedsCard />
      </div>

      <footer className="mt-6 flex items-start gap-3 rounded-card border border-line bg-surface px-5 py-4">
        <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink2" />
        <p className="m-0 text-sm leading-relaxed text-ink">{copy.footer}</p>
      </footer>
    </AppShell>
  );
}
