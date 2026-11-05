import { fig, type Figure } from './types';
import { latestMonth, yearEndCounts } from './published';
import { fill, formatInt } from '@/lib/format';

/**
 * Executive history-and-forecast series, 2016 to 2031, for the Command Centre.
 * Status follows the brief: only the 2018–2025 year-end counts of Emiratis in
 * private jobs are published (taken from published.ts, never retyped); every
 * other value, including the 2026 nowcast and the forecast, is a model estimate.
 */

export type HistoryKind = 'published' | 'estimate' | 'nowcast';

export interface HistoryPoint {
  year: number;
  figure: Figure;
  kind: HistoryKind;
  /** Text for tables and tooltips, for example "about 92,000". */
  display: string;
}

export interface ForecastPoint {
  year: number;
  central: Figure;
  low: Figure;
  high: Figure;
  /** What the quota would need if it rises 1 point a year (first series only). */
  quotaNeed?: Figure;
}

export type ExecSeriesId = 'private' | 'rse';

export interface ExecSeries {
  id: ExecSeriesId;
  /** Label on the series switch. */
  switchLabel: string;
  title: string;
  /** Legend label for the counted or estimated history line. */
  historyLabel: string;
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  ariaLabel: string;
  caption: string;
}

export const kindLabels: Record<HistoryKind, string> = {
  published: 'Published',
  estimate: 'Estimate',
  nowcast: 'Nowcast (estimate)',
};

function est(year: number, value: number, kind: HistoryKind = 'estimate'): HistoryPoint {
  const asOf = kind === 'nowcast' ? `${year} nowcast` : String(year);
  return { year, figure: fig(value, 'estimate', { asOf }), kind, display: formatInt(value) };
}

function forecastRows(central: number[], low: number[], high: number[], quotaNeed?: number[]): ForecastPoint[] {
  return central.map((c, i) => ({
    year: forecastYears[i] as number,
    central: fig(c, 'estimate'),
    low: fig(low[i] as number, 'estimate'),
    high: fig(high[i] as number, 'estimate'),
    quotaNeed: quotaNeed ? fig(quotaNeed[i] as number, 'estimate') : undefined,
  }));
}

export const forecastYears = [2027, 2028, 2029, 2030, 2031];
export const nowcastYear = 2026;
export const firstYear = 2016;
export const lastYear = 2031;
export const chartYears = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
/** Axis labels every five years: the start, the NAFIS launch year, the nowcast and the end. */
export const chartTicks = [2016, 2021, 2026, 2031];

const privateHistory: HistoryPoint[] = [
  est(2016, 25700),
  est(2017, 26400),
  ...yearEndCounts.map((c) => ({ year: c.year, figure: c.figure, kind: 'published' as const, display: c.display })),
  est(2026, 208000, 'nowcast'),
];

const privateForecast = forecastRows(
  [234400, 256000, 273400, 287900, 300400],
  [212200, 216400, 220700, 223000, 223400],
  [249800, 285800, 317200, 345000, 370200],
  [235700, 264800, 295500, 327700, 361700],
);

const rseHistory: HistoryPoint[] = [
  est(2016, 17400),
  est(2017, 17900),
  est(2018, 18400),
  est(2019, 18300),
  est(2020, 19600),
  est(2021, 20200),
  est(2022, 19000),
  est(2023, 20800),
  est(2024, 35000),
  est(2025, 64300),
  est(2026, 92100, 'nowcast'),
];

const rseForecast = forecastRows(
  [120600, 147000, 166000, 181500, 194100],
  [114800, 140100, 143900, 147000, 149900],
  [125500, 153100, 184100, 211000, 234500],
);

function lastOf<T>(list: T[]): T {
  return list[list.length - 1] as T;
}

function valueIn(history: HistoryPoint[], year: number): number {
  return history.find((p) => p.year === year)?.figure.value ?? 0;
}

const privateEnd = lastOf(privateForecast);
const rseEnd = lastOf(rseForecast);

/** The quota gap by 2031: what the quota would need minus the central forecast. */
export const quotaGap2031 = (privateEnd.quotaNeed?.value ?? 0) - privateEnd.central.value;

export const execSeries: Record<ExecSeriesId, ExecSeries> = {
  private: {
    id: 'private',
    switchLabel: 'All Emiratis in private jobs',
    title: fill('Emiratis in private-sector jobs, {from} to {to}', { from: firstYear, to: lastYear }),
    historyLabel: 'Emiratis in private jobs',
    history: privateHistory,
    forecast: privateForecast,
    ariaLabel: fill(
      'Emiratis in private-sector jobs rose from about {start} in {from} to a nowcast of {now} in {nowYear}, and the central forecast reaches {end} in {to}, about {gap} short of what the quota would need.',
      {
        start: formatInt(valueIn(privateHistory, firstYear)),
        from: firstYear,
        now: formatInt(valueIn(privateHistory, nowcastYear)),
        nowYear: nowcastYear,
        end: formatInt(privateEnd.central.value),
        to: lastYear,
        gap: formatInt(quotaGap2031),
      },
    ),
    caption: fill(
      'By {to} the quota would need about {gap} more Emiratis than the central forecast supplies. “Quota would need” assumes the quota rises 1 point a year. 2018 to 2025 are published year-end counts; 2023 to 2025 were published as rounded totals. 2016 and 2017 are back-cast estimates. {nowYear} is a year-end nowcast; {latest} was published for {latestLabel}. The forecast and its low–high range are model estimates.',
      {
        to: lastYear,
        gap: formatInt(quotaGap2031),
        nowYear: nowcastYear,
        latest: latestMonth.display,
        latestLabel: latestMonth.label,
      },
    ),
  },
  rse: {
    id: 'rse',
    switchLabel: 'Retained Skilled Emiratis',
    title: fill('Retained Skilled Emiratis, {from} to {to}', { from: firstYear, to: lastYear }),
    historyLabel: 'Retained Skilled Emiratis',
    history: rseHistory,
    forecast: rseForecast,
    ariaLabel: fill(
      'Retained Skilled Emiratis rose from about {start} in {from} to a nowcast of {now} in {nowYear}, and the central forecast reaches {end} in {to}, within a range of {low} to {high}.',
      {
        start: formatInt(valueIn(rseHistory, firstYear)),
        from: firstYear,
        now: formatInt(valueIn(rseHistory, nowcastYear)),
        nowYear: nowcastYear,
        end: formatInt(rseEnd.central.value),
        to: lastYear,
        low: formatInt(rseEnd.low.value),
        high: formatInt(rseEnd.high.value),
      },
    ),
    caption: fill(
      'Retained Skilled Emiratis counts people with 24 or more verified skilled months in a row. The whole series is a model estimate from payroll, pension and work permit records, and {nowYear} is a nowcast. Growth since 2024 reflects the 2022 and 2023 hiring wave reaching 24 months.',
      { nowYear: nowcastYear },
    ),
  },
};

export const seriesOrder: ExecSeriesId[] = ['private', 'rse'];

export const chartCopy = {
  zoneLabel: 'Forecast',
  centralLabel: 'Central forecast',
  bandLabel: 'Low to high range',
  rangeShort: 'Range',
  quotaLabel: 'Quota would need',
  forecastWord: 'forecast',
  estimateMarkerLabel: 'Estimate or nowcast (hollow marker)',
  switchLegend: 'Series shown in the chart',
  subtitlePublished: 'year-end counts, 2018 to 2025',
  subtitleEstimate: 'other years, the nowcast and the forecast',
  subtitleRse: 'every value is a model estimate',
  tableColumns: {
    year: 'Year',
    value: 'Value',
    type: 'Type',
    range: 'Low to high range',
    quota: 'Quota would need',
  },
  forecastType: 'Forecast (estimate)',
};
