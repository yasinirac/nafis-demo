import { fill, formatAEDRange, formatNumber, formatPct } from '@/lib/format';
import { fig, type DataStatus, type Figure, type Tone } from './types';

/**
 * Contributor Portal: graduate outcomes for one programme at Gulf Coast
 * University (fictional), College of Business. Aggregates only (T1). Every
 * figure is fictional sample data. The small-group rule lives here, so the
 * screen and the Graduate outcomes API sample hide the same groups.
 */

export type ClassYear = '2023' | '2024' | '2025';

export const classYears: ClassYear[] = ['2023', '2024', '2025'];

export const defaultClass: ClassYear = '2024';

export interface Programme {
  id: string;
  label: string;
  /** Only BSc Accounting has sample data in this concept. */
  hasData: boolean;
}

export const programmes: Programme[] = [
  { id: 'bsc-accounting', label: 'BSc Accounting', hasData: true },
  { id: 'bba-finance', label: 'BBA Finance', hasData: false },
  { id: 'bsc-business-analytics', label: 'BSc Business Analytics', hasData: false },
];

export const destinationLabels = [
  'In skilled private work',
  'Other private work',
  'Government job',
  'Further study',
  'Looking for work',
  'Not known',
] as const;

export const skillGapLabels = [
  'Power BI and dashboards',
  'Financial modelling',
  'Leases (IFRS 16)',
  'Business writing, English',
  'Business writing, Arabic',
] as const;

export interface ClassOutcomes {
  year: ClassYear;
  graduates: Figure<number>;
  /** Share in skilled private work 12 months after graduation, in percent. */
  skilledAt12: Figure<number>;
  /** The same share for accounting programmes nationally, in percent. */
  nationalAccounting: Figure<number>;
  medianMonthsToSkilledJob: Figure<number>;
  /** Middle half of first monthly pay, in AED. */
  startingPay: Figure<{ min: number; max: number }>;
  /** Share still with their first employer at 12 months, in percent. */
  stillWithFirstEmployer: Figure<number>;
  /** Shares in destinationLabels order, in percent. */
  destinations: Figure<number[]>;
  /** Shares rated below the level their job needs, in skillGapLabels order, in percent. */
  skillGaps: Figure<number[]>;
}

function outcomes(
  year: ClassYear,
  graduates: number,
  skilled: number,
  national: number,
  months: number,
  pay: [number, number],
  stay: number,
  destinations: number[],
  skillGaps: number[],
): ClassOutcomes {
  return {
    year,
    graduates: fig(graduates, 'sample'),
    skilledAt12: fig(skilled, 'sample'),
    nationalAccounting: fig(national, 'sample'),
    medianMonthsToSkilledJob: fig(months, 'sample'),
    startingPay: fig({ min: pay[0], max: pay[1] }, 'sample'),
    stillWithFirstEmployer: fig(stay, 'sample'),
    destinations: fig(destinations, 'sample'),
    skillGaps: fig(skillGaps, 'sample'),
  };
}

export const classOutcomes: Record<ClassYear, ClassOutcomes> = {
  '2023': outcomes('2023', 128, 57, 55, 5.1, [8500, 10000], 79, [57, 8, 12, 7, 11, 5], [51, 42, 35, 25, 20]),
  '2024': outcomes('2024', 142, 61, 58, 4.2, [9000, 10500], 84, [61, 7, 11, 6, 11, 4], [44, 38, 31, 22, 18]),
  '2025': outcomes('2025', 151, 64, 60, 3.6, [9500, 11000], 86, [64, 6, 10, 8, 9, 3], [39, 33, 24, 21, 17]),
};

export function previousClass(year: ClassYear): ClassYear | null {
  const i = classYears.indexOf(year);
  return i > 0 ? (classYears[i - 1] ?? null) : null;
}

/** Disclosure rules for institutions. */
export const universityRules = {
  /** A destination group with fewer people than this shows as "—". */
  minGroup: fig(10, 'illustrative'),
  /** Skill gaps are shown only when at least this many graduates were rated. */
  minRated: fig(25, 'illustrative'),
  /** The skill-gap scale runs from 0 to this share, in percent. */
  skillScaleMax: 60,
};

export interface DestinationGroup {
  key: string;
  label: string;
  share: number;
  /** People in the group: share times graduates, rounded. Never shown. */
  people: number;
  hidden: boolean;
  /** 'small' when under the threshold; 'pair' when hidden so a lone small group cannot be worked out. */
  reason?: 'small' | 'pair';
}

/**
 * Applies the small-group rule: a group under 10 people is hidden, and if
 * only one group would be hidden, the next smallest is hidden as well, so no
 * group can be worked out from the others.
 */
export function destinationsFor(year: ClassYear): DestinationGroup[] {
  const c = classOutcomes[year];
  const grads = c.graduates.value;
  const groups: DestinationGroup[] = destinationLabels.map((label, i) => {
    const share = c.destinations.value[i] ?? 0;
    const people = Math.round((share / 100) * grads);
    const small = people < universityRules.minGroup.value;
    return { key: `group-${i}`, label, share, people, hidden: small, reason: small ? 'small' : undefined };
  });
  if (groups.filter((g) => g.hidden).length === 1) {
    const next = groups.filter((g) => !g.hidden).sort((a, b) => a.people - b.people)[0];
    if (next) {
      next.hidden = true;
      next.reason = 'pair';
    }
  }
  return groups;
}

export function hiddenGroupCount(year: ClassYear): number {
  return destinationsFor(year).filter((g) => g.hidden).length;
}

/**
 * Graduates whose managers rated them at day 90: those in private work.
 * Used only to apply the 25-graduate rule; never shown, because it could
 * reveal a hidden group.
 */
export function ratedGraduates(year: ClassYear): number {
  return destinationsFor(year)
    .slice(0, 2)
    .reduce((sum, g) => sum + g.people, 0);
}

export function skillGapsShown(year: ClassYear): boolean {
  return ratedGraduates(year) >= universityRules.minRated.value;
}

export interface Suggestion {
  id: string;
  title: string;
  why: string;
  evidence: string;
  confidence: 'High' | 'Medium' | 'Low';
}

/** Suggestions drafted by the Contributor Assistant for the selected class. */
export function suggestionsFor(year: ClassYear): Suggestion[] {
  const c = classOutcomes[year];
  const gaps = c.skillGaps.value;
  const powerBi = gaps[0] ?? 0;
  const leases = gaps[2] ?? 0;
  const largest = powerBi >= Math.max(...gaps);
  return [
    {
      id: 'power-bi',
      title: 'Add a Power BI lab to the management accounting course',
      why: fill('{n} of rated graduates from the class of {year} were short on Power BI and dashboards{largest}.', {
        n: formatPct(powerBi),
        year,
        largest: largest ? ', the largest of the five gaps' : '',
      }),
      evidence: fill("Evidence: managers' day-90 ratings (E4) for the class of {year}", { year }),
      confidence: 'Medium',
    },
    {
      id: 'ifrs-16',
      title: 'Teach IFRS 16 leases in the final-year reporting course',
      why: fill('{n} were short on lease accounting. Employers list it in their Finance Analyst Role Profiles.', {
        n: formatPct(leases),
      }),
      evidence: fill("Evidence: lease skills in employers' Role Profiles and day-90 ratings for the class of {year}", { year }),
      confidence: 'Medium',
    },
    {
      id: 'internship',
      title: 'Keep the internship term',
      why: 'Graduates who did the internship term found a skilled job sooner than those who did not.',
      evidence: 'Evidence: internship records matched to outcomes · an association, not proof of cause',
      confidence: 'Low',
    },
  ];
}

export interface Feed {
  id: 'students' | 'transcripts' | 'internships' | 'mapping';
  name: string;
  detail: string;
  status: { label: string; tone: Tone };
}

const transcriptConsent = { consented: fig(118, 'sample'), students: fig(142, 'sample') };

/** Every count in the feed list is sample data. */
export const feedsStatus: DataStatus = transcriptConsent.consented.status;
const mappedCourses = fig(46, 'sample');

/** Internship records the university sent whose employer NAFIS could not match. */
export const unmatchedInternships = [
  { id: 'INT-25-0147', term: 'Summer 2025 internship' },
  { id: 'INT-25-0152', term: 'Summer 2025 internship' },
  { id: 'INT-26-0009', term: 'Spring 2026 internship' },
];

export const feeds: Feed[] = [
  {
    id: 'students',
    name: 'Final-year student list',
    detail: 'Due 15 Jan 2027',
    status: { label: 'Not yet due', tone: 'neutral' },
  },
  {
    id: 'transcripts',
    name: 'Transcripts, with consent',
    detail: fill('{a} of {b} students consented', { a: transcriptConsent.consented.value, b: transcriptConsent.students.value }),
    status: { label: 'Up to date', tone: 'good' },
  },
  {
    id: 'internships',
    name: 'Internship records',
    detail: fill('{n} records have an unknown employer', { n: unmatchedInternships.length }),
    status: { label: 'Up to date', tone: 'good' },
  },
  {
    id: 'mapping',
    name: 'Course-to-skill mapping',
    detail: fill('{n} courses mapped to skills', { n: mappedCourses.value }),
    status: { label: 'Up to date', tone: 'good' },
  },
];

export const universityCopy = {
  title: 'Programme outcomes',
  lead: 'What happened to your Emirati graduates, from verified payroll, pension and permit records rather than surveys. Counts and shares only.',
  filters: {
    label: 'Filters',
    programme: 'Programme',
    classLegend: 'Class of',
    followed: 'Followed for 12 months after graduation · data to September 2026',
  },
  noData: {
    title: 'No sample data for {programme}',
    body: 'This concept has sample outcomes for BSc Accounting only.',
    action: 'Show BSc Accounting',
  },
  classHeading: '{programme} · class of {year}',
  tiles: {
    graduates: 'Emirati graduates',
    graduatesSub: 'Graduated in {year}',
    skilled: 'In skilled private work at 12 months',
    national: 'Accounting programmes nationally: {n}',
    months: 'Median months to first skilled job',
    monthsUnit: 'months',
    pay: 'Typical starting pay',
    payUnit: 'a month',
    paySub: 'Middle half of first monthly pay',
    stay: 'Still with first employer at 12 months',
    deltaPoints: '{sign}{n} points on the class of {prev}',
    deltaSame: 'Same as the class of {prev}',
    deltaSooner: '{n} months sooner than the class of {prev}',
    deltaLater: '{n} months later than the class of {prev}',
    noPrevious: 'No earlier class in this view',
  },
  destinations: {
    title: 'Where they are 12 months on',
    subtitle: 'Share of the {n} graduates in the class of {year}',
    groupColumn: 'Group',
    shareColumn: 'Share',
    hiddenCell: '— hidden',
    note: fill('— hidden: fewer than {min} people. At least two groups are always hidden together.', {
      min: universityRules.minGroup.value,
    }),
    ariaLabel: 'Bar chart of where the class of {year} is 12 months after graduation: {list}.',
    hiddenAria: '{label} hidden',
  },
  skills: {
    title: 'Skills employers say are short',
    subtitle: fill('Share of rated graduates in the class of {year} below the level their job needs · scale 0–{max}%', {
      year: '{year}',
      max: universityRules.skillScaleMax,
    }),
    skillColumn: 'Skill',
    shareColumn: 'Share rated short',
    note: fill(
      "From managers' day-90 new-hire ratings (E4) and the skill levels in employers' Role Profiles; shown for {min} or more graduates.",
      { min: universityRules.minRated.value },
    ),
    notShown: fill('Not shown: fewer than {min} graduates of this class were rated.', { min: universityRules.minRated.value }),
    ariaLabel: 'Bar chart of skills employers say are short for the class of {year}: {list}.',
  },
  suggestions: {
    title: 'Suggestions for your faculty',
    prefix: 'Drafted by the',
    decides: 'your faculty decides',
    confidence: 'Confidence: {level}',
  },
  feeds: {
    title: 'What you send to NAFIS',
    fix: 'Fix {n}',
    fixIntro: 'NAFIS could not match the employer on these records. Add the MoHRE establishment ID from the internship agreement.',
    fixField: 'Establishment ID for {id}',
    fixPlaceholder: 'For example EST-10422',
    fixed: 'Fixed',
    save: 'Save corrections',
    close: 'Close',
    error: 'Enter at least one establishment ID.',
    savedOne: 'Saved 1 correction. NAFIS matches it in the next sync.',
    savedMany: 'Saved {n} corrections. NAFIS matches them in the next sync.',
    allFixed: 'All records now have an employer. Internship records are up to date.',
    review: 'Show records',
    upToDate: 'Up to date',
    unknownOne: '1 record has an unknown employer',
    unknownMany: '{n} records have an unknown employer',
    unknownNone: 'Every record has a matched employer',
  },
  footer: "After graduation the university sees no graduate's personal record. Transcripts are shared only with each student's consent.",
};

/** Delta text in points against the previous class, or a note when there is none. */
export function pointsDelta(current: number, previous: number | null, prev: ClassYear | null): string {
  if (previous == null || prev == null) return universityCopy.tiles.noPrevious;
  const d = current - previous;
  if (d === 0) return fill(universityCopy.tiles.deltaSame, { prev });
  return fill(universityCopy.tiles.deltaPoints, { sign: d > 0 ? '+' : '−', n: Math.abs(d), prev });
}

/** Delta text in months against the previous class (fewer months is sooner). */
export function monthsDelta(current: number, previous: number | null, prev: ClassYear | null): string {
  if (previous == null || prev == null) return universityCopy.tiles.noPrevious;
  const d = Math.round((current - previous) * 10) / 10;
  if (d === 0) return fill(universityCopy.tiles.deltaSame, { prev });
  return fill(d < 0 ? universityCopy.tiles.deltaSooner : universityCopy.tiles.deltaLater, {
    n: formatNumber(Math.abs(d), 1),
    prev,
  });
}

export function payRange(year: ClassYear): string {
  const p = classOutcomes[year].startingPay.value;
  return formatAEDRange(p.min, p.max);
}
