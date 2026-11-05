import { disclosureRules } from './disclosure';
import { fill, formatInt, formatNumber, formatPct } from '@/lib/format';
import { metricById } from './metrics';
import { fig, type Figure, type Tone } from './types';

/**
 * Analyst Workbench. Everything here is synthetic sample data on the T2
 * (pseudonymised) tier, read through the certified metric M09 (survival).
 * Disclosure rules are applied in this file, so the screen only renders.
 */

export const snapshotId = 'SNAP-2026-10-27-0600';

const m09 = metricById('M09') ?? { id: 'M09', name: 'Survival S(6/12/24)', version: 'v1.3' };

/** The certified metric the sample question reads. */
export const questionMetricId = m09.id;

/** Disclosure rules applied before any result leaves the workbench. */
export const disclosure = {
  /** Cells with fewer people than this are not returned and show as "—". */
  minCell: disclosureRules.minGroup,
  /** Totals are rounded to this, so a hidden cell cannot be worked out. */
  totalsRoundTo: disclosureRules.internalRoundTo,
  /** Public tables round to this. */
  publicRoundTo: disclosureRules.publicRoundTo,
  /** Public tables hide cells under this. */
  publicMinCell: disclosureRules.publicMinCell,
  /** Default time limit of an approved person-level export, in hours. */
  exportHours: fig(24, 'illustrative'),
};

export type Emirate = 'sharjah' | 'dubai';

export const emirateNames: Record<Emirate, string> = { sharjah: 'Sharjah', dubai: 'Dubai' };

export interface RetentionCell {
  /** People placed in 2025 with a workplace in this emirate. */
  hires: number;
  /** Share still in verified private work 12 months after placement; null when not returned. */
  s12: number | null;
  /** Half-width of the 90% interval in points, when it is wide enough to mention. */
  interval?: number;
}

export interface SectorRow {
  sector: string;
  sharjah: RetentionCell;
  dubai: RetentionCell;
}

/** M09 S(12) for people placed January to December 2025, Sharjah and Dubai workplaces. */
export const retentionBySector: Figure<SectorRow[]> = fig(
  [
    { sector: 'Financial services', sharjah: { hires: 860, s12: 86 }, dubai: { hires: 4120, s12: 84 } },
    { sector: 'Logistics', sharjah: { hires: 940, s12: 79 }, dubai: { hires: 2380, s12: 77 } },
    { sector: 'Retail', sharjah: { hires: 1420, s12: 68 }, dubai: { hires: 3950, s12: 66 } },
    { sector: 'Construction', sharjah: { hires: 380, s12: 63 }, dubai: { hires: 1140, s12: 61 } },
    { sector: 'Healthcare', sharjah: { hires: 96, s12: 81, interval: 8 }, dubai: { hires: 1310, s12: 83 } },
    { sector: 'Technology', sharjah: { hires: 210, s12: 80 }, dubai: { hires: 1760, s12: 82 } },
    { sector: 'Arts and recreation', sharjah: { hires: 8, s12: null }, dubai: { hires: 64, s12: 70 } },
    { sector: 'Mining and quarrying', sharjah: { hires: 6, s12: null }, dubai: { hires: 9, s12: null } },
  ],
  'sample',
  { asOf: snapshotId, note: 'Synthetic data on the T2 tier.' },
);

export function isHidden(cell: RetentionCell): boolean {
  return cell.hires < disclosure.minCell.value || cell.s12 == null;
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

const rows = retentionBySector.value;
const emirates: Emirate[] = ['sharjah', 'dubai'];

function returnedHires(emirate: Emirate): number {
  return rows.reduce((sum, r) => sum + (isHidden(r[emirate]) ? 0 : r[emirate].hires), 0);
}

/** Hires per emirate over the cells the query returned, rounded to the nearest 100. */
export const roundedTotals: Record<Emirate, Figure<number>> = {
  sharjah: fig(roundTo(returnedHires('sharjah'), disclosure.totalsRoundTo.value), 'sample'),
  dubai: fig(roundTo(returnedHires('dubai'), disclosure.totalsRoundTo.value), 'sample'),
};

/** Cells (sector × emirate) withheld under the small-cell rule. */
export const hiddenCellCount = rows.reduce((n, r) => n + emirates.filter((e) => isHidden(r[e])).length, 0);

export const runStats = {
  seconds: fig(2.1, 'sample'),
  people: fig(roundTo(returnedHires('sharjah') + returnedHires('dubai'), disclosure.totalsRoundTo.value), 'sample'),
};

/** The one cell whose interval is wide enough to flag. */
const wide = (() => {
  for (const r of rows) {
    for (const e of emirates) {
      const cell = r[e];
      if (cell.interval != null && cell.s12 != null) return { sector: r.sector, emirate: e, cell };
    }
  }
  return null;
})();

/** The Analyst Copilot's summary, drafted from the table values above. */
export const copilotSummary = (() => {
  const both = rows.filter((r) => !isHidden(r.sharjah) && !isHidden(r.dubai));
  const top = [...both].sort((a, b) => (b.sharjah.s12 ?? 0) + (b.dubai.s12 ?? 0) - ((a.sharjah.s12 ?? 0) + (a.dubai.s12 ?? 0)))[0];
  const lowest = [...both].sort((a, b) => (a.sharjah.s12 ?? 0) + (a.dubai.s12 ?? 0) - ((b.sharjah.s12 ?? 0) + (b.dubai.s12 ?? 0))).slice(0, 2);
  const lowValues = lowest.flatMap((r) => [r.sharjah.s12 ?? 0, r.dubai.s12 ?? 0]);
  const gap = Math.max(...both.map((r) => Math.abs((r.sharjah.s12 ?? 0) - (r.dubai.s12 ?? 0))));
  const parts = [
    fill('{top} keeps the highest share of its 2025 hires in both emirates: {shj} in Sharjah and {dxb} in Dubai.', {
      top: top?.sector ?? '',
      shj: formatPct(top?.sharjah.s12 ?? 0),
      dxb: formatPct(top?.dubai.s12 ?? 0),
    }),
    fill('{a} and {b} keep the lowest shares, {min}–{max}%.', {
      a: lowest[0]?.sector ?? '',
      b: (lowest[1]?.sector ?? '').toLowerCase(),
      min: Math.min(...lowValues),
      max: Math.max(...lowValues),
    }),
    fill('In every sector with both emirates shown, Sharjah and Dubai are within {gap} points of each other.', { gap }),
  ];
  if (wide) {
    parts.push(
      fill('{sector} in {emirate} rests on {n} people, so its {s12} has a wide interval (±{hw} points).', {
        sector: wide.sector,
        emirate: emirateNames[wide.emirate],
        n: formatInt(wide.cell.hires),
        s12: formatPct(wide.cell.s12 ?? 0),
        hw: wide.cell.interval ?? 0,
      }),
    );
  }
  return parts.join(' ');
})();

/** Kaplan–Meier survival in verified private work by year hired, all workplaces. */
export const cohortSurvival = fig(
  {
    months: [0, 3, 6, 9, 12, 15, 18, 21, 24],
    cohorts: [
      { id: 'hired-2023', year: 2023, label: 'Hired in 2023', values: [100, 93, 87, 82, 78, 74, 71, 69, 67] },
      { id: 'hired-2024', year: 2024, label: 'Hired in 2024', values: [100, 94, 89, 85, 81, 78, 75, 73, 71] },
      { id: 'hired-2025', year: 2025, label: 'Hired in 2025', values: [100, 95, 91, 88, 85] },
    ],
  },
  'sample',
  { asOf: snapshotId },
);

/** Axis settings for the survival chart. */
export const cohortChart = {
  xTicks: [0, 6, 12, 18, 24],
  yDomain: [50, 100] as [number, number],
  yTicks: [50, 60, 70, 80, 90, 100],
  /** The month whose values the context chart and summary quote. */
  keyMonth: 12,
  lastMonth: 24,
};

function valueAtMonth(values: number[], month: number): number | null {
  const i = cohortSurvival.value.months.indexOf(month);
  return i >= 0 && i < values.length ? (values[i] ?? null) : null;
}

/** S(12) for each year hired, for the small context chart. */
export const s12ByYearHired = cohortSurvival.value.cohorts.map((c) => ({
  id: c.id,
  year: c.year,
  label: c.label,
  value: valueAtMonth(c.values, cohortChart.keyMonth),
}));

const at12 = cohortSurvival.value.cohorts.map((c) => valueAtMonth(c.values, cohortChart.keyMonth));
const at24 = cohortSurvival.value.cohorts.map((c) => valueAtMonth(c.values, cohortChart.lastMonth));
const years = cohortSurvival.value.cohorts.map((c) => c.year);
const followedTo = (() => {
  const last = cohortSurvival.value.cohorts[cohortSurvival.value.cohorts.length - 1];
  return last ? (cohortSurvival.value.months[last.values.length - 1] ?? 0) : 0;
})();

export type CheckState = 'passed' | 'check' | 'blocked';

export const checkStates: Record<CheckState, { label: string; tone: Tone }> = {
  passed: { label: 'Passed', tone: 'good' },
  check: { label: 'Check', tone: 'warning' },
  blocked: { label: 'Blocked', tone: 'critical' },
};

export interface ReleaseCheck {
  id: string;
  state: CheckState;
  title: string;
  detail: string;
}

export const releaseChecks: ReleaseCheck[] = [
  {
    id: 'definition',
    state: 'passed',
    title: 'Certified definition',
    detail: fill('{id} S(12) {version}, owned by the Statistics & Evaluation unit.', { id: m09.id, version: m09.version }),
  },
  {
    id: 'small-cells',
    state: 'passed',
    title: 'Small cells hidden',
    detail: fill('{n} cells under {min} people are not returned and show as —.', { n: hiddenCellCount, min: disclosure.minCell.value }),
  },
  {
    id: 'back-calculation',
    state: 'passed',
    title: 'No back-calculation',
    detail: fill('Totals are rounded to the nearest {round}, so a hidden cell cannot be worked out.', {
      round: disclosure.totalsRoundTo.value,
    }),
  },
  {
    id: 'interval',
    state: 'check',
    title: 'Wide interval',
    detail: wide
      ? fill('{sector} in {emirate} rests on {n} people: ±{hw} points. Say so if you quote it.', {
          sector: wide.sector,
          emirate: emirateNames[wide.emirate],
          n: formatInt(wide.cell.hires),
          hw: wide.cell.interval ?? 0,
        })
      : 'No cell has a wide interval.',
  },
  {
    id: 'provisional',
    state: 'check',
    title: 'Provisional month',
    detail: 'September is provisional (grade B) and may be revised before it is final.',
  },
  {
    id: 'export',
    state: 'blocked',
    title: 'Person-level export',
    detail: 'Needs a Linkage Unit request with a purpose code.',
  },
];

export const releaseCheckCounts = {
  check: releaseChecks.filter((c) => c.state === 'check').length,
};

export const analystCopy = {
  title: 'Ask the data',
  lead: 'Questions run read-only on pseudonymised, synthetic data. Every result passes a release check before it leaves the workbench.',
  grades: {
    final: 'Final to August 2026 (grade A)',
    provisional: 'September provisional (grade B)',
    snapshot: `Snapshot ${snapshotId}`,
    synthetic: 'Synthetic data, no real person',
  },
  question: {
    heading: 'Your question',
    label: 'Question in plain words',
    sample: '12-month retention for people hired in 2025, by sector, Sharjah vs Dubai workplaces',
    edited:
      'You changed the question. In this concept the Analyst Copilot reads only the sample question, so the reading and the result stay as they are.',
    reset: 'Use the sample question',
  },
  readAs: {
    label: 'Read as',
    text: 'M09 S(12) v1.3, Kaplan–Meier survival in verified private work · people placed January to December 2025 · workplace in Sharjah or Dubai · by sector',
    note: 'you check the reading before you run it',
  },
  run: {
    run: 'Run',
    running: fill('Running on {snapshot}…', { snapshot: snapshotId }),
    done: fill('Ran in {seconds} s · about {people} people · read-only', {
      seconds: formatNumber(runStats.seconds.value, 1),
      people: formatInt(runStats.people.value),
    }),
    save: 'Save to notebook',
    notebookTitle: 'Retention of 2025 hires by sector, Sharjah and Dubai',
    saved: 'Saved to your notebook: {title}.',
    savedAgain: 'Already in your notebook: {title}.',
  },
  result: {
    heading: 'Result',
    tabsLabel: 'Result views',
    tabs: { table: 'Table', cohorts: 'Compare cohorts', sql: 'SQL' },
  },
  table: {
    caption: '12-month retention of people placed in 2025, by sector and workplace emirate',
    columns: {
      sector: 'Sector',
      shjHires: 'Sharjah hires',
      shjS12: 'Sharjah S(12)',
      dxbHires: 'Dubai hires',
      dxbS12: 'Dubai S(12)',
    },
    hiddenSr: fill('hidden, fewer than {min} people', { min: disclosure.minCell.value }),
    intervalLabel: '±{n} pts',
    intervalSr: 'wide interval, plus or minus {n} points',
    scrollHint: 'The table scrolls sideways. Dubai is to the right.',
    totalLabel: 'Total, rounded',
    totalValue: 'about {n}',
    note: fill(
      '— hidden: fewer than {min} people. Totals add the cells shown and are rounded to the nearest {round}. S(12) is the share still in verified private work 12 months after placement, with any employer.',
      { min: disclosure.minCell.value, round: disclosure.totalsRoundTo.value },
    ),
  },
  summary: {
    prefix: 'Drafted by',
    note: 'from this table; check before reuse',
  },
  cohorts: {
    title: 'Still in verified private work, by year hired',
    subtitle: fill('All workplaces and sectors · {metric}', { metric: `${m09.id} ${m09.version}` }),
    xAxis: 'Months after placement',
    pointLabel: '{title}: {rows}',
    endLabel: '{year} · {value}',
    tooltipTitle: 'Month {m} after placement',
    notYet: 'Not yet observed',
    monthColumn: 'Months after placement',
    footnote: fill('People hired in 2025 are followed to month {m} so far. Each line holds its value until the next reading.', {
      m: followedTo,
    }),
    ariaLabel: fill(
      'Step-line survival curves by year hired: at month {m} {a} of 2023 hires, {b} of 2024 hires and {c} of 2025 hires were still in verified private work, and at month {last} {d} of 2023 hires and {e} of 2024 hires.',
      {
        m: cohortChart.keyMonth,
        a: formatPct(at12[0] ?? 0),
        b: formatPct(at12[1] ?? 0),
        c: formatPct(at12[2] ?? 0),
        last: cohortChart.lastMonth,
        d: formatPct(at24[0] ?? 0),
        e: formatPct(at24[1] ?? 0),
      },
    ),
  },
  context: {
    title: fill('Still in verified private work at month {m}, by year hired', { m: cohortChart.keyMonth }),
    subtitle: fill('All workplaces · {metric} S(12)', { metric: `${m09.id} ${m09.version}` }),
    footnote: fill('The Compare cohorts tab shows the full curves to month {last}.', { last: cohortChart.lastMonth }),
    yearColumn: 'Year hired',
    valueColumn: 'S(12)',
    ariaLabel: fill('Bar chart of S(12) by year hired: {list}.', {
      list: years.map((y, i) => `${formatPct(at12[i] ?? 0)} of ${y} hires`).join(', '),
    }),
  },
  sql: {
    regionLabel: 'Generated SQL, read-only',
    prefix: 'Generated by',
    note: 'read-only; a person checks it before reuse',
    footnote: 'Only certified views can be queried. Writes, person-level joins and Emirates ID are not available to this role.',
  },
  release: {
    heading: 'Release check',
    label: 'Release label: internal',
    request: 'Request release review',
    requested: fill(
      'Sent for release review. A statistics officer looks at the {n} checks first. The label stays internal until then, and the person-level export stays blocked.',
      { n: releaseCheckCounts.check },
    ),
    add: 'Add to notebook',
    added: 'Result added to your notebook with its release label: internal.',
    note: fill(
      "Publishing outside NAFIS needs a statistics officer's sign-off. Public tables round to the nearest {round} and hide cells under {min}.",
      { round: disclosure.publicRoundTo.value, min: disclosure.publicMinCell.value },
    ),
  },
  linkage: {
    toggle: 'What a request needs',
    intro: 'Person-level records leave the workbench only through the Linkage Unit. An export needs:',
    items: [
      'A request to the Linkage Unit with a purpose code',
      'A written justification',
      'A second approver',
      fill('A time limit, {hours} hours by default', { hours: disclosure.exportHours.value }),
    ],
  },
};

/** The SQL the Analyst Copilot generated for the sample question. Comments start with "--". */
export const generatedSql: string[] = [
  '-- Generated by Analyst Copilot from your question. Read-only.',
  `-- Role analyst_readonly · tier T2 (pseudonymised) · ${snapshotId}`,
  'SELECT   sector,',
  '         workplace_emirate,',
  '         COUNT(*)                                        AS hires,',
  `         certified.km_survival(spell_months, ended, ${cohortChart.keyMonth})  AS s12   -- ${m09.id} ${m09.version}`,
  'FROM     certified.placements',
  "WHERE    placed_on BETWEEN DATE '2025-01-01' AND DATE '2025-12-31'",
  "  AND    workplace_emirate IN ('Sharjah', 'Dubai')",
  'GROUP BY sector, workplace_emirate',
  `HAVING   COUNT(*) >= ${disclosure.minCell.value};   -- disclosure rule: cells under ${disclosure.minCell.value} people are not returned`,
];
