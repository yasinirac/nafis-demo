import { useState } from 'react';
import { chartColors, linearScale, niceDomain, useMeasure, useRoving } from './core';
import { ChartTooltip, type TooltipRow } from './Tooltip';
import type { LegendKind } from './ChartFrame';

export interface LinePoint {
  x: number;
  y: number | null;
  /** Estimated rather than counted: drawn as a hollow marker. */
  estimate?: boolean;
}

export interface LineSeries {
  id: string;
  label: string;
  color: string;
  points: LinePoint[];
  dashed?: boolean;
  /** Draw a marker at every point (hollow for estimates). */
  markers?: boolean;
  /** Text drawn after the last point. Use sparingly. */
  endLabel?: string;
  /** Leave this series out of the tooltip (for example a duplicate join point). */
  hideInTooltip?: boolean;
  /** Leave these x values of this series out of the tooltip, e.g. a forecast's join point. */
  tooltipExclude?: number[];
}

export interface BandSeries {
  id: string;
  label: string;
  color: string;
  points: Array<{ x: number; low: number; high: number }>;
  opacity?: number;
}

export interface RefLine {
  axis: 'x' | 'y';
  value: number;
  label: string;
}

export interface LineWithBandProps {
  /** One sentence describing the chart for screen readers. */
  ariaLabel: string;
  xValues: number[];
  formatX: (x: number) => string;
  /** Tick labels shown on the x axis (defaults to every value, thinned to fit). */
  xTicks?: number[];
  formatY: (y: number) => string;
  /** Axis tick format; defaults to formatY. */
  formatYTick?: (y: number) => string;
  yDomain?: [number, number];
  yTicks?: number[];
  includeZero?: boolean;
  series: LineSeries[];
  bands?: BandSeries[];
  /** A shaded zone, for example the forecast years. */
  zone?: { from: number; to: number; label: string };
  refLines?: RefLine[];
  /** A highlighted point, for example the selected value. */
  highlight?: { x: number; y: number; label: string };
  curve?: 'linear' | 'step';
  height?: number;
  rightMargin?: number;
  /** Accessible name for each keyboard target. Defaults to the tooltip text. */
  pointLabel?: (x: number) => string;
  /** Override the tooltip rows for an x value. */
  tooltipRows?: (x: number) => TooltipRow[];
  tooltipTitle?: (x: number) => string;
}

function valueAt(series: LineSeries, x: number): LinePoint | undefined {
  return series.points.find((p) => p.x === x && p.y != null);
}

function buildPath(points: Array<{ x: number; y: number }>, curve: 'linear' | 'step'): string {
  if (!points.length) return '';
  const first = points[0] as { x: number; y: number };
  let d = `M${first.x},${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i] as { x: number; y: number };
    d += curve === 'step' ? `H${p.x}V${p.y}` : `L${p.x},${p.y}`;
  }
  return d;
}

/**
 * Line chart with optional low–high bands, a shaded zone, reference lines,
 * hollow markers for estimates, a hover crosshair with one tooltip for every
 * series, and one keyboard tab stop whose arrow keys walk the x values.
 */
export function LineWithBand({
  ariaLabel,
  xValues,
  formatX,
  xTicks,
  formatY,
  formatYTick,
  yDomain,
  yTicks,
  includeZero = true,
  series,
  bands = [],
  zone,
  refLines = [],
  highlight,
  curve = 'linear',
  height = 280,
  rightMargin = 24,
  pointLabel,
  tooltipRows,
  tooltipTitle,
}: LineWithBandProps) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const roving = useRoving(xValues.length);

  const allY: number[] = [];
  series.forEach((s) => s.points.forEach((p) => p.y != null && allY.push(p.y)));
  bands.forEach((b) => b.points.forEach((p) => allY.push(p.low, p.high)));
  refLines.filter((r) => r.axis === 'y').forEach((r) => allY.push(r.value));
  const auto = niceDomain(allY, includeZero);
  const domain = yDomain ?? auto.domain;
  const ticks = yTicks ?? (yDomain ? niceDomain([yDomain[0], yDomain[1]], false).ticks.filter((t) => t >= domain[0] && t <= domain[1]) : auto.ticks);

  const margin = { top: zone ? 28 : 16, right: rightMargin, bottom: 32, left: 58 };
  const plotW = Math.max(10, width - margin.left - margin.right);
  const plotH = height - margin.top - margin.bottom;
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const sx = linearScale([xMin, xMax], [margin.left, margin.left + plotW]);
  const sy = linearScale(domain, [margin.top + plotH, margin.top]);
  const step = xValues.length > 1 ? plotW / (xValues.length - 1) : plotW;

  const tickXs = xTicks ?? (() => {
    const maxTicks = Math.max(2, Math.floor(plotW / 56));
    const every = Math.ceil(xValues.length / maxTicks);
    return xValues.filter((_, i) => i % every === 0 || i === xValues.length - 1);
  })();

  function rowsFor(x: number): TooltipRow[] {
    if (tooltipRows) return tooltipRows(x);
    const rows: TooltipRow[] = [];
    series.forEach((s) => {
      if (s.hideInTooltip || s.tooltipExclude?.includes(x)) return;
      const p = valueAt(s, x);
      if (p && p.y != null) {
        const kind: LegendKind = s.dashed ? 'dashed' : 'line';
        rows.push({ label: `${s.label}${p.estimate ? ' (estimate)' : ''}`, value: formatY(p.y), color: s.color, kind });
      }
    });
    bands.forEach((b) => {
      const p = b.points.find((q) => q.x === x);
      if (p) rows.push({ label: b.label, value: `${formatY(p.low)}–${formatY(p.high)}`, color: b.color, kind: 'band' });
    });
    return rows;
  }

  function labelFor(x: number): string {
    if (pointLabel) return pointLabel(x);
    const rows = rowsFor(x);
    return `${tooltipTitle ? tooltipTitle(x) : formatX(x)}: ${rows.map((r) => `${r.label} ${r.value}`).join('; ')}`;
  }

  const activeX = active != null ? xValues[active] : undefined;

  return (
    <div ref={ref} className="relative w-full" style={{ height }} onMouseLeave={() => setActive(null)}>
      {width > 0 ? (
        <>
          <svg role="img" aria-label={ariaLabel} width={width} height={height} className="block overflow-visible">
            {zone ? (
              <g>
                <rect
                  x={sx(zone.from) - step / 2}
                  y={margin.top}
                  width={Math.max(0, sx(zone.to) - sx(zone.from) + step / 2)}
                  height={plotH}
                  style={{ fill: chartColors.grid2 }}
                />
                <text x={sx(zone.from) - step / 2 + 6} y={margin.top - 10} style={{ fill: chartColors.axisText }} fontSize={12}>
                  {zone.label}
                </text>
              </g>
            ) : null}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={margin.left} x2={margin.left + plotW} y1={sy(t)} y2={sy(t)} style={{ stroke: chartColors.grid }} strokeWidth={1} />
                <text x={margin.left - 8} y={sy(t)} dy="0.32em" textAnchor="end" fontSize={12} className="tabular" style={{ fill: chartColors.axisText }}>
                  {(formatYTick ?? formatY)(t)}
                </text>
              </g>
            ))}
            {tickXs.map((x) => (
              <text key={x} x={sx(x)} y={margin.top + plotH + 20} textAnchor="middle" fontSize={12} className="tabular" style={{ fill: chartColors.axisText }}>
                {formatX(x)}
              </text>
            ))}
            {bands.map((b) => {
              const top = b.points.map((p) => `${sx(p.x)},${sy(p.high)}`);
              const bottom = [...b.points].reverse().map((p) => `${sx(p.x)},${sy(p.low)}`);
              return <polygon key={b.id} points={[...top, ...bottom].join(' ')} style={{ fill: b.color, opacity: b.opacity ?? 0.14 }} />;
            })}
            {refLines.map((r) =>
              r.axis === 'y' ? (
                <g key={`y-${r.value}`}>
                  <line x1={margin.left} x2={margin.left + plotW} y1={sy(r.value)} y2={sy(r.value)} style={{ stroke: chartColors.ink }} strokeWidth={1} />
                  <text x={margin.left + plotW} y={sy(r.value) - 6} textAnchor="end" fontSize={12} style={{ fill: chartColors.ink }}>
                    {r.label}
                  </text>
                </g>
              ) : (
                <g key={`x-${r.value}`}>
                  <line x1={sx(r.value)} x2={sx(r.value)} y1={margin.top} y2={margin.top + plotH} style={{ stroke: chartColors.ink }} strokeWidth={1} />
                  <text x={sx(r.value) + 6} y={margin.top + 12} fontSize={12} style={{ fill: chartColors.ink }}>
                    {r.label}
                  </text>
                </g>
              ),
            )}
            {series.map((s) => {
              const pts = s.points.filter((p) => p.y != null).map((p) => ({ x: sx(p.x), y: sy(p.y as number) }));
              return (
                <path
                  key={s.id}
                  d={buildPath(pts, curve)}
                  fill="none"
                  style={{ stroke: s.color, strokeDasharray: s.dashed ? '6 4' : undefined }}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}
            {series
              .filter((s) => s.markers)
              .map((s) => (
                <g key={`${s.id}-markers`}>
                  {s.points
                    .filter((p) => p.y != null)
                    .map((p) => (
                      <g key={p.x}>
                        <circle cx={sx(p.x)} cy={sy(p.y as number)} r={6} style={{ fill: chartColors.surface }} />
                        <circle
                          cx={sx(p.x)}
                          cy={sy(p.y as number)}
                          r={p.estimate ? 3.5 : 4}
                          style={{ fill: p.estimate ? chartColors.surface : s.color, stroke: s.color }}
                          strokeWidth={p.estimate ? 2 : 0}
                        />
                      </g>
                    ))}
                </g>
              ))}
            {series
              .filter((s) => s.endLabel)
              .map((s) => {
                const last = [...s.points].reverse().find((p) => p.y != null);
                if (!last || last.y == null) return null;
                return (
                  <text key={`${s.id}-end`} x={sx(last.x) + 8} y={sy(last.y)} dy="0.32em" fontSize={12} style={{ fill: chartColors.ink }}>
                    {s.endLabel}
                  </text>
                );
              })}
            {highlight ? (
              <g>
                <circle cx={sx(highlight.x)} cy={sy(highlight.y)} r={8} style={{ fill: chartColors.surface }} />
                <circle cx={sx(highlight.x)} cy={sy(highlight.y)} r={5} style={{ fill: chartColors.ink }} />
                <text
                  x={sx(highlight.x)}
                  y={sy(highlight.y) - 12}
                  textAnchor={sx(highlight.x) > margin.left + plotW - 60 ? 'end' : 'middle'}
                  fontSize={12}
                  fontWeight={600}
                  style={{ fill: chartColors.ink }}
                >
                  {highlight.label}
                </text>
              </g>
            ) : null}
            {activeX != null ? (
              <g>
                <line x1={sx(activeX)} x2={sx(activeX)} y1={margin.top} y2={margin.top + plotH} style={{ stroke: chartColors.axisText }} strokeWidth={1} />
                {series.map((s) => {
                  const p = valueAt(s, activeX);
                  if (!p || p.y == null) return null;
                  return (
                    <g key={`${s.id}-active`}>
                      <circle cx={sx(activeX)} cy={sy(p.y)} r={7} style={{ fill: chartColors.surface }} />
                      <circle cx={sx(activeX)} cy={sy(p.y)} r={4.5} style={{ fill: s.color }} />
                    </g>
                  );
                })}
              </g>
            ) : null}
            <line x1={margin.left} x2={margin.left + plotW} y1={margin.top + plotH} y2={margin.top + plotH} style={{ stroke: chartColors.axisText }} strokeWidth={1} />
          </svg>
          <div className="absolute inset-0">
            {xValues.map((x, i) => {
              // Each target spans halfway to its neighbours, so uneven x spacing never overlaps.
              const prev = i > 0 ? sx(xValues[i - 1] as number) : sx(x) - step;
              const next = i < xValues.length - 1 ? sx(xValues[i + 1] as number) : sx(x) + step;
              const left = Math.max(0, (prev + sx(x)) / 2);
              const w = Math.max(4, Math.min(width, (sx(x) + next) / 2) - left);
              return (
                <button
                  key={x}
                  ref={(el) => {
                    roving.refs.current[i] = el;
                  }}
                  type="button"
                  tabIndex={roving.tabIndexFor(i)}
                  aria-label={labelFor(x)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => {
                    roving.setFocusIndex(i);
                    setActive(i);
                  }}
                  onBlur={() => setActive(null)}
                  onKeyDown={(e) => roving.onKeyDown(e, i)}
                  className="absolute cursor-crosshair bg-transparent focus-visible:outline-offset-0"
                  style={{ left, width: w, top: margin.top, height: plotH }}
                />
              );
            })}
          </div>
          {activeX != null ? (
            <ChartTooltip
              x={sx(activeX)}
              y={margin.top}
              containerWidth={width}
              title={tooltipTitle ? tooltipTitle(activeX) : formatX(activeX)}
              rows={rowsFor(activeX)}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
