import { fig, type DataStatus, type Tone } from './types';
import { breakEvenDelta, formatDelta, formatReturn, notJobReadyShare } from './executive';
import { publicRules } from './publicStats';
import { fill, formatInt, formatNumber, formatPct } from '@/lib/format';

/**
 * Monthly pack to the Undersecretary's office, October 2026, draft v3.
 * Scenario date: Thursday 12 November 2026. Fictional sample data; the
 * fiscal-return range and the job-ready share come from executive.ts so the
 * pack and the Command Centre always agree.
 */

export const packMeta = {
  eyebrow: 'Monthly pack',
  title: "Monthly report to the Undersecretary's office",
  subtitle: 'October 2026 · draft v3 · due Tuesday 17 November (working day 12)',
  scenario: 'Scenario date: Thursday 12 November 2026',
  draftLabel: 'Draft v3',
  lockedLabel: 'Locked',
  returnedLabel: 'Returned to the writer',
};

/* ---------------------------------------------------------------- Sign-off */

export interface SignoffStep {
  role: string;
  done: string;
  current: string;
  upcoming: string;
}

export const signoffSteps: SignoffStep[] = [
  { role: 'Report Writer agent', done: 'Drafted 11 Nov 18:40', current: 'Drafting', upcoming: 'Drafts from certified metrics' },
  { role: 'Statistics unit', done: '42 of 42 figures verified', current: 'Verifying figures', upcoming: 'Verifies every figure' },
  { role: 'Division heads', done: '9 of 9 pages approved', current: '9 of 9 pages approved, ready to sign off', upcoming: 'Approve their own pages' },
  { role: 'Programme Director', done: 'Approved 12 Nov', current: 'Reviewing now', upcoming: 'Owns the decisions asked' },
  { role: 'Secretary-General', done: 'Signed and sent 12 Nov', current: 'Reviewing now', upcoming: 'Signs and sends' },
];

/** The pack opens at step 3 of 5 (Division heads). Zero-based. */
export const signoffStartIndex = 2;

export const signoffCopy = {
  title: 'Sign-off',
  stepperLabel: 'Sign-off steps for the October pack',
  approvePrefix: 'Approve: ',
  requestChanges: 'Request changes',
  withdraw: 'Withdraw request',
  exportPdf: 'Export PDF',
  stepOf: 'Step {n} of {total} · {role}',
  allDone: 'All {total} steps signed',
  /** Follows the stepper's own "Returned" word. */
  returnedDetail: 'back with the Report Writer agent for changes',
  returnedTitle: 'Returned to the writer',
  returned:
    'The pack is back with the Report Writer agent with your comments. The Statistics unit re-checks any figure that changes before the pack returns to this step.',
  locked: "Signed and sent to the Undersecretary's office. The pack is locked; corrections go out as a numbered erratum.",
  exportNote: 'PDF export is planned, not built in this demo.',
  chips: [
    { id: 'mohre', text: 'MoHRE co-sign on the integrity page: done 12 Nov 08:30', tone: 'good' as Tone },
    { id: 'check', text: 'Number check: 42 of 42 figures traced to a certified metric', tone: 'good' as Tone },
    { id: 'snapshot', text: 'Snapshot SNAP-2026-11-11-0600', tone: 'neutral' as Tone },
  ],
};

/* ---------------------------------------------------------- Pack figures */

const october = {
  skilled12: fig(85, 'sample'),
  cohort: 2025,
  months: 12,
  placements: fig(4310, 'sample'),
  placementsTarget: fig(4000, 'sample'),
  placementsRise: fig(6, 'sample'),
  financialServicesRise: fig(11, 'sample'),
  supplyLimitYear: 2027,
  nonGenuine: fig(3.4, 'estimate'),
  nonGenuineLow: 2.1,
  nonGenuineHigh: 4.7,
  rse: fig(92100, 'estimate'),
  rseTarget: fig(95000, 'sample'),
  sci: fig(0.56, 'sample'),
  sciTarget: fig(0.6, 'sample'),
  offTrack: fig(91, 'sample'),
  offTrackTarget: fig(90, 'sample'),
  spend: fig(5.9, 'sample'),
  spendProfile: fig(6.0, 'sample'),
  coachTrial: fig(5000, 'sample'),
  referred: fig(14, 'sample'),
  skilled12Target: fig(80, 'sample'),
  nonGenuineTarget: fig(2.5, 'sample'),
  spellsHeldBack: fig(1240, 'sample'),
  verificationSample: fig(1500, 'sample'),
  spendCorrection: fig(0.02, 'sample'),
};

/** Figures in the decisions section. Costs are estimates. */
const asks = {
  seasonalCounsellors: fig(30, 'sample'),
  seasonalCost: fig(4.1, 'estimate'),
  readinessWeeks: fig(12, 'sample'),
  readinessPeople: fig(6000, 'sample'),
  readinessCost: fig(54, 'estimate'),
  firstWave: fig(2000, 'sample'),
};

const summaryValues = {
  ret: formatPct(october.skilled12.value),
  cohort: october.cohort,
  months: october.months,
  rise: formatPct(october.placementsRise.value),
  placements: formatInt(october.placements.value),
  year: october.supplyLimitYear,
  ng: formatPct(october.nonGenuine.value, 1),
};

/* --------------------------------------------------------------- Sections */

export const packSections = {
  summary: { number: '1', title: 'October in one paragraph' },
  keyNumbers: { number: '2', title: 'Key numbers against target' },
  changes: { number: '3', title: 'What changed' },
  decisions: { number: '4', title: 'Decisions needed' },
  method: { number: '5', title: 'Method notes' },
};

export const summary = {
  arabicLabel: 'Arabic master text',
  englishLabel: 'English translation',
  arabic: fill(
    'بقي {ret} من المعيَّنين في عام {cohort} في وظائف مهارية بالقطاع الخاص بعد {months} شهراً، وهي أفضل نتيجة مسجَّلة. وارتفعت التعيينات بنسبة {rise} مقارنةً بشهر سبتمبر لتبلغ {placements}. وثمة خطران يستدعيان اتخاذ قرارات: فالمعروض من المواطنين الجاهزين للعمل سيحدّ من النمو اعتباراً من عام {year}، ويُقدَّر أن {ng} من المواطنين المحتسَبين قد لا يعملون في وظائف حقيقية.',
    summaryValues,
  ),
  english: fill(
    '{ret} of {cohort} hires were still in skilled private-sector work after {months} months, the best result recorded. Placements rose {rise} on September to {placements}. Two risks need decisions: the supply of job-ready Emiratis will limit growth from {year}, and an estimated {ng} of counted Emiratis may not be in genuine work.',
    summaryValues,
  ),
  agentNote: 'drafted the Arabic master text and the translation; the sign-off chain decides',
  /** Most figures in the paragraph are sample data; the non-genuine share is an estimate. */
  statuses: ['sample', 'estimate'] as DataStatus[],
};

/* ------------------------------------------------------------ Key numbers */

export interface KeyNumber {
  id: string;
  name: string;
  value: string;
  target: string;
  statusLabel: string;
  tone: Extract<Tone, 'good' | 'warning'>;
  dataStatus: DataStatus;
  lineage: string[];
  owner: string;
  check: string;
}

export const keyNumbersCopy = {
  hint: 'Select a measure to see where its number comes from.',
  caption: 'Key numbers against target, October 2026',
  measure: 'Measure',
  value: 'October',
  target: 'Target',
  status: 'Status',
  provisional: 'October figures are provisional.',
};

export const keyNumbers: KeyNumber[] = [
  {
    id: 'M07',
    name: 'Gross placements',
    value: formatInt(october.placements.value),
    target: fill('{n} a month', { n: formatInt(october.placementsTarget.value) }),
    statusLabel: 'On track',
    tone: 'good',
    dataStatus: october.placements.status,
    lineage: ['Work permits, daily', 'Payroll records, monthly', 'Placement events, with moves between employers counted apart', 'M07 gross placements v2.1'],
    owner: 'Placements team; certified by the Statistics unit',
    check: 'A new placement needs 2 months with no verified work before it.',
  },
  {
    id: 'M09',
    name: 'Still in skilled work at 12 months, 2025 hires',
    value: formatPct(october.skilled12.value),
    target: formatPct(october.skilled12Target.value),
    statusLabel: 'Ahead',
    tone: 'good',
    dataStatus: october.skilled12.status,
    lineage: ['Payroll records', 'Pension contributions', 'Verified person-months', 'M09 survival v1.3 (Kaplan–Meier)'],
    owner: 'Statistics unit',
    check: 'The verified-only variant is within 1 point.',
  },
  {
    id: 'M02',
    name: 'Retained Skilled Emiratis',
    value: formatInt(october.rse.value),
    target: fill('{n} by Dec', { n: formatInt(october.rseTarget.value) }),
    statusLabel: fill('Behind by {n}', { n: formatInt(october.rseTarget.value - october.rse.value) }),
    tone: 'warning',
    dataStatus: october.rse.status,
    lineage: [
      'Payroll records',
      'Pension contributions',
      'Verified person-months',
      'Skilled spells of 24 months or more, gaps of up to 2 months bridged',
      'M02 Retained Skilled Emiratis v3.0',
    ],
    owner: 'Statistics unit',
    check: fill('{n} spells are held back while integrity cases are open.', { n: formatInt(october.spellsHeldBack.value) }),
  },
  {
    id: 'M04',
    name: 'Skills Coverage Index',
    value: formatNumber(october.sci.value, 2),
    target: fill('{n} by Dec', { n: formatNumber(october.sciTarget.value, 2) }),
    statusLabel: 'Behind',
    tone: 'warning',
    dataStatus: october.sci.status,
    lineage: ['Work permits by occupation', 'Role Profiles and open vacancies (demand)', 'Skills Passport levels (supply)', 'M04 Skills Coverage Index v1.1'],
    owner: 'Statistics unit, with the skills team',
    check: 'A quarterly measure: October shows the third-quarter value.',
  },
  {
    id: 'M14',
    name: 'Off-track calls within 5 working days',
    value: formatPct(october.offTrack.value),
    target: formatPct(october.offTrackTarget.value),
    statusLabel: 'On track',
    tone: 'good',
    dataStatus: october.offTrack.status,
    lineage: ['Off-track Signals', 'Staff Console cases', 'Check-in Call outcomes', 'M14 off-track calls within 5 working days v1.0'],
    owner: 'Counselling service',
    check: 'The clock leaves out public holidays.',
  },
  {
    id: 'M15',
    name: 'Non-genuine share',
    value: fill('{v} ({low}–{high})', {
      v: formatPct(october.nonGenuine.value, 1),
      low: formatNumber(october.nonGenuineLow, 1),
      high: formatNumber(october.nonGenuineHigh, 1),
    }),
    target: fill('under {n}', { n: formatPct(october.nonGenuineTarget.value, 1) }),
    statusLabel: 'Behind',
    tone: 'warning',
    dataStatus: october.nonGenuine.status,
    lineage: [
      fill('Stratified verification sample, {n} a quarter', { n: formatInt(october.verificationSample.value) }),
      'MoHRE inspections',
      'Pulse, payroll and bank pattern flags',
      'M15 non-genuine share v1.2',
    ],
    owner: 'Integrity unit, with the Statistics unit; MoHRE co-signed this page',
    check: 'A 90% range is always shown.',
  },
  {
    id: 'M17',
    name: 'Spend against profile, year to date',
    value: fill('AED\u00a0{v}bn', { v: formatNumber(october.spend.value, 1) }),
    target: fill('AED\u00a0{v}bn', { v: formatNumber(october.spendProfile.value, 1) }),
    statusLabel: 'On track',
    tone: 'good',
    dataStatus: october.spend.status,
    lineage: ['Benefit ledger', 'Finance system', 'M17 spend against profile v1.0'],
    owner: 'Finance team',
    check: fill('Reconciled to the finance system on working day 10. Version 3 corrected this line by +AED\u00a0{v}bn.', {
      v: formatNumber(october.spendCorrection.value, 2),
    }),
  },
];

export const lineageCopy = {
  title: 'Where this number comes from',
  asideLabel: 'Sources and versions',
  chainLabel: 'Lineage, from source records to the certified metric',
  owner: 'Owner',
  check: 'Check',
};

/* ------------------------------------------------------------ What changed */

export const changes = [
  fill('Placements rose {rise} on September, led by financial services, up {fs}.', {
    rise: formatPct(october.placementsRise.value),
    fs: formatPct(october.financialServicesRise.value),
  }),
  fill('The Coach Agent trial reached {n} jobseekers in Sharjah and Ajman. It is randomised, and first results arrive in January.', {
    n: formatInt(october.coachTrial.value),
  }),
  fill('{n} establishments were referred to MoHRE for inspection. No penalty applies before inspection.', { n: october.referred.value }),
];

export const changesStatuses: DataStatus[] = [october.placementsRise.status];

/* --------------------------------------------------------------- Decisions */

export interface PackDecision {
  id: string;
  title: string;
  by: string;
  detail: string;
  recommendation: string;
  costStatus?: DataStatus;
}

export const decisionsCopy = {
  byPrefix: 'Decide by ',
  recommendation: 'Recommendation: ',
  agentNote: "drafted the recommendations from division inputs; the Undersecretary's office decides",
};

export const decisions: PackDecision[] = [
  {
    id: 'counsellors',
    title: fill('Fund {n} seasonal counsellors for March', { n: asks.seasonalCounsellors.value }),
    by: '30 Nov',
    detail: fill('The March step-down calls fall in Direction Profile season and in Ramadan. The cost is about AED\u00a0{m}m.', {
      m: formatNumber(asks.seasonalCost.value, 1),
    }),
    recommendation: 'Approve.',
    costStatus: asks.seasonalCost.status,
  },
  {
    id: 'readiness',
    title: 'Readiness programme for registered jobseekers not yet job-ready',
    by: '15 Dec',
    detail: fill('{share} of registered jobseekers are not job-ready. A {weeks}-week programme for {people} people costs about AED\u00a0{m}m.', {
      share: formatPct(notJobReadyShare),
      weeks: asks.readinessWeeks.value,
      people: formatInt(asks.readinessPeople.value),
      m: formatInt(asks.readinessCost.value),
    }),
    recommendation: fill('A randomised first wave of {n} people, so the effect can be measured.', { n: formatInt(asks.firstWave.value) }),
    costStatus: asks.readinessCost.status,
  },
  {
    id: 'delta',
    title: 'Agree the δ used in public statements',
    by: '15 Dec',
    detail: fill('Fiscal return runs from {low} to {high} across the plausible range of δ. No causal study exists yet.', {
      low: formatReturn(0.1),
      high: formatReturn(0.4),
    }),
    recommendation: fill(
      'Publish the break-even δ ({be}) and the full range ({low} at {dLow} to {high} at {dHigh}), never a single number, until the δ study reports. Fund the study.',
      {
        be: formatDelta(breakEvenDelta),
        low: formatReturn(0.1),
        dLow: formatDelta(0.1),
        high: formatReturn(0.4),
        dHigh: formatDelta(0.4),
      },
    ),
  },
];

/* ------------------------------------------------------------- Method notes */

export const methodNotes = [
  'October figures are provisional; they become final on 15 December.',
  fill('Public versions round counts to the nearest {round} and hide cells under {hide}.', {
    round: publicRules.roundTo,
    hide: publicRules.hideUnder,
  }),
  'Estimates show 90% ranges.',
];

/* ---------------------------------------------------------------- Versions */

export const versionsCopy = { title: 'Versions', status: october.spendCorrection.status };

export const versions = [
  {
    id: 'v3',
    label: 'v3 · 12 Nov',
    text: fill('Spend line corrected after finance reconciliation (+AED\u00a0{v}bn).', { v: formatNumber(october.spendCorrection.value, 2) }),
  },
  { id: 'v2', label: 'v2 · 11 Nov', text: 'Data close. All October figures provisional.' },
  { id: 'v1', label: 'v1 · 4 Nov', text: 'Live draft on early data, for internal planning only.' },
];
