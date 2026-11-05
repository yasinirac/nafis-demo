import { useState } from 'react';
import { ChartFrame, type ChartTableSpec, type LegendItem } from '@/charts/ChartFrame';
import { LineWithBand, type BandSeries, type LineSeries } from '@/charts/LineWithBand';
import { chartColors } from '@/charts/core';
import type { TooltipRow } from '@/charts/Tooltip';
import { RadioGroup } from '@/components/RadioGroup';
import { DataTag } from '@/components/Chip';
import {
  chartCopy,
  chartTicks,
  chartYears,
  execSeries,
  kindLabels,
  nowcastYear,
  seriesOrder,
  type ExecSeries,
  type ExecSeriesId,
} from '@/data/series';
import { formatCompact, formatInt } from '@/lib/format';

function rangeText(low: number, high: number): string {
  return `${formatInt(low)}–${formatInt(high)}`;
}

function buildTable(s: ExecSeries): ChartTableSpec {
  const hasQuota = s.forecast.some((f) => f.quotaNeed);
  const columns = [
    { key: 'year', label: chartCopy.tableColumns.year },
    { key: 'value', label: chartCopy.tableColumns.value, numeric: true },
    { key: 'type', label: chartCopy.tableColumns.type },
    { key: 'range', label: chartCopy.tableColumns.range, numeric: true },
    ...(hasQuota ? [{ key: 'quota', label: chartCopy.tableColumns.quota, numeric: true }] : []),
  ];
  const rows = [
    ...s.history.map((p) => ({ year: String(p.year), value: p.display, type: kindLabels[p.kind] })),
    ...s.forecast.map((f) => ({
      year: String(f.year),
      value: formatInt(f.central.value),
      type: chartCopy.forecastType,
      range: rangeText(f.low.value, f.high.value),
      quota: f.quotaNeed ? formatInt(f.quotaNeed.value) : undefined,
    })),
  ];
  return { columns, rows, caption: s.title };
}

/**
 * History and forecast, 2016 to 2031: counted or estimated history with
 * hollow markers for estimates, a dashed central forecast that joins the
 * history at the 2026 nowcast, a low–high band, a shaded forecast zone and,
 * for the first series only, the dashed "Quota would need" line.
 */
export function HistoryForecast() {
  const [id, setId] = useState<ExecSeriesId>('private');
  const s = execSeries[id];
  const now = s.history.find((p) => p.year === nowcastYear)?.figure.value ?? 0;
  const hasQuota = s.forecast.some((f) => f.quotaNeed);

  const history: LineSeries = {
    id: 'history',
    label: s.historyLabel,
    color: chartColors.series1,
    markers: true,
    points: s.history.map((p) => ({ x: p.year, y: p.figure.value, estimate: p.kind !== 'published' })),
  };
  const central: LineSeries = {
    id: 'central',
    label: chartCopy.centralLabel,
    color: chartColors.series1,
    dashed: true,
    points: [{ x: nowcastYear, y: now }, ...s.forecast.map((f) => ({ x: f.year, y: f.central.value }))],
  };
  const quota: LineSeries[] = hasQuota
    ? [
        {
          id: 'quota',
          label: chartCopy.quotaLabel,
          color: chartColors.series2,
          dashed: true,
          points: s.forecast.map((f) => ({ x: f.year, y: f.quotaNeed?.value ?? null })),
        },
      ]
    : [];
  const band: BandSeries = {
    id: 'range',
    label: chartCopy.bandLabel,
    color: chartColors.series1,
    points: [{ x: nowcastYear, low: now, high: now }, ...s.forecast.map((f) => ({ x: f.year, low: f.low.value, high: f.high.value }))],
  };

  const legend: LegendItem[] = [
    { label: s.historyLabel, color: chartColors.series1, kind: 'line' },
    { label: chartCopy.estimateMarkerLabel, color: chartColors.series1, kind: 'hollow' },
    { label: chartCopy.centralLabel, color: chartColors.series1, kind: 'dashed' },
    { label: chartCopy.bandLabel, color: chartColors.series1, kind: 'band' },
    ...(hasQuota ? [{ label: chartCopy.quotaLabel, color: chartColors.series2, kind: 'dashed' as const }] : []),
  ];

  function rowsFor(x: number): TooltipRow[] {
    const h = s.history.find((p) => p.year === x);
    if (h) {
      return [{ label: kindLabels[h.kind], value: h.display, color: chartColors.series1, kind: h.kind === 'published' ? 'dot' : 'hollow' }];
    }
    const f = s.forecast.find((p) => p.year === x);
    if (!f) return [];
    const rows: TooltipRow[] = [
      { label: chartCopy.centralLabel, value: formatInt(f.central.value), color: chartColors.series1, kind: 'dashed' },
      { label: chartCopy.rangeShort, value: rangeText(f.low.value, f.high.value), color: chartColors.series1, kind: 'band' },
    ];
    if (f.quotaNeed) rows.push({ label: chartCopy.quotaLabel, value: formatInt(f.quotaNeed.value), color: chartColors.series2, kind: 'dashed' });
    return rows;
  }

  function pointLabel(x: number): string {
    const h = s.history.find((p) => p.year === x);
    if (h) return `${x}: ${s.historyLabel} ${h.display}, ${kindLabels[h.kind].toLowerCase()}`;
    const f = s.forecast.find((p) => p.year === x);
    if (!f) return String(x);
    const quotaText = f.quotaNeed ? `; ${chartCopy.quotaLabel.toLowerCase()} ${formatInt(f.quotaNeed.value)}` : '';
    return `${x}, ${chartCopy.forecastWord}: ${chartCopy.centralLabel.toLowerCase()} ${formatInt(f.central.value)}; ${chartCopy.bandLabel.toLowerCase()} ${rangeText(f.low.value, f.high.value)}${quotaText}`;
  }

  const subtitle =
    id === 'private' ? (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <DataTag status="published" />
        <span>{chartCopy.subtitlePublished}</span>
        <DataTag status="estimate" />
        <span>{chartCopy.subtitleEstimate}</span>
      </span>
    ) : (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <DataTag status="estimate" />
        <span>{chartCopy.subtitleRse}</span>
      </span>
    );

  return (
    <ChartFrame
      title={s.title}
      titleAs="h2"
      subtitle={subtitle}
      legend={legend}
      table={buildTable(s)}
      actions={
        <RadioGroup<ExecSeriesId>
          legend={chartCopy.switchLegend}
          hideLegend
          name="exec-series"
          variant="segmented"
          options={seriesOrder.map((k) => ({ value: k, label: execSeries[k].switchLabel }))}
          value={id}
          onChange={setId}
        />
      }
      footnote={s.caption}
    >
      <LineWithBand
        ariaLabel={s.ariaLabel}
        xValues={chartYears}
        xTicks={chartTicks}
        formatX={(x) => String(x)}
        formatY={formatInt}
        formatYTick={formatCompact}
        series={[history, central, ...quota]}
        bands={[band]}
        zone={{ from: s.forecast[0]?.year ?? nowcastYear + 1, to: s.forecast[s.forecast.length - 1]?.year ?? nowcastYear + 1, label: chartCopy.zoneLabel }}
        tooltipRows={rowsFor}
        tooltipTitle={(x) => (x > nowcastYear ? `${x} · ${chartCopy.forecastWord}` : String(x))}
        pointLabel={pointLabel}
        height={320}
      />
    </ChartFrame>
  );
}
