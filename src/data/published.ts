import { fig, type Figure } from './types';

/**
 * Published figures. These are the only real-world numbers in the demo.
 * Values and dates come from the build brief; see README "What is real".
 */

export const published = {
  privateSectorEmiratis: fig(190000, 'published', { display: '190,000+', asOf: 'July 2026' }),
  companiesEmployingEmiratis: fig(32000, 'published', { display: '32,000+', asOf: 'July 2026' }),
  nafisLaunched: { label: 'September 2021', year: 2021 },
};

export interface YearEndCount {
  year: number;
  value: number;
  /** 2023 to 2025 were published as rounded totals. */
  rounded: boolean;
  display: string;
  figure: Figure;
}

function yearEnd(year: number, value: number, rounded: boolean): YearEndCount {
  const text = new Intl.NumberFormat('en-US').format(value);
  return {
    year,
    value,
    rounded,
    display: rounded ? `about ${text}` : text,
    figure: fig(value, 'published', { asOf: `end of ${year}`, note: rounded ? 'published as a rounded total' : undefined }),
  };
}

/** Emiratis in private-sector jobs at each year end. */
export const yearEndCounts: YearEndCount[] = [
  yearEnd(2018, 27055, false),
  yearEnd(2019, 26921, false),
  yearEnd(2020, 28912, false),
  yearEnd(2021, 29810, false),
  yearEnd(2022, 50228, false),
  yearEnd(2023, 92000, true),
  yearEnd(2024, 131000, true),
  yearEnd(2025, 171000, true),
];

/** The latest month, shown as the final bar on the public chart. */
export const latestMonth = {
  label: 'July 2026',
  shortLabel: 'Jul 2026',
  value: 190000,
  display: '190,000+',
};
