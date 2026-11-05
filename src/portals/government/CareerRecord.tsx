import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Check, Eye, EyeOff, FileCheck2, Info, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/app/AppShell';
import { Button } from '@/components/Button';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { Chip, DataTag } from '@/components/Chip';
import { DataTable, type Column } from '@/components/DataTable';
import { Field, Select, TextArea } from '@/components/Field';
import { StatusBanner, StatusPill } from '@/components/StatusPill';
import { Bars, type BarDatum } from '@/charts/Bars';
import { ChartFrame } from '@/charts/ChartFrame';
import { careerRecord, type EmploymentRow } from '@/data/government';
import { fill, formatInt } from '@/lib/format';

const rec = careerRecord;
const emp = rec.employment;
const skills = rec.skills;
const refs = rec.references;
const support = rec.decision;

const countedMonths = emp.rows.filter((row) => row.counted).reduce((sum, row) => sum + row.months.value, 0);

/** The sources that confirm one period, each with an icon and a word. */
function VerifiedBy({ row }: { row: EmploymentRow }) {
  return (
    <div className="flex flex-col gap-1">
      <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0">
        {row.sources.map((source) => (
          <li key={source} className="relative inline-flex items-center gap-1 whitespace-nowrap">
            <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-good-icon" strokeWidth={2.5} />
            {source}
            <span className="sr-only"> {emp.verifiedWord}</span>
          </li>
        ))}
      </ul>
      {row.note ? <p className="m-0 text-[13px] leading-snug text-ink2">{row.note}</p> : null}
    </div>
  );
}

const employmentColumns: Column<EmploymentRow>[] = [
  { key: 'employer', header: emp.columns.employer, rowHeader: true, render: (row) => row.employer },
  {
    key: 'role',
    header: emp.columns.role,
    render: (row) => (
      <>
        <span className="block">{row.role}</span>
        <span className="block text-[13px] text-ink2">{row.level}</span>
      </>
    ),
  },
  {
    key: 'dates',
    header: emp.columns.dates,
    render: (row) => (
      <>
        <span className="block whitespace-nowrap">{row.dates}</span>
        {row.counted ? <span className="block whitespace-nowrap text-[13px] text-ink2">{countedText(row)}</span> : null}
      </>
    ),
  },
  { key: 'verified', header: emp.columns.verified, render: (row) => <VerifiedBy row={row} /> },
];

const totalText = fill(emp.totalValue, { months: formatInt(countedMonths), span: support.experience.display ?? '' });

/** "N months counted" for counted periods. A period that does not count says why in its sources note instead. */
function countedText(row: EmploymentRow) {
  return row.counted ? fill(emp.countedLabel, { months: formatInt(row.months.value) }) : null;
}

/** Phone widths: one block per period, so no column is cut off. */
function EmploymentList() {
  return (
    <ul className="m-0 list-none divide-y divide-line2 p-0 sm:hidden">
      {emp.rows.map((row) => (
        <li key={row.id} className="py-3 first:pt-0">
          <p className="m-0 text-[15px] font-semibold leading-snug text-ink">{row.employer}</p>
          <p className="m-0 mt-0.5 text-sm leading-snug text-ink">
            {row.role}
            <span className="text-ink2"> · {row.level}</span>
          </p>
          <p className="m-0 mt-0.5 text-sm leading-snug text-ink2">
            {row.dates}
            {row.counted ? <> · {countedText(row)}</> : null}
          </p>
          <p className="m-0 mb-1 mt-2 text-[13px] font-medium text-ink2">{emp.columns.verified}</p>
          <div className="text-sm text-ink">
            <VerifiedBy row={row} />
          </div>
        </li>
      ))}
      <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pt-3 text-sm">
        <span className="font-semibold text-ink">{emp.totalLabel}</span>
        <span className="tabular text-ink">{totalText}</span>
      </li>
    </ul>
  );
}

function EmploymentHistory() {
  return (
    <Card aria-labelledby="employment-heading">
      <CardHeader id="employment-heading" title={emp.title} description={emp.description} />
      <EmploymentList />
      <div className="hidden sm:block">
        <DataTable
          caption={emp.title}
          hideCaption
          regionLabel={emp.tableLabel}
          columns={employmentColumns}
          rows={emp.rows}
          getKey={(row) => row.id}
          footer={
            <tr className="border-t border-line">
              <th scope="row" colSpan={2} className="px-3 py-3 text-start text-sm font-semibold text-ink">
                {emp.totalLabel}
              </th>
              <td colSpan={2} className="tabular px-3 py-3 text-sm text-ink">
                {totalText}
              </td>
            </tr>
          }
        />
      </div>
      <p className="m-0 mt-3 flex items-start gap-2 text-[13px] leading-snug text-ink2">
        <Info aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
        {emp.countRule}
      </p>
      <StatusBanner tone="neutral" className="mt-4" icon={<EyeOff aria-hidden="true" className="h-4 w-4 text-ink2" />}>
        <span className="text-ink">{emp.payNote}</span>
      </StatusBanner>
    </Card>
  );
}

function SkillsPassport() {
  const max = skills.max.value;
  const bars: BarDatum[] = skills.items.map((s) => ({
    key: s.id,
    label: s.name,
    sublabel: fill(skills.requiredLabel, { level: s.required.value }),
    value: s.level.value,
    valueLabel: fill(skills.levelLabel, { level: s.level.value, max }),
    ariaLabel: fill(skills.barLabel, { skill: s.name, level: s.level.value, max, required: s.required.value }),
  }));
  const ariaLabel = fill(skills.ariaLabel, {
    name: rec.applicantFirstName,
    max,
    list: skills.items.map((s) => `${s.name.toLowerCase()} ${s.level.value}`).join(', '),
  });
  return (
    <Card aria-labelledby="skills-heading">
      <CardHeader id="skills-heading" title={skills.title} description={skills.description} />
      <ChartFrame
        card={false}
        title={skills.chartTitle}
        subtitle={skills.chartSubtitle}
        status={skills.max.status}
        table={{
          caption: skills.chartTitle,
          columns: [
            { key: 'skill', label: skills.tableColumns.skill },
            { key: 'level', label: skills.tableColumns.level, numeric: true },
            { key: 'required', label: skills.tableColumns.required, numeric: true },
          ],
          rows: skills.items.map((s) => ({ skill: s.name, level: s.level.value, required: s.required.value })),
        }}
      >
        <Bars ariaLabel={ariaLabel} data={bars} max={max} />
      </ChartFrame>
      <div className="mt-5 grid gap-5 border-t border-line2 pt-5 sm:grid-cols-2">
        <div className="min-w-0">
          <h3 className="m-0 text-[15px] font-semibold">{skills.languagesTitle}</h3>
          <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0 text-sm">
            {skills.languages.map((l) => (
              <li key={l.id} className="flex flex-wrap gap-x-2">
                <span className="font-medium text-ink">{l.name}</span>
                <span className="text-ink2">{l.level}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <h3 className="m-0 text-[15px] font-semibold">{skills.certificationsTitle}</h3>
          <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0 text-sm">
            {skills.certifications.map((c) => (
              <li key={c.id} className="flex flex-wrap gap-x-2">
                <span className="font-medium text-ink">{c.name}</span>
                <span className="text-ink2">{c.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function References() {
  return (
    <Card aria-labelledby="references-heading">
      <CardHeader id="references-heading" title={refs.title} />
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {refs.items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 rounded-control bg-ground p-4">
            <div className="min-w-0">
              <p className="m-0 text-[15px] font-semibold text-ink">{item.who}</p>
              <p className="m-0 mt-0.5 text-sm text-ink2">{item.when}</p>
              <p className="m-0 mt-2 text-sm text-ink">
                <span className="font-medium">{refs.strengthsWord}: </span>
                {item.strengths.join(', ')}
              </p>
            </div>
            <p className="m-0 flex flex-col items-start gap-1 sm:items-end">
              <span className="text-[13px] text-ink2">{refs.ratingWord}</span>
              <span className="font-heading text-[22px] font-semibold leading-none text-ink">
                {fill(refs.ratingLabel, { rating: item.rating.value, outOf: item.outOf.value })}
              </span>
            </p>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-3 text-[13px] leading-relaxed text-ink2">{refs.note}</p>
    </Card>
  );
}

type Mode = 'idle' | 'accepted' | 'adjusting' | 'adjusted';

function DecisionSupport() {
  const [mode, setMode] = useState<Mode>('idle');
  const [option, setOption] = useState<string>(support.adjustOptions[0]?.id ?? '');
  const [reason, setReason] = useState('');
  const chosen = support.adjustOptions.find((o) => o.id === option);
  const canSave = reason.trim().length > 0;
  const acceptRef = useRef<HTMLButtonElement>(null);
  const adjustRef = useRef<HTMLButtonElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const formHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<'accept' | 'adjust' | 'change' | 'form' | null>(null);

  useEffect(() => {
    // Each step swaps the buttons, so move keyboard focus to the next control.
    const target = focusNext.current;
    focusNext.current = null;
    if (target === 'accept') acceptRef.current?.focus();
    else if (target === 'adjust') adjustRef.current?.focus();
    else if (target === 'change') changeRef.current?.focus();
    else if (target === 'form') formHeadingRef.current?.focus();
  }, [mode]);

  function go(next: Mode, focus: NonNullable<typeof focusNext.current>) {
    focusNext.current = focus;
    setMode(next);
  }

  return (
    <aside aria-labelledby="decision-heading" className="min-w-0 rounded-card border-2 border-accent bg-surface p-5">
      <h2 id="decision-heading" className="m-0 text-[17px] font-semibold leading-snug">
        {support.title}
      </h2>
      <p className="m-0 mt-1 text-sm leading-relaxed text-ink2">{support.intro}</p>

      <dl className="m-0 mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-control bg-ground p-4">
          <dt className="flex items-start justify-between gap-2 text-[13px] font-medium text-ink2">
            {support.experienceLabel}
            <DataTag status={support.experience.status} />
          </dt>
          <dd className="m-0 mt-1.5 font-heading text-[24px] font-semibold leading-tight text-ink">{support.experience.display}</dd>
          <dd className="m-0 mt-1 text-[13px] text-ink2">{support.experienceSub}</dd>
        </div>
        <div className="rounded-control bg-ground p-4">
          <dt className="text-[13px] font-medium text-ink2">{support.placementLabel}</dt>
          <dd className="m-0 mt-1.5 font-heading text-[20px] font-semibold leading-tight text-ink">{support.placement}</dd>
          <dd className="m-0 mt-1 text-[13px] text-ink2">{support.placementSub}</dd>
        </div>
      </dl>

      <h3 className="m-0 mt-5 text-[15px] font-semibold">{support.rulesTitle}</h3>
      <ol className="m-0 mt-2 flex list-decimal flex-col gap-2 ps-5 text-sm leading-relaxed text-ink marker:text-ink2">
        {support.rules.map((rule) => (
          <li key={rule} className="ps-1">
            {rule}
          </li>
        ))}
      </ol>

      <h3 className="m-0 mt-5 text-[15px] font-semibold">{support.checksTitle}</h3>
      <ul className="m-0 mt-2 flex list-none flex-col divide-y divide-line2 p-0">
        {support.checks.map((check) => (
          <li key={check.id} className="flex flex-col gap-1.5 py-3 first:pt-1">
            <span className="text-sm leading-snug text-ink">{check.label}</span>
            <span>
              <StatusPill tone={check.tone}>{check.result}</StatusPill>
            </span>
            {check.detail ? <span className="text-[13px] leading-snug text-ink2">{check.detail}</span> : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-line2 pt-4">
        {mode === 'idle' ? (
          // Stacked full width where the panel is narrow (phones, and the 380px side column from xl up).
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:flex-col">
            <Button ref={acceptRef} variant="primary" className="w-full sm:w-auto xl:w-full" onClick={() => go('accepted', 'change')}>
              {support.accept}
            </Button>
            <Button ref={adjustRef} variant="secondary" className="w-full sm:w-auto xl:w-full" onClick={() => go('adjusting', 'form')}>
              {support.adjust}
            </Button>
          </div>
        ) : null}

        {mode === 'adjusting' ? (
          <form
            aria-labelledby="adjust-heading"
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSave) go('adjusted', 'change');
            }}
          >
            <h3 id="adjust-heading" ref={formHeadingRef} tabIndex={-1} className="m-0 text-[15px] font-semibold">
              {support.adjustTitle}
            </h3>
            <Field label={support.adjustOptionLabel}>
              {({ id }) => (
                // The shared select class greys out every select (Chrome matches select:read-only); keep this one white.
                <Select id={id} className="!bg-surface !text-ink" value={option} onChange={(e) => setOption(e.target.value)}>
                  {support.adjustOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={support.reasonLabel} hint={support.reasonHint} required>
              {({ id, describedBy }) => (
                <TextArea id={id} aria-describedby={describedBy} value={reason} onChange={(e) => setReason(e.target.value)} rows={4} required />
              )}
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="primary" disabled={!canSave} aria-describedby={canSave ? undefined : 'adjust-save-hint'}>
                {support.saveAdjustment}
              </Button>
              <Button variant="ghost" onClick={() => go('idle', 'adjust')}>
                {support.cancel}
              </Button>
            </div>
            {!canSave ? (
              <p id="adjust-save-hint" className="m-0 text-[13px] text-ink2">
                {support.saveHint}
              </p>
            ) : null}
          </form>
        ) : null}

        {mode === 'accepted' || mode === 'adjusted' ? (
          <div className="flex flex-col items-start gap-3">
            <StatusBanner tone="good" live className="w-full">
              {mode === 'accepted' ? support.accepted : fill(support.adjusted, { placement: chosen?.label ?? '' })}
            </StatusBanner>
            {mode === 'adjusted' ? (
              <blockquote className="m-0 w-full border-s-2 border-line ps-3 text-sm italic leading-relaxed text-ink2">{reason.trim()}</blockquote>
            ) : null}
            <Button ref={changeRef} variant="ghost" size="sm" onClick={() => go('idle', 'accept')}>
              {support.change}
            </Button>
          </div>
        ) : null}

        {mode !== 'adjusting' ? <p className="m-0 mt-3 text-[13px] leading-relaxed text-ink2">{support.adjustNote}</p> : null}
      </div>
    </aside>
  );
}

export function CareerRecord() {
  return (
    <AppShell portal="government" persona="recruiter" extraChips={<Chip tone="neutral">{rec.scenarioChip}</Chip>}>
      <PageHeader
        eyebrow={rec.eyebrow}
        title={rec.title}
        description={
          <>
            <p className="m-0 font-medium text-ink">{rec.application}</p>
            <p className="m-0 mt-1 text-[13px] leading-snug">
              {rec.viewLog.lead} <span className="whitespace-nowrap">{rec.viewLog.purpose}</span>. {rec.viewLog.rest}
            </p>
          </>
        }
        chips={
          <>
            {/* Outline chips: the good tint is too close to the page ground to read as a chip; the green icons carry the status. */}
            <Chip tone="outline" icon={<ShieldCheck aria-hidden="true" className="h-4 w-4 text-good-icon" />}>
              {rec.chips.consent}
            </Chip>
            <Chip tone="outline" icon={<BadgeCheck aria-hidden="true" className="h-4 w-4 text-good-icon" />}>
              {rec.chips.verified}
            </Chip>
            <Chip icon={<FileCheck2 aria-hidden="true" className="h-4 w-4" />}>{rec.chips.sources}</Chip>
            <Chip icon={<Eye aria-hidden="true" className="h-4 w-4" />}>{rec.chips.mirror}</Chip>
            <DataTag status={rec.status} className="self-center" />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <EmploymentHistory />
          <SkillsPassport />
          <References />
        </div>
        <DecisionSupport />
      </div>

      <section
        aria-label={rec.neverIncludedTitle}
        className="mt-6 flex items-start gap-3 rounded-card border border-line bg-line2 px-5 py-4 text-sm leading-relaxed text-ink"
      >
        <EyeOff aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ink2" />
        <p className="m-0">{rec.neverIncluded}</p>
      </section>
    </AppShell>
  );
}
