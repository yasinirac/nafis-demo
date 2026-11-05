import { fig, type DataStatus, type Figure, type Tone } from './types';
import { published } from './published';
import { execSeries, forecastYears, lastYear, nowcastYear, quotaGap2031 } from './series';
import { fill, formatAED, formatInt, formatNumber, formatPct, formatSignedPct } from '@/lib/format';

/** Keep a currency and its amount on one line ("AED 141,000" never splits). */
function keepTogether(text: string): string {
  return text.replace(/ /g, ' ');
}

/**
 * Executive Command Centre data (chief executive). Data as of 29 Oct 2026, 06:00.
 * Everything here is fictional sample data or a model estimate, except the
 * figures taken from published.ts. Sentences that carry numbers are built here
 * so the screen never types a figure.
 */

export const execMeta = {
  title: 'Programme overview',
  lead: 'Headline figures with their status, the forecast, money and return, where people drop out and skills coverage.',
  freshness: 'Data as of 29 Oct 2026, 06:00 · all sources fresh',
};

/* ---------------------------------------------------------------- Filters */

export const periodOptions = [
  { value: 'ytd-2026', label: 'Year to date 2026' },
  { value: 'q3-2026', label: 'July to September 2026' },
  { value: 'cal-2025', label: 'Calendar year 2025' },
];

export const periodNote =
  'This concept holds one period of sample data, so the figures below stay the same when you change the period.';

export interface Emirate {
  code: string;
  name: string;
}

export const emirates: Emirate[] = [
  { code: 'AUH', name: 'Abu Dhabi' },
  { code: 'DXB', name: 'Dubai' },
  { code: 'SHJ', name: 'Sharjah' },
  { code: 'AJM', name: 'Ajman' },
  { code: 'UAQ', name: 'Umm Al Quwain' },
  { code: 'RAK', name: 'Ras Al Khaimah' },
  { code: 'FUJ', name: 'Fujairah' },
];

export const sectors = ['Financial services', 'Logistics', 'Retail', 'Construction', 'Hospitality', 'Healthcare', 'Technology'];

export const drillCopy = {
  root: 'UAE',
  separator: '›',
  allSectors: 'All sectors',
  allEmirates: 'All emirates',
  clear: 'Clear drill-down',
  breadcrumbLabel: 'Drill-down',
  personLevel: 'Person-level drill-down happens only on an escalated case with a logged purpose.',
};

/* ---------------------------------------------------- Skills coverage (SCI) */

/** Skills Coverage Index, rows = sectors, columns = emirates; null = too few people. */
export const sciMatrix: Array<Array<number | null>> = [
  [0.78, 0.74, 0.69, 0.55, 0.48, 0.58, 0.52],
  [0.61, 0.58, 0.57, 0.44, 0.39, 0.47, 0.42],
  [0.52, 0.49, 0.51, 0.43, 0.38, 0.45, 0.41],
  [0.44, 0.4, 0.41, 0.33, 0.29, 0.36, 0.31],
  [0.49, 0.47, 0.44, 0.37, null, 0.41, 0.39],
  [0.71, 0.66, 0.63, 0.52, 0.45, 0.55, 0.5],
  [0.63, 0.67, 0.54, 0.41, null, 0.43, null],
];

export const sciBins = [
  { below: 0.35, label: 'under 0.35' },
  { below: 0.45, label: '0.35–0.45' },
  { below: 0.55, label: '0.45–0.55' },
  { below: 0.65, label: '0.55–0.65' },
  { below: Infinity, label: '0.65 and over' },
];

export function formatSci(v: number): string {
  return formatNumber(v, 2);
}

/**
 * Sample 12-month retention and open counsellor cases per cell. They are
 * computed from coverage so every cell has a value, with one fixed cell:
 * Logistics in Ajman (61%, 14 open cases) to match the canned answer.
 */
const caseBase: Record<string, number> = { AUH: 34, DXB: 40, SHJ: 30, AJM: 23, UAQ: 7, RAK: 14, FUJ: 10 };
// Construction is 0.8 so that no other cell repeats the Logistics-in-Ajman pair (61%, 14 cases) used in the canned answer.
const sectorCaseWeight = [0.7, 1.1, 1.3, 0.8, 1.0, 0.6, 0.5];
const cellOverrides: Record<string, { retention: number; cases: number }> = {
  'Logistics|AJM': { retention: 61, cases: 14 },
};

export interface CellDetail {
  sector: string;
  emirate: Emirate;
  coverage: number | null;
  retention: number | null;
  cases: number | null;
}

export function cellDetail(row: number, col: number): CellDetail {
  const sector = sectors[row] ?? '';
  const emirate = emirates[col] ?? { code: '', name: '' };
  const coverage = sciMatrix[row]?.[col] ?? null;
  if (coverage == null) return { sector, emirate, coverage: null, retention: null, cases: null };
  const fixed = cellOverrides[`${sector}|${emirate.code}`];
  const retention = fixed?.retention ?? Math.round(50 + coverage * 34);
  const cases = fixed?.cases ?? Math.max(1, Math.round((caseBase[emirate.code] ?? 10) * (sectorCaseWeight[row] ?? 1) * (1 - coverage)));
  return { sector, emirate, coverage, retention, cases };
}

/** National values per sector (all emirates). Coverage and retention are ratios of totals, not averages of cells. */
const sectorNational = [
  { coverage: 0.72, retention: 75 },
  { coverage: 0.57, retention: 70 },
  { coverage: 0.49, retention: 66 },
  { coverage: 0.38, retention: 62 },
  { coverage: 0.43, retention: 64 },
  { coverage: 0.65, retention: 72 },
  { coverage: 0.62, retention: 71 },
];

/** Values per emirate (all sectors). */
const emirateAll = [
  { coverage: 0.63, retention: 72 },
  { coverage: 0.6, retention: 71 },
  { coverage: 0.56, retention: 69 },
  { coverage: 0.44, retention: 64 },
  { coverage: 0.4, retention: 62 },
  { coverage: 0.48, retention: 66 },
  { coverage: 0.44, retention: 64 },
];

function sumCases(cells: Array<[number, number]>): number {
  return cells.reduce((sum, [r, c]) => sum + (cellDetail(r, c).cases ?? 0), 0);
}

export const nationalSci = fig(0.56, 'sample');

const statusTemplates = {
  cell: '{sector} in {emirate}: coverage {coverage} · 12-month retention {retention} · {cases} open counsellor cases (sample). Next level: employers, then anonymised people, under the access rules.',
  hidden: '{sector} in {emirate}: not shown, too few people. Small groups stay hidden at every level of drill-down.',
  top: 'Select a cell, or choose a sector and an emirate above, to drill down. National coverage is {coverage} (sample).',
};

/** The status line under the heatmap for the current drill-down. */
export function drillStatus(sectorIndex: number | null, emirateIndex: number | null): string {
  if (sectorIndex != null && emirateIndex != null) {
    const d = cellDetail(sectorIndex, emirateIndex);
    if (d.coverage == null) return fill(statusTemplates.hidden, { sector: d.sector, emirate: d.emirate.name });
    return fill(statusTemplates.cell, {
      sector: d.sector,
      emirate: d.emirate.name,
      coverage: formatSci(d.coverage),
      retention: formatPct(d.retention ?? 0),
      cases: formatInt(d.cases ?? 0),
    });
  }
  if (sectorIndex != null) {
    const n = sectorNational[sectorIndex] ?? { coverage: 0, retention: 0 };
    return fill(statusTemplates.cell, {
      sector: sectors[sectorIndex] ?? '',
      emirate: 'all emirates',
      coverage: formatSci(n.coverage),
      retention: formatPct(n.retention),
      cases: formatInt(sumCases(emirates.map((_, c) => [sectorIndex, c] as [number, number]))),
    });
  }
  if (emirateIndex != null) {
    const n = emirateAll[emirateIndex] ?? { coverage: 0, retention: 0 };
    return fill(statusTemplates.cell, {
      sector: 'All sectors',
      emirate: emirates[emirateIndex]?.name ?? '',
      coverage: formatSci(n.coverage),
      retention: formatPct(n.retention),
      cases: formatInt(sumCases(sectors.map((_, r) => [r, emirateIndex] as [number, number]))),
    });
  }
  return fill(statusTemplates.top, { coverage: formatSci(nationalSci.value) });
}

export const heatmapCopy = {
  title: 'Skills coverage by sector and emirate',
  subtitle: 'Skills Coverage Index, 0 to 1. Select a cell to drill down.',
  note: 'Coverage is supply divided by demand: Skills Passports at the required level against skilled roles plus vacancies.',
  ariaLabel:
    'Skills coverage is highest in financial services and healthcare in Abu Dhabi and Dubai, and lowest in construction in Umm Al Quwain, Ajman and Fujairah.',
  scrollHint: 'Scroll sideways to see every emirate.',
  nullLabel: 'too few people',
  tableSector: 'Sector',
  status: 'sample' as DataStatus,
};

/* ------------------------------------------------------------- Ask a number */

const ajman = cellDetail(1, 3);
const logisticsNational = sectorNational[1]?.retention ?? 0;
const ajmanGap = logisticsNational - (ajman.retention ?? 0);
const construction = sectorNational[3]?.coverage ?? 0;
const hospitality = sectorNational[4]?.coverage ?? 0;
const sciTarget = fig(0.6, 'sample', { asOf: 'Dec 2026' });
/** AED a month for each missing Emirati, as on the employer dashboard. */
const contributionPerMonth = fig(10000, 'sample');
const missing2027 = fig(1200, 'estimate');
const contributions2031bn = (quotaGap2031 * contributionPerMonth.value * 12) / 1e9;
const ajmanFacts = { nightShiftShare: fig(38, 'sample'), employersWithHalfOfExits: fig(3, 'sample') };
const coverageGapShare = fig(62, 'sample');
const integrityFacts = { establishments: fig(14, 'sample'), openCases: fig(6, 'sample') };
const pulseFacts = { rakResponse: fig(52, 'sample'), floor: fig(50, 'sample') };

export type Confidence = 'high' | 'medium' | 'low to medium';

export interface AskItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  source: string;
  confidence: Confidence;
  status: DataStatus;
}

export const askCopy = {
  label: 'Ask about any number on this page',
  placeholder: 'Type a question, or pick one below',
  submit: 'Ask',
  suggestedLabel: 'Questions with prepared answers',
  noMatch: 'This concept holds answers to the three prepared questions only. Pick one of them, or use words such as Ajman, sectors or quota.',
  empty: 'Answers name their source, their confidence and the status of each figure.',
  sourceLabel: 'Source',
  confidenceLabel: 'Confidence',
  agentNote: 'drafted from certified metrics; you decide what to act on',
};

export const askItems: AskItem[] = [
  {
    id: 'ajman',
    question: 'Why is 12-month retention low in Ajman logistics?',
    keywords: ['ajman', 'logistics', 'retention', 'exits', 'night'],
    answer: fill(
      '12-month retention for logistics hires in Ajman is {ret}, {gap} points below logistics nationally. Two causes stand out. {night} of these hires work night shifts that were not in their Introduction Request, and {employers} employers account for half of the exits. Counsellors have {cases} open cases there.',
      {
        ret: formatPct(ajman.retention ?? 0),
        gap: ajmanGap,
        night: formatPct(ajmanFacts.nightShiftShare.value),
        employers: ajmanFacts.employersWithHalfOfExits.value,
        cases: formatInt(ajman.cases ?? 0),
      },
    ),
    source: 'M09 survival v1.3 · Alignment Checks · Staff Console cases',
    confidence: 'medium',
    status: 'sample',
  },
  {
    id: 'sectors',
    question: 'Which sectors are furthest from their skills target?',
    keywords: ['sector', 'sectors', 'skills', 'coverage', 'target', 'construction', 'hospitality', 'sci'],
    answer: fill(
      'Construction ({construction}) and hospitality ({hospitality}) are furthest from the {target} target. Together they hold {share} of the national coverage gap.',
      {
        construction: formatSci(construction),
        hospitality: formatSci(hospitality),
        target: formatSci(sciTarget.value),
        share: formatPct(coverageGapShare.value),
      },
    ),
    source: 'M04 Skills Coverage Index v1.1',
    confidence: 'high',
    status: 'sample',
  },
  {
    id: 'quota',
    question: 'What if the quota rises 1 point a year?',
    keywords: ['quota', 'rise', 'cost', 'missing', 'forecast', 'contribution'],
    answer: fill(
      'The supply of job-ready Emiratis becomes the limit. About {missing} Emiratis would be missing in {first}, growing to about {gap} by {last}. By then that is about AED\u00a0{bn}bn a year in contributions.',
      {
        missing: formatInt(missing2027.value),
        first: forecastYears[0] ?? '',
        gap: formatInt(quotaGap2031),
        last: lastYear,
        bn: formatNumber(contributions2031bn, 1),
      },
    ),
    source: 'Forecast model v2, central scenario',
    confidence: 'low to medium',
    status: 'estimate',
  },
];

/* ---------------------------------------------------------- This week, three */

export interface BriefingPoint {
  lead: string;
  text: string;
  metric: string;
  confidence: Confidence;
  status: DataStatus;
}

const skilled12 = { now: fig(85, 'sample'), prev: fig(81, 'sample') };
const readyPool = { now: fig(3.1, 'sample'), prev: fig(4.6, 'sample') };
const nonGenuine = { share: fig(3.4, 'estimate'), low: 2.1, high: 4.7 };

export const briefing = {
  title: 'This week in three points',
  agentNote: 'drafted from certified metrics and checked by the Statistics unit; you decide',
  packLink: 'Open the monthly pack',
  points: [
    {
      lead: 'People are staying longer.',
      text: fill('{now} of 2025 hires were still in skilled private work after 12 months, up from {prev} for 2024 hires.', {
        now: formatPct(skilled12.now.value),
        prev: formatPct(skilled12.prev.value),
      }),
      metric: 'M09 survival v1.3',
      confidence: 'high',
      status: 'sample',
    },
    {
      lead: 'Supply, not demand, will limit growth from 2027.',
      text: fill('The job-ready pool now covers {now} months of placements, down from {prev} a year ago.', {
        now: formatNumber(readyPool.now.value, 1),
        prev: formatNumber(readyPool.prev.value, 1),
      }),
      metric: 'M06 job-ready pool v1.0',
      confidence: 'medium',
      status: 'estimate',
    },
    {
      lead: fill('About {share} of counted Emiratis may not be in genuine work.', { share: formatPct(nonGenuine.share.value, 1) }),
      text: fill('The 90% range is {low} to {high}.', { low: formatPct(nonGenuine.low, 1), high: formatPct(nonGenuine.high, 1) }),
      metric: 'M15 non-genuine share v1.2',
      confidence: 'medium',
      status: 'estimate',
    },
  ] satisfies BriefingPoint[],
};

/* ---------------------------------------------------------- Needs attention */

export interface AttentionItem {
  tone: Extract<Tone, 'critical' | 'warning'>;
  level: string;
  text: string;
  area: string;
  status: DataStatus;
}

export const attention = {
  title: 'Needs attention',
  items: [
    {
      tone: 'critical',
      level: 'Critical',
      text: fill('Ajman logistics: 12-month retention {ret}, {gap} points below the sector nationally.', {
        ret: formatPct(ajman.retention ?? 0),
        gap: ajmanGap,
      }),
      area: 'People and placements',
      status: 'sample',
    },
    {
      tone: 'critical',
      level: 'Critical',
      text: fill('{n} establishments share one payroll pattern; {open} integrity cases are open.', {
        n: integrityFacts.establishments.value,
        open: integrityFacts.openCases.value,
      }),
      area: 'Integrity',
      status: 'sample',
    },
    {
      tone: 'warning',
      level: 'Warning',
      text: 'Pension records count fewer insured Emiratis than the jobs count. A reconciliation is open.',
      area: 'Data quality',
      status: 'sample',
    },
    {
      tone: 'warning',
      level: 'Warning',
      text: fill('Talent Monthly Pulse response in Ras Al Khaimah fell to {rate}, near the {floor} floor.', {
        rate: formatPct(pulseFacts.rakResponse.value),
        floor: formatPct(pulseFacts.floor.value),
      }),
      area: 'Surveys',
      status: 'sample',
    },
  ] satisfies AttentionItem[],
};

/* -------------------------------------------------------------- KPI tiles */

const privateNowcast = execSeries.private.history.find((p) => p.year === nowcastYear)?.figure.value ?? 1;
const rseNow = execSeries.rse.history.find((p) => p.year === nowcastYear)?.figure as Figure;
const rse2025 = execSeries.rse.history.find((p) => p.year === nowcastYear - 1)?.figure.value ?? 0;
const rseEnd = execSeries.rse.forecast[execSeries.rse.forecast.length - 1];

export const heroTile = {
  label: 'Retained Skilled Emiratis',
  kicker: 'The north-star measure',
  value: formatInt(rseNow.value),
  status: rseNow.status,
  outlookLabel: 'Outlook, model estimates',
  outlook: [
    { term: fill('Added during {year}', { year: nowcastYear }), detail: `+${formatInt(rseNow.value - rse2025)}` },
    { term: fill('Central forecast, {year}', { year: rseEnd?.year ?? '' }), detail: formatInt(rseEnd?.central.value ?? 0) },
    {
      term: fill('Low to high, {year}', { year: rseEnd?.year ?? '' }),
      detail: `${formatInt(rseEnd?.low.value ?? 0)}–${formatInt(rseEnd?.high.value ?? 0)}`,
    },
  ],
  sub: fill('24 or more verified skilled months in a row · {share} of Emiratis in private jobs · {end2025} at the end of 2025 · {year} nowcast', {
    share: formatPct(Math.round((rseNow.value / privateNowcast) * 100)),
    end2025: formatInt(rse2025),
    year: nowcastYear,
  }),
};

export interface ExecTile {
  id: string;
  label: string;
  value: string;
  status: DataStatus;
  sub: string;
}

const placementsSept = fig(4070, 'sample');
const placementsPlan = fig(4000, 'sample');

export const execTiles: ExecTile[] = [
  {
    id: 'private',
    label: 'Emiratis in private-sector jobs',
    value: published.privateSectorEmiratis.display ?? formatInt(published.privateSectorEmiratis.value),
    status: published.privateSectorEmiratis.status,
    sub: published.privateSectorEmiratis.asOf ?? '',
  },
  {
    id: 'placements',
    label: 'Gross placements, September',
    value: formatInt(placementsSept.value),
    status: placementsSept.status,
    sub: fill('Plan {plan} a month', { plan: formatInt(placementsPlan.value) }),
  },
  {
    id: 'skilled12',
    label: 'Still in skilled work after 12 months',
    value: formatPct(skilled12.now.value),
    status: skilled12.now.status,
    sub: fill('{diff} pts on 2024 hires', { diff: `+${skilled12.now.value - skilled12.prev.value}` }),
  },
  {
    id: 'sci',
    label: 'Skills Coverage Index',
    value: formatSci(nationalSci.value),
    status: nationalSci.status,
    sub: fill('Target {target} by {when}', { target: formatSci(sciTarget.value), when: sciTarget.asOf ?? '' }),
  },
  {
    id: 'nongenuine',
    label: 'Non-genuine share',
    value: formatPct(nonGenuine.share.value, 1),
    status: nonGenuine.share.status,
    sub: fill('90% range {low}–{high}', { low: formatNumber(nonGenuine.low, 1), high: formatPct(nonGenuine.high, 1) }),
  },
];

/* --------------------------------------------------------- Money and return */

const spend = { actual: fig(5.3, 'sample'), profile: fig(5.4, 'sample') };
const costPerRetained = { y2025: fig(133000, 'provisional'), y2024: fig(141000, 'provisional') };

export const money = {
  title: 'Money and return',
  items: [
    {
      id: 'spend',
      label: 'Spend, Jan–Sep',
      value: fill('AED\u00a0{v}bn', { v: formatNumber(spend.actual.value, 1) }),
      sub: fill('Profile AED\u00a0{v}bn', { v: formatNumber(spend.profile.value, 1) }),
      status: spend.actual.status,
    },
    {
      id: 'cost',
      label: 'Cost per retained placement',
      value: keepTogether(formatAED(costPerRetained.y2025.value)),
      sub: fill('2025 cohort, provisional · 2024 cohort {prev}', { prev: keepTogether(formatAED(costPerRetained.y2024.value)) }),
      status: costPerRetained.y2025.status,
    },
  ],
};

/** Fiscal return as a function of δ: −30% at δ 0.10, rising 209 points per 0.30 of δ. */
export const fiscal = {
  title: 'Fiscal return',
  options: [0.1, 0.14, 0.2, 0.25, 0.3, 0.4],
  ticks: [0.1, 0.2, 0.3, 0.4],
  defaultDelta: 0.25,
  base: -30,
  baseDelta: 0.1,
  slope: 209 / 0.3,
  status: 'estimate' as DataStatus,
  legend: 'Assumed δ',
  definition:
    'δ is the share of supported Emiratis who would otherwise have taken a state-funded job. The higher it is, the more public money the programme saves.',
  evidence: 'Evidence for δ: weak, no causal study yet. Model estimate.',
  chartTitle: 'Fiscal return across δ',
  breakEvenLabel: 'Break-even',
  xLabel: 'δ',
  tableDelta: 'δ',
  tableReturn: 'Fiscal return',
  tableBreakEven: 'Break-even',
};

export function fiscalReturn(delta: number): number {
  return fiscal.base + (delta - fiscal.baseDelta) * fiscal.slope;
}

/** δ at which the programme pays for itself (about 0.143). */
export const breakEvenDelta = fiscal.baseDelta - fiscal.base / fiscal.slope;

export function formatDelta(delta: number, digits = 2): string {
  return formatNumber(delta, digits);
}

export function formatReturn(delta: number): string {
  return formatSignedPct(Math.round(fiscalReturn(delta)));
}

/** δ values for the small line chart: 0.10 to 0.40 in steps of 0.01. */
export const fiscalGrid = Array.from({ length: 31 }, (_, i) => (10 + i) / 100);

export function fiscalSentence(delta: number): string {
  const r = Math.round(fiscalReturn(delta));
  const back = formatNumber(1 + r / 100, 2);
  if (r < 0) return fill('At δ {d}, each AED\u00a01 spent returns about AED\u00a0{back}: the programme costs more than it saves.', { d: formatDelta(delta), back });
  return fill('At δ {d}, each AED\u00a01 spent returns about AED\u00a0{back} to public finances.', { d: formatDelta(delta), back });
}

export const fiscalChart = {
  ariaLabel: fill('Fiscal return rises in a straight line from {low} at δ {dLow} to {high} at δ {dHigh}, and breaks even at δ {be}.', {
    low: formatReturn(0.1),
    dLow: formatDelta(0.1),
    high: formatReturn(0.4),
    dHigh: formatDelta(0.4),
    be: formatDelta(breakEvenDelta, 3),
  }),
  breakEvenText: fill('Break-even δ {be}', { be: formatDelta(breakEvenDelta, 3) }),
};

/* ------------------------------------------------------------------ Funnel */

const funnelRaw = [
  { key: 'registered', label: 'Registered', value: 38200 },
  { key: 'ready', label: 'Job-ready', value: 21500 },
  { key: 'introduced', label: 'Introduced', value: 14800 },
  { key: 'hired', label: 'Hired within 6 months', value: 9600 },
  { key: 'skilled', label: 'In skilled work at 12 months', value: 8160 },
];

export const funnelStages = funnelRaw.map((s, i) => {
  const prev = funnelRaw[i - 1];
  return { ...s, conversion: prev ? Math.round((s.value / prev.value) * 100) : undefined };
});

/** Share of registrants who are not yet job-ready (100 minus the first conversion). */
export const notJobReadyShare = 100 - (funnelStages[1]?.conversion ?? 0);

export const funnel = {
  title: 'Where people drop out',
  subtitle: 'People who registered in 2025',
  status: 'sample' as DataStatus,
  ariaLabel: fill('Of {start} people who registered in 2025, {end} were in skilled work at 12 months; the biggest drop is from registered to job-ready, where {kept} continue.', {
    start: formatInt(funnelRaw[0]?.value ?? 0),
    end: formatInt(funnelRaw[funnelRaw.length - 1]?.value ?? 0),
    kept: formatPct(funnelStages[1]?.conversion ?? 0),
  }),
  note: fill('Biggest drop: {share} of people who register are not yet job-ready. Readiness, not employer demand, limits placements.', {
    share: formatPct(notJobReadyShare),
  }),
  tableStage: 'Stage',
  tablePeople: 'People',
  tableConversion: 'Share of the previous step',
};

export const tileCopy = {
  keyNumbersLabel: 'Key numbers',
  confidenceLabel: 'Confidence',
};
