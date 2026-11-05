import { disclosureRules } from './disclosure';
import { fig, statusLabels, type DataStatus } from './types';
import { latestMonth, published, yearEndCounts } from './published';
import { fill, formatInt, formatPct } from '@/lib/format';

/**
 * Public statistics page (T0, anyone, no sign-in). The counts come from
 * published.ts; the retention table and the 85% tile are illustrative and
 * say so on screen. Public tables round to the nearest 10 and hide groups
 * under 20 people.
 */

export const publicRules = { roundTo: disclosureRules.publicRoundTo.value, hideUnder: disclosureRules.publicMinCell.value };

export const publicMeta = {
  brand: 'NAFIS · Public statistics',
  eyebrow: 'Public statistics · concept',
  title: 'Emiratisation statistics',
  lead: 'Published counts with their dates, and illustrative tables that show how this service would report. Nothing about any individual is published.',
  navLabel: 'Statistics sections',
  noticeLabel: 'Concept notice and demo role switcher',
  arabicControl: 'العربية',
  arabicNote: 'The Arabic edition is planned. It is not built in this demo.',
  arabicNoteAr: 'النسخة العربية مخطَّط لها، ولم تُنفَّذ في هذا العرض التوضيحي.',
  footer: 'Figures tagged Published are published numbers with their dates. All other figures on this page are illustrative.',
};

export const publicNav = [
  { id: 'overview', label: 'Overview' },
  { id: 'sectors', label: 'Sectors' },
  { id: 'emirates', label: 'Emirates' },
  { id: 'how-we-count', label: 'How we count' },
  { id: 'downloads', label: 'Downloads' },
];

/* -------------------------------------------------------------- Headline */

const end2021 = yearEndCounts.find((c) => c.year === 2021);

export const publicHero = {
  label: 'Emiratis working in the private sector',
  value: published.privateSectorEmiratis.display ?? formatInt(published.privateSectorEmiratis.value),
  status: published.privateSectorEmiratis.status,
  context: fill('{asOf} · up from {v2021} at the end of {y2021}', {
    asOf: published.privateSectorEmiratis.asOf ?? '',
    v2021: end2021?.display ?? '',
    y2021: end2021?.year ?? '',
  }),
};

const skilled12Public = fig(85, 'illustrative');

export const publicTiles = [
  {
    id: 'companies',
    label: 'Companies employing Emiratis',
    value: published.companiesEmployingEmiratis.display ?? formatInt(published.companiesEmployingEmiratis.value),
    status: published.companiesEmployingEmiratis.status,
    sub: published.companiesEmployingEmiratis.asOf ?? '',
  },
  {
    id: 'skilled12',
    label: 'Still in skilled work after 12 months, 2025 hires',
    value: formatPct(skilled12Public.value),
    status: skilled12Public.status,
    sub: 'Shows how the measure would be reported',
  },
];

/* ------------------------------------------------------------ Bar chart */

export interface CountBar {
  key: string;
  label: string;
  value: number;
  valueLabel: string;
  sublabel: string;
  latest: boolean;
  status: DataStatus;
  note: string;
}

export const countBars: CountBar[] = [
  ...yearEndCounts.map((c) => ({
    key: String(c.year),
    label: String(c.year),
    value: c.value,
    valueLabel: c.display,
    sublabel: c.rounded ? 'year end, published as a rounded total' : 'year end, published',
    latest: false,
    status: c.figure.status,
    note: c.rounded ? 'Year-end count, published as a rounded total' : 'Year-end count, published',
  })),
  {
    key: 'latest',
    label: latestMonth.shortLabel,
    value: latestMonth.value,
    valueLabel: latestMonth.display,
    sublabel: 'latest published month',
    latest: true,
    status: published.privateSectorEmiratis.status,
    note: fill('Latest published month ({label}), not a year-end count', { label: latestMonth.label }),
  },
];

const firstBar = countBars[0] as CountBar;
const lastYearEnd = yearEndCounts[yearEndCounts.length - 1];

export const countsChart = {
  title: fill('Emiratis in private-sector jobs, {from} to {to}', { from: firstBar.label, to: latestMonth.label.slice(-4) }),
  ariaLabel: fill('Year-end counts rose from {first} in {firstYear} to {last} in {lastYear}, and passed {latest} in {latestLabel}.', {
    first: firstBar.valueLabel,
    firstYear: firstBar.label,
    last: lastYearEnd?.display ?? '',
    lastYear: lastYearEnd?.year ?? '',
    latest: formatInt(latestMonth.value),
    latestLabel: latestMonth.label,
  }),
  legendYearEnd: 'Year-end count',
  legendLatest: fill('Latest month, {label}', { label: latestMonth.label }),
  marker: fill('NAFIS launched, {when}', { when: published.nafisLaunched.label }),
  markerShort: fill('NAFIS launched, Sep {year}', { year: published.nafisLaunched.year }),
  /** The marker sits just after the launch year's year-end bar. */
  markerBeforeKey: String(published.nafisLaunched.year + 1),
  caption: fill(
    'Published year-end counts. 2023 to 2025 were published as rounded totals. The {year} bar is the latest published month, {label}, not a year-end count.',
    { year: latestMonth.label.slice(-4), label: latestMonth.label },
  ),
  download: 'Download CSV',
  fileName: 'emiratis-in-private-sector-jobs.csv',
  tablePeriod: 'Period',
  tableValue: 'Emiratis in private-sector jobs',
  tableNote: 'Note',
};

/* ------------------------------------------------------ Retention by sector */

export interface SectorRetentionRow {
  sector: string;
  /** Rounded to the nearest 10; null when the group is under 20 people. */
  hires: number | null;
  s12: number | null;
  low: number | null;
  high: number | null;
}

export const sectorRetention = {
  title: 'Still in skilled work after 12 months, by sector',
  subtitle: '2025 hires',
  status: 'illustrative' as DataStatus,
  columns: { sector: 'Sector', hires: '2025 hires', s12: 'Still in skilled work at 12 months', range: '90% range' },
  /** Phone-width header for the S(12) column; the card title carries the rest. */
  s12Short: 'At 12 months',
  regionLabel: 'Table of retention by sector',
  notPublished: 'not published',
  /** Shown under the sector name when its whole row is suppressed (the note below the table gives the rule). */
  rowNotPublished: 'Not published',
  note: fill('Hires are rounded to the nearest {round}. Groups under {hide} people are not published and show as —. Ranges are 90% intervals.', {
    round: publicRules.roundTo,
    hide: publicRules.hideUnder,
  }),
  rows: [
    { sector: 'Financial services', hires: 6920, s12: 84, low: 82, high: 86 },
    { sector: 'Healthcare', hires: 2240, s12: 82, low: 79, high: 85 },
    { sector: 'Technology', hires: 2960, s12: 81, low: 78, high: 84 },
    { sector: 'Logistics', hires: 4150, s12: 77, low: 75, high: 79 },
    { sector: 'Retail', hires: 7330, s12: 66, low: 64, high: 68 },
    { sector: 'Construction', hires: 2050, s12: 61, low: 58, high: 64 },
    { sector: 'Hospitality', hires: 2880, s12: 58, low: 55, high: 61 },
    { sector: 'Mining and quarrying', hires: null, s12: null, low: null, high: null },
  ] satisfies SectorRetentionRow[],
};

export function formatRange(row: SectorRetentionRow): string {
  if (row.low == null || row.high == null) return sectorRetention.notPublished;
  return `${row.low}–${formatPct(row.high)}`;
}

/* ------------------------------------------------------------- Emirates */

export const emiratesPlanned = {
  title: 'By emirate',
  status: 'Planned',
  text: fill(
    'Figures by emirate are planned for a later release. They will follow the same rules: counts rounded to the nearest {round}, and groups under {hide} people not published.',
    { round: publicRules.roundTo, hide: publicRules.hideUnder },
  ),
};

/* ---------------------------------------------------------- How we count */

export const howWeCount = {
  title: 'How we count',
  points: [
    'A person counts in a month when payroll and pension records both show a private-sector job.',
    'A move from one employer to another is not a new placement.',
    'Estimates always show a range.',
    'Nothing about any individual is published or can be requested here.',
  ],
};

/* ------------------------------------------------------ Releases and data */

export const releases = {
  title: 'Releases and data',
  nextLabel: 'Next release',
  next: 'Tuesday 15 December 2026, October figures',
  schedule: 'Figures are published 45 days after each month ends. Each release lists its revisions.',
  allTables: 'All tables (CSV)',
  allTablesFile: 'emiratisation-statistics-all-tables.csv',
  dictionary: 'Data dictionary',
  api: 'Open data API',
  report: 'Report a problem with these figures',
  reportNote:
    'Reporting is planned. In the live service a short form would go to the statistics team, and each correction would be listed with the next release.',
  downloaded: 'Downloaded {file}.',
};

export const dataDictionary = [
  {
    term: 'Emiratis in private-sector jobs',
    definition: 'Emirati citizens with a private-sector job in the month, where payroll and pension records both show the job.',
  },
  { term: 'Year-end count', definition: 'The count for December of each year.' },
  { term: 'Rounded total', definition: 'A figure published to the nearest thousand and shown with the word "about".' },
  {
    term: 'Still in skilled work after 12 months',
    definition: 'The share of people hired in a year who are still in skilled private-sector work 12 months after they started.',
  },
  { term: '90% range', definition: 'An interval expected to hold the true value 9 times in 10.' },
  {
    term: 'Not published (—)',
    definition: fill('A group under {hide} people. It is hidden so that no one can be identified.', { hide: publicRules.hideUnder }),
  },
];

/* ------------------------------------------------------------- CSV rows */

export function countsCsvRows(): string[][] {
  return [
    ['period', 'emiratis_in_private_sector_jobs', 'shown_as', 'status', 'note'],
    ...countBars.map((b) => [b.label, String(b.value), b.valueLabel, statusLabels[b.status], b.note]),
  ];
}

export function allTablesCsvRows(): string[][] {
  const rows: string[][] = [['table', 'row', 'measure', 'value', 'status', 'note']];
  countBars.forEach((b) => rows.push([countsChart.title, b.label, countsChart.tableValue, String(b.value), statusLabels[b.status], b.note]));
  sectorRetention.rows.forEach((r) => {
    const hidden = r.hires == null;
    const note = hidden ? fill('Group under {hide} people, not published', { hide: publicRules.hideUnder }) : '';
    const status = statusLabels[sectorRetention.status];
    rows.push([sectorRetention.title, r.sector, sectorRetention.columns.hires, hidden ? '' : String(r.hires), status, note]);
    rows.push([sectorRetention.title, r.sector, sectorRetention.columns.s12, r.s12 == null ? '' : formatPct(r.s12), status, note]);
    rows.push([sectorRetention.title, r.sector, sectorRetention.columns.range, hidden ? '' : formatRange(r), status, note]);
  });
  return rows;
}
