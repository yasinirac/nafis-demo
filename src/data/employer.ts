import { fig, type DataStatus, type FitTier, type Figure } from './types';
import { companies } from './companies';
import { people, staff, type Person } from './people';
import { fill, formatInt, formatNumber } from '../lib/format';

/**
 * Employer portal: Qasr Logistics (fictional) on Thursday 29 October 2026,
 * seen by Huda (HR Admin) and Ahmed (line manager). Every figure is sample
 * data. Sentences that contain numbers live here, filled from the figures,
 * so screens never type one.
 */

const qasr = companies.qasr;

/** "a, b and c", so a chart's aria-label stays one sentence. */
function listWithAnd(items: string[]): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export const employerScenario = {
  date: 'Thursday 29 October 2026',
  reportMonth: 'October 2026',
  hrAdmin: staff.huda,
  lineManager: staff.ahmed,
};

/* ------------------------------------------------------------------ */
/* Legal count and the tenure weighting (planning only)                */
/* ------------------------------------------------------------------ */

export type TenureBandKey = 'new' | 'settled' | 'long';

export interface TenureBand {
  key: TenureBandKey;
  label: string;
  /** Planning weight. A rule parameter, not a measured figure. */
  weight: number;
}

/** 0.5 for under 6 months, 1.0 for 6 to 24 months, 1.5 beyond. */
export const tenureBands: TenureBand[] = [
  { key: 'new', label: 'Under 6 months', weight: 0.5 },
  { key: 'settled', label: '6 to 24 months', weight: 1 },
  { key: 'long', label: 'More than 24 months', weight: 1.5 },
];

export function tenureBandFor(months: number): TenureBand {
  if (months < 6) return tenureBands[0] as TenureBand;
  if (months <= 24) return tenureBands[1] as TenureBand;
  return tenureBands[2] as TenureBand;
}

export interface CountedEmirati {
  ref: string;
  /** Set for the five people named on screen; the other eight stay unnamed. */
  person?: Person;
  site: 'Sharjah HQ' | 'Dubai branch';
  /** Completed months in the current job on 29 October 2026. */
  months: number;
  /** Planning weight from the tenure band. */
  weight: number;
}

const roster: Array<Omit<CountedEmirati, 'weight'>> = [
  { ref: 'QL-01', person: people.rashid, site: 'Sharjah HQ', months: 5 },
  { ref: 'QL-02', person: people.noura, site: 'Dubai branch', months: 25 },
  { ref: 'QL-03', person: people.saeed, site: 'Sharjah HQ', months: 6 },
  { ref: 'QL-04', person: people.latifa, site: 'Sharjah HQ', months: 38 },
  { ref: 'QL-05', person: people.hamad, site: 'Dubai branch', months: 2 },
  { ref: 'QL-06', site: 'Sharjah HQ', months: 1 },
  { ref: 'QL-07', site: 'Dubai branch', months: 3 },
  { ref: 'QL-08', site: 'Dubai branch', months: 4 },
  { ref: 'QL-09', site: 'Sharjah HQ', months: 8 },
  { ref: 'QL-10', site: 'Dubai branch', months: 11 },
  { ref: 'QL-11', site: 'Sharjah HQ', months: 14 },
  { ref: 'QL-12', site: 'Dubai branch', months: 19 },
  { ref: 'QL-13', site: 'Sharjah HQ', months: 22 },
];

/** The 13 sample Emiratis on Qasr Logistics payroll with their planning weights. They sum to 11.5. */
export const countedEmiratis: CountedEmirati[] = roster.map((r) => ({ ...r, weight: tenureBandFor(r.months).weight }));

export const legalCount = {
  counted: fig(countedEmiratis.length, 'sample'),
  required: fig(14, 'sample'),
  weighted: fig(
    countedEmiratis.reduce((sum, e) => sum + e.weight, 0),
    'sample',
  ),
  checkpoint: '31 Dec',
};

const shortBy = legalCount.required.value - legalCount.counted.value;

export const tenureSummary = tenureBands.map((band) => {
  const members = countedEmiratis.filter((e) => tenureBandFor(e.months).key === band.key);
  return {
    ...band,
    people: fig(members.length, 'sample'),
    countsAs: fig(members.length * band.weight, 'sample'),
  };
});

/** "0.5 for under 6 months, 1.0 for 6 to 24 months, 1.5 for more than 24 months" */
const tenureRuleText = tenureBands.map((b) => `${formatNumber(b.weight, 1)} for ${b.label.toLowerCase()}`).join(', ');

/* ------------------------------------------------------------------ */
/* Role Profile and the Talent Discovery pool                          */
/* ------------------------------------------------------------------ */

export const roleProfile = {
  title: 'Finance Analyst',
  site: 'Sharjah HQ',
  payMin: fig(9500, 'sample'),
  payMax: fig(11000, 'sample'),
  hours: 'Sun–Thu 8:00–16:30',
  start: 'By Jan 2027',
  mustHaves: ['Financial reporting 3', 'Excel 3', 'English B2'],
};

export type AvailabilityKey = 'graduating' | 'looking' | 'returning' | 'moving';

export interface AvailabilityGroup {
  key: AvailabilityKey;
  label: string;
  /** People in this group who are available, chose to be visible and whose travel limit covers the site. */
  available: Figure;
}

export const availabilityGroups: AvailabilityGroup[] = [
  { key: 'graduating', label: 'Graduating within 6 months', available: fig(9, 'sample') },
  { key: 'looking', label: 'Looking for work', available: fig(18, 'sample') },
  { key: 'returning', label: 'Returning to work', available: fig(4, 'sample') },
  { key: 'moving', label: 'Employed and open to move', available: fig(7, 'sample') },
];

const availableTotal = availabilityGroups.reduce((sum, g) => sum + g.available.value, 0);

/* ------------------------------------------------------------------ */
/* Dashboard figures                                                   */
/* ------------------------------------------------------------------ */

export const contribution = {
  monthly: fig(10000, 'sample'),
  from: '1 Jan 2027',
};

export const reportsDue = fig(4, 'sample');

export const retention = {
  company: qasr.retention12,
  sector: qasr.sectorRetention12,
};

export const eqs = qasr.eqs;

export interface PipelineStage {
  key: string;
  label: string;
  value: Figure;
}

export const pipeline: PipelineStage[] = [
  { key: 'sent', label: 'Introduction Requests sent', value: fig(12, 'sample') },
  { key: 'accepted', label: 'Accepted', value: fig(7, 'sample') },
  { key: 'interviewed', label: 'Interviewed', value: fig(5, 'sample') },
  { key: 'offers', label: 'Offers made', value: fig(2, 'sample') },
  { key: 'hired', label: 'Hired', value: fig(1, 'sample') },
];

const stageValue = (key: string) => pipeline.find((s) => s.key === key)?.value.value ?? 0;

export interface QualityPart {
  key: string;
  label: string;
  /** Weight in percent. A rule parameter of the score. */
  weight: number;
  score: Figure;
}

export const qualityParts: QualityPart[] = [
  { key: 'retention', label: 'Retention (verified placements)', weight: 30, score: fig(81, 'sample') },
  { key: 'pay', label: 'Pay and progression', weight: 20, score: fig(58, 'sample') },
  { key: 'integrity', label: 'Role integrity', weight: 20, score: fig(68, 'sample') },
  { key: 'development', label: 'Development', weight: 10, score: fig(66, 'sample') },
  { key: 'conduct', label: 'Hiring conduct and reporting', weight: 10, score: fig(90, 'sample') },
  { key: 'voice', label: 'Employee voice (10+ answers)', weight: 10, score: fig(70, 'sample') },
];

/** Points a part adds to the score: weight times result. */
export function qualityPoints(part: QualityPart): number {
  return (part.weight * part.score.value) / 100;
}

/** 24.3 + 11.6 + 13.6 + 6.6 + 9.0 + 7.0 = 72.1, shown as 72 (the EQS in companies.ts). */
export const qualityTotal = fig(
  qualityParts.reduce((sum, p) => sum + qualityPoints(p), 0),
  'sample',
);
export const qualityWeightTotal = qualityParts.reduce((sum, p) => sum + p.weight, 0);
export const qualityScaleMax = 100;

const lowestPart = qualityParts.reduce((low, p) => (p.score.value < low.score.value ? p : low));
/** The lowest part, drawn in the warning bar colour with an icon and a word. */
export const qualityLowestKey = lowestPart.key;

/** Emiratis with no pay change in 18 months, behind the Employer Agent's pay-review action. */
export const payReviews = { people: fig(3, 'sample'), monthsWithoutChange: fig(18, 'sample') };

/** New hires starting soon, behind the Employer Agent's buddy action. */
export const newHires = { people: fig(2, 'sample'), start: '9 Nov' };

export const money = {
  owed: fig(0, 'sample'),
  supportPaid: fig(312000, 'sample'),
  partnersClubTier: fig('Tier 2', 'sample'),
  nextCheckpoint: fig('31 Dec 2026', 'sample'),
};

export type ReportState = 'due' | 'submitted';

export interface TeamRow {
  person: Person;
  trainingHours: Figure;
  report: { state: ReportState; text: string; detail?: string; open?: boolean };
  /** Always an action, never a prediction. */
  nextStep: string;
}

export const teamRows: TeamRow[] = [
  {
    person: people.rashid,
    trainingHours: fig(4, 'sample'),
    report: { state: 'due', text: 'Due 7 Nov', detail: 'With Ahmed, his line manager', open: true },
    nextStep: 'Book the six-month review',
  },
  {
    person: people.noura,
    trainingHours: fig(6, 'sample'),
    report: { state: 'submitted', text: 'Submitted 27 Oct', detail: 'You attest by 10 Nov' },
    nextStep: 'Schedule a pay review',
  },
  {
    person: people.saeed,
    trainingHours: fig(0, 'sample'),
    report: { state: 'due', text: 'Due 7 Nov' },
    nextStep: 'Agree a training plan',
  },
  {
    person: people.latifa,
    trainingHours: fig(9, 'sample'),
    report: { state: 'submitted', text: 'Submitted 28 Oct', detail: 'You attest by 10 Nov' },
    nextStep: 'Schedule a pay review',
  },
  {
    person: people.hamad,
    trainingHours: fig(20, 'sample'),
    report: { state: 'due', text: 'Due 7 Nov' },
    nextStep: 'Book the day-90 review',
  },
];

export type ActionKey = 'find' | 'pay' | 'buddy';

export interface AgentAction {
  key: ActionKey;
  title: string;
  why: string;
  primary: string;
  /** A link instead of an in-place action. */
  to?: string;
  done?: string;
}

const payReviewText = {
  people: formatInt(payReviews.people.value),
  months: formatInt(payReviews.monthsWithoutChange.value),
};

const newHireText = { people: formatInt(newHires.people.value), start: newHires.start };

export const agentActions: AgentAction[] = [
  {
    key: 'find',
    title: fill('Find candidates for {role}, {site}', { role: roleProfile.title, site: roleProfile.site }),
    why: fill(
      'Your legal count is {counted}, {short} short of the {required} you need at the {checkpoint} checkpoint. Your {role} Role Profile is approved, and {available} people are available for it now.',
      {
        counted: formatInt(legalCount.counted.value),
        short: formatInt(shortBy),
        required: formatInt(legalCount.required.value),
        checkpoint: legalCount.checkpoint,
        role: roleProfile.title,
        available: formatInt(availableTotal),
      },
    ),
    primary: 'Open Talent Discovery',
    to: '/employer/discovery',
  },
  {
    key: 'pay',
    title: fill('Schedule pay reviews for {people} Emiratis with no change in {months} months', payReviewText),
    why: fill(
      '{part} is the lowest part of your quality score, at {score} of {max}. Reviews for these {people} people are the fastest route to band A.',
      { part: lowestPart.label, score: formatInt(lowestPart.score.value), max: formatInt(qualityScaleMax), people: payReviewText.people },
    ),
    primary: 'Schedule reviews',
    done: fill('Review tasks sent to the line managers of these {people} people. Any pay change stays your decision.', payReviewText),
  },
  {
    key: 'buddy',
    title: fill('Assign buddies to {people} new hires starting {start}', newHireText),
    why: 'Neither new hire has a buddy yet. Your onboarding plan asks for one from the first day.',
    primary: 'Assign buddies',
    done: fill('Buddy requests sent to both team leads. Each confirms a name before {start}.', newHireText),
  },
];

export const dashboardCopy = {
  eyebrow: 'Employer dashboard',
  greeting: 'Good morning, {name}',
  lead: 'Your Emiratisation position, people and actions for this week · {date}',
  kpiHeading: 'Where you stand',
  tiles: {
    legal: {
      label: 'Legal count',
      unit: fill('of {required}', { required: formatInt(legalCount.required.value) }),
      short: fill('{short} short', { short: formatInt(shortBy) }),
      sub: fill('Tenure-weighted {weighted}, for planning', { weighted: formatNumber(legalCount.weighted.value, 1) }),
    },
    contribution: {
      label: 'Contribution if nothing changes',
      unit: '/ month',
      sub: fill('From {from}', { from: contribution.from }),
      badge: 'Avoidable',
    },
    retention: {
      label: '12-month retention',
      sub: 'Sector {sector}',
      badge: 'Above sector',
    },
    eqs: {
      label: 'Employer Quality Score (EQS)',
      sub: 'Out of 100, from six weighted parts',
    },
    reports: {
      label: 'Monthly reports due',
      sub: 'Managers by 7 Nov · you attest by 10 Nov · about 2 min each',
      link: 'Open the monthly report',
    },
  },
  tenure: {
    summary: fill('How the tenure-weighted {weighted} is worked out', { weighted: formatNumber(legalCount.weighted.value, 1) }),
    rule: fill(
      'Each Emirati counts once in your legal count of {counted}. For planning, each one also carries a weight for completed months in the current job: {rule}.',
      { counted: formatInt(legalCount.counted.value), rule: tenureRuleText },
    ),
    why: 'A count that rests on recent hires is less settled, and the weighted figure shows that early. It is never used for the legal count or for a contribution.',
    caption: fill('Tenure weighting for your {counted} Emiratis', { counted: formatInt(legalCount.counted.value) }),
    columns: { band: 'Completed months in the job', weight: 'Weight', people: 'Emiratis', countsAs: 'Counts as' },
    total: 'Total',
  },
  actions: {
    heading: "This week's actions",
    suggestedBy: 'Suggested by your',
    decide: 'you decide',
    whyLabel: 'Why:',
    notNow: 'Not now',
    dismissed: 'Hidden until next week.',
    undo: 'Undo',
  },
  pipeline: {
    title: 'Hiring pipeline · last 90 days',
    ariaLabel: fill(
      'Hiring pipeline over the last 90 days: {sent} Introduction Requests sent, {accepted} accepted, {interviewed} interviewed, {offers} offers made and {hired} hired.',
      {
        sent: stageValue('sent'),
        accepted: stageValue('accepted'),
        interviewed: stageValue('interviewed'),
        offers: stageValue('offers'),
        hired: stageValue('hired'),
      },
    ),
    footnote: "Your Introduction Requests through NAFIS. A candidate's name appears only after they accept.",
    table: { stage: 'Stage', people: 'People' },
  },
  team: {
    heading: 'Your Emirati team',
    shown: fill('Showing {shown} of your {total} Emiratis', {
      shown: formatInt(teamRows.length),
      total: formatInt(legalCount.counted.value),
    }),
    columns: {
      name: 'Name',
      role: 'Role',
      licence: 'Licence',
      tenure: 'Tenure',
      training: 'Training this quarter',
      report: 'Monthly report, October',
      next: 'Next step',
    },
    hours: '{hours} h',
    openReport: 'Open report',
    openReportFor: 'for {name}',
    tableRegion: 'Emirati team table',
    nextBy: 'Next steps suggested by your',
    nextDecide: 'you decide',
    footnote: 'Records you already hold. NAFIS never shows employers a risk score or a prediction about a person.',
  },
  quality: {
    title: 'What moves your quality score',
    subtitle: 'Six parts, each out of 100. Each weight times its result, added up, gives your score of {score}.',
    ariaLabel: fill('Quality score parts, each out of 100, where {lowest} is the lowest: {parts}.', {
      parts: listWithAnd(qualityParts.map((p) => `${p.label} ${formatInt(p.score.value)}`)),
      lowest: lowestPart.label,
    }),
    weight: 'weight {weight}%',
    lowest: 'Lowest',
    barName: '{label}, weight {weight}%: {score} out of 100',
    barNameLowest: '{label}, weight {weight}%: {score} out of 100, the lowest part',
    tooltipLowest: '{label} · lowest part',
    points: 'points towards your score',
    table: { part: 'Part', weight: 'Weight', result: 'Out of 100', points: 'Points' },
    percent: '{value}%',
    totalRow: 'Total',
    note: fill('Fastest route to A (80+, plus a passed verification sample): pay reviews for the {people} people above.', payReviewText),
  },
  money: {
    heading: 'Compliance and money',
    owed: 'Contributions owed',
    support: 'NAFIS support paid to your Emiratis, 2026 to date',
    club: 'Partners Club',
    checkpoint: 'Next checkpoint',
    note: 'NAFIS support is paid to each Emirati, not to the company.',
  },
};

/* ------------------------------------------------------------------ */
/* Talent Discovery                                                    */
/* ------------------------------------------------------------------ */

export interface TalentCard {
  code: string;
  group: AvailabilityKey;
  availability: string;
  background: string;
  /** Verified Skills Passport levels (1 to 5) and language level. */
  skills: string[];
  fit: FitTier;
  terms: string;
  termsNote?: string;
  gap: string;
  why: string;
  status: DataStatus;
}

/** Ranked by verified skill fit and terms match only. Never by predicted survival. */
export const talentCards: TalentCard[] = [
  {
    code: 'A-7F3K',
    group: 'graduating',
    availability: 'Graduates Dec 2026',
    background: 'BSc Accounting, final year',
    skills: ['Financial reporting 3', 'Excel 4', 'Data analysis 3', 'English C1'],
    fit: 'Strong',
    terms: 'Pay, hours and site',
    gap: 'forecasting',
    why: 'Meets all 3 must-haves and 5 of 6 should-haves, finished an IFRS course; the site is within their stated travel limit.',
    status: 'sample',
  },
  {
    code: 'B-2Q9M',
    group: 'looking',
    availability: 'Available now',
    background: 'BBA Finance 2025, 4-month audit internship',
    skills: ['Financial reporting 3', 'Excel 3', 'Business writing 3', 'English B2'],
    fit: 'Strong',
    terms: 'Pay, hours and site',
    gap: 'Power BI',
    why: 'Meets all 3 must-haves and 5 of 6 should-haves; the audit internship included month-end reconciliations.',
    status: 'sample',
  },
  {
    code: 'C-8L1T',
    group: 'returning',
    availability: 'Returning Jan 2027',
    background: '6 years as an accountant before a career break',
    skills: ['Financial reporting 4', 'Excel 3', 'Payroll 3', 'English B2'],
    fit: 'Good',
    terms: 'Pay and site',
    termsNote: 'Hours: prefers 8:00–15:00',
    gap: 'newer ERP tools',
    why: 'Meets all 3 must-haves and 4 of 6 should-haves, with 6 years of reporting work. Prefers 8:00–15:00, so the hours need a conversation.',
    status: 'sample',
  },
  {
    code: 'D-5R7W',
    group: 'moving',
    availability: 'Open to move',
    background: 'Accountant for 2 years at another employer',
    skills: ['Financial reporting 3', 'Excel 4', 'VAT returns 3', 'English B2'],
    fit: 'Good',
    terms: 'Step-up pay met; hours and site',
    gap: 'forecasting',
    why: 'Meets all 3 must-haves and 4 of 6 should-haves. As a move between employers, this hire earns no hiring incentive and counts from the new-hire weight.',
    status: 'sample',
  },
];

export const introductions = {
  perMonth: fig(8, 'sample'),
};

export const discoveryCopy = {
  title: 'Talent Discovery',
  intro:
    'Emiratis who are available now and chose to be visible, ranked for your role by verified skill fit and how well your terms match what each person asked for.',
  role: {
    eyebrow: 'Role Profile',
    heading: '{title} · {site}',
    pay: 'Pay',
    payUnit: 'a month',
    hours: 'Hours',
    start: 'Start',
    mustHaves: 'Must-haves',
  },
  filters: {
    heading: 'Filters',
    legend: 'Availability',
    count: '{count} available',
    travel: 'Only people whose own travel limit covers Sharjah HQ are shown.',
    notFilters:
      'Not available as filters: sex, age, disability, family name, emirate of origin, university name or photo. The ranking is audited every quarter for unequal outcomes.',
  },
  results: {
    heading: '{count} available · best fit first',
    emptyHeading: '{count} available',
    showing: 'Showing {shown} of {count}. Filters change which cards show, never the order.',
    none: 'No cards match. Tick at least one availability group.',
    anonymous: 'Talent Cards stay anonymous until the person accepts your Introduction Request.',
    rankNote: 'Ranked by verified skill fit and terms match only. The ranking never uses a prediction of how long someone will stay.',
  },
  card: {
    eyebrow: 'Talent Card',
    skills: 'Verified skills',
    fit: 'Fit',
    terms: 'Terms match',
    gap: 'Gap',
    why: 'Why:',
    write: 'Write a request',
    view: 'View request',
    selected: 'Selected',
    sent: 'Request sent',
  },
  request: {
    heading: 'Introduction Request',
    to: 'To candidate {code}',
    role: 'Role',
    roleValue: '{title} · {site}',
    roleHint: 'From your Role Profile. It cannot be changed here.',
    pay: 'Pay range, AED a month',
    required: '(required)',
    payHint: 'The candidate sees the pay range first.',
    payFrom: 'From',
    payTo: 'To',
    hours: 'Hours and location',
    hoursValue: '{hours} · {site}',
    message: 'Message',
    messageDraft:
      'We would like to talk with you about our {title} role at {site}. Your verified skills meet what the role needs, and we would support you in learning {gap}.',
    draftedBy: 'Message drafted by',
    draftedDecide: 'you decide what to send',
    coachNote: 'Their Coach shows them your quality score ({band}) and 12-month retention ({retention}).',
    send: 'Send request',
    sent: 'Sent. Their Coach Agent will show it to them within 24 hours. You will see their name only if they accept.',
    notSent: 'Not sent. {reason}',
    counter: '{left} of {total} introductions left this month for this opening',
    noneLeft: 'No introductions left this month for this opening.',
    footnote: 'Requests without a pay range cannot be sent. Each person can hold at most 5 open requests, so yours may queue for a week.',
    payMissing: 'Add both ends of the pay range. Requests without a pay range cannot be sent.',
    payNumbers: 'Write the pay range in numbers, for example 9,500.',
    payOrder: 'The first figure is higher than the second. Check the pay range.',
    choose: 'Choose a Talent Card to write a request.',
    hidden: 'The selected card is hidden by your filters. Choose a card to write a request.',
  },
};

/* ------------------------------------------------------------------ */
/* Company Monthly Report                                              */
/* ------------------------------------------------------------------ */

export type RatingValue = 'well-below' | 'below' | 'meets' | 'above' | 'well-above';

export const monthlyReport = {
  person: people.rashid,
  position: 1,
  total: reportsDue,
  pay: fig(10200, 'sample'),
  daysPresent: fig(19, 'sample'),
  workingDays: fig(21, 'sample'),
  trainingHours: fig(4, 'sample'),
  pension: fig('Active', 'sample'),
  tasks: [
    { id: 'variance', label: 'Monthly variance report' },
    { id: 'reconciliations', label: 'Supplier reconciliations' },
    { id: 'budget', label: 'Budget model update' },
    { id: 'board', label: 'Board pack support' },
    { id: 'adhoc', label: 'Ad-hoc data requests' },
  ],
  ratings: [
    { value: 'well-below', label: 'Well below' },
    { value: 'below', label: 'Below' },
    { value: 'meets', label: 'Meets' },
    { value: 'above', label: 'Above' },
    { value: 'well-above', label: 'Well above' },
  ] as Array<{ value: RatingValue; label: string }>,
  defaultRating: 'above' as RatingValue,
  /** Only these two ratings need a line of evidence. */
  extremes: ['well-below', 'well-above'] as RatingValue[],
  evidenceMaxLength: 160,
};

export const reportCopy = {
  position: 'Report {n} of {total} this month',
  title: 'Monthly report · {month}',
  subject: '{name} · {role} · {site} · about 2 minutes',
  formHeading: 'Your answers',
  prefilled: {
    heading: 'Already filled in for you',
    lead: 'From your payroll and HR systems. To correct a value, fix it at the source.',
    pay: 'Pay',
    paySource: 'Payroll; no change since May',
    days: 'Days present',
    daysValue: '{present} of {total}',
    daysSource: 'HR system, with his consent',
    training: 'Training recorded',
    trainingValue: '{hours} h',
    trainingSource: 'IFRS 16 module',
    pension: 'Pension registration',
    pensionSource: 'Pension records',
  },
  tasks: {
    legend: '1 · Main tasks this month',
    hint: 'Choose every task that took real time this month.',
    add: 'Add a task',
    addLabel: 'New task',
    addConfirm: 'Add',
    addCancel: 'Cancel',
    addEmpty: 'Type the task first.',
    error: 'Choose at least one main task.',
  },
  performance: {
    legend: '2 · How is {first} performing against what you expect at this stage?',
    hint: 'One rating. A line of evidence is needed only for well below or well above.',
    evidence: 'One line of evidence',
    evidenceHint: '{first} sees this line with the rest of the report.',
    evidenceError: 'Well below or well above needs one line of evidence.',
  },
  raise: {
    legend: '3 · Anything to raise?',
    note: 'Note',
    noteHint: 'HR, NAFIS and {first} see any note you write.',
    counsellor: "Ask a NAFIS counsellor to contact me about {first}'s development",
  },
  submit: 'Submit report',
  save: 'Save draft',
  edit: 'Edit report',
  submitted: 'Submitted. {hr}, your HR Admin, attests it by 10 Nov. You can edit it until then.',
  draftSaved: 'Draft saved. Finish it by 7 Nov.',
  notSubmitted: 'Not submitted yet. Fix the marked questions first.',
  footnote:
    '{first} sees this report, including any note, within 2 working days after HR attests it, and can reply. NAFIS compares it with his Monthly Pulse and his Alignment Check. A large gap leads to a conversation with a counsellor, never to an automatic penalty.',
};
