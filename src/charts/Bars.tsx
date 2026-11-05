import { useState } from 'react';
import { barPath, chartColors, estimateTextWidth, linearScale, niceDomain, useMeasure, useRoving } from './core';
import { ChartTooltip, type TooltipRow } from './Tooltip';

export interface BarDatum {
  key: string;
  label: string;
  /** null = suppressed or missing: no bar is drawn and "—" shows instead. */
  value: number | null;
  /** Text at the bar tip, for example "81" or "57%". */
  valueLabel: string;
  /** Defaults to series 1. Use chartColors.warning only for a status meaning, paired with a word. */
  color?: string;
  /** Extra words after the label, for example "30%" weight or "Lowest". */
  sublabel?: string;
  /** Extra tooltip rows. */
  tooltipRows?: TooltipRow[];
  /** Accessible name for the keyboard target. */
  ariaLabel?: string;
  /** Horizontal only: a warning marker (triangle icon and a word) after the value, e.g. "Lowest". */
  flag?: string;
}

export interface BarsProps {
  /** One sentence describing the chart for screen readers. */
  ariaLabel: string;
  data: BarDatum[];
  orientation?: 'horizontal' | 'vertical';
  /** Fixed scale maximum, for example 100 for scores or 60 for a 0–60% scale. */
  max?: number;
  formatTick?: (v: number) => string;
  /** Vertical only: chart height. */
  height?: number;
  /** Vertical only: label the value on these bar keys (selective labels). Default: all. */
  labelKeys?: string[];
  /** Vertical only: an annotation line before a bar, e.g. a launch date. */
  marker?: { beforeKey: string; offset?: number; label: string };
  tooltipTitle?: (d: BarDatum) => string;
  /** Horizontal only: show a light track behind each bar. */
  track?: boolean;
}

/**
 * Bars with thin marks (at most 24px), a 4px rounded data end, square at the
 * baseline, values at the tips, hover tooltips and one keyboard tab stop.
 */
export function Bars({
  ariaLabel,
  data,
  orientation = 'horizontal',
  max,
  formatTick,
  height = 260,
  labelKeys,
  marker,
  tooltipTitle,
  track = false,
}: BarsProps) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const roving = useRoving(data.length);
  const values = data.map((d) => d.value ?? 0);
  const auto = niceDomain(values, true, 4);
  const domainMax = max ?? auto.domain[1];

  function rowsFor(d: BarDatum): TooltipRow[] {
    return [{ label: d.sublabel ? `${d.label} · ${d.sublabel}` : d.label, value: d.value == null ? '—' : d.valueLabel, color: d.color ?? chartColors.series1, kind: 'rect' }, ...(d.tooltipRows ?? [])];
  }

  function nameFor(d: BarDatum): string {
    if (d.ariaLabel) return d.ariaLabel;
    return `${d.label}${d.sublabel ? `, ${d.sublabel}` : ''}: ${d.value == null ? 'not shown, too few people' : d.valueLabel}${d.flag ? `, ${d.flag}` : ''}`;
  }

  if (orientation === 'horizontal') {
    const rowH = 48;
    const barH = 16;
    const valueSpace = data.some((d) => d.flag) ? 150 : 64;
    const h = data.length * rowH + 8;
    const sx = linearScale([0, domainMax], [0, Math.max(10, width - valueSpace)]);
    return (
      <div ref={ref} className="relative w-full" style={{ height: h }} onMouseLeave={() => setActive(null)}>
        {width > 0 ? (
          <>
            <svg role="img" aria-label={ariaLabel} width={width} height={h} className="block">
              {data.map((d, i) => {
                const y = i * rowH;
                const w = d.value == null ? 0 : Math.max(2, sx(d.value));
                return (
                  <g key={d.key}>
                    <text x={0} y={y + 14} fontSize={13} style={{ fill: chartColors.ink }}>
                      {d.label}
                      {d.sublabel ? <tspan style={{ fill: chartColors.axisText }}>{`  ${d.sublabel}`}</tspan> : null}
                    </text>
                    {track ? (
                      <rect x={0} y={y + 22} width={sx(domainMax)} height={barH} rx={4} style={{ fill: chartColors.grid2 }} />
                    ) : null}
                    {d.value != null ? (
                      <path
                        d={barPath(0, y + 22, w, barH, 'right')}
                        style={{ fill: d.color ?? chartColors.series1, opacity: active != null && active !== i ? 0.55 : 1 }}
                      />
                    ) : null}
                    <text
                      x={d.value == null ? 0 : w + 8}
                      y={y + 22 + barH / 2}
                      dy="0.32em"
                      fontSize={13}
                      fontWeight={600}
                      className="tabular"
                      style={{ fill: chartColors.ink }}
                    >
                      {d.value == null ? '—' : d.valueLabel}
                    </text>
                    {d.flag && d.value != null ? (
                      <g aria-hidden="true">
                        <path
                          d={`M${w + 18 + estimateTextWidth(d.valueLabel, 13)},${y + 22 + barH / 2 + 6}l6,-11l6,11z`}
                          style={{ fill: 'var(--warn-bar)' }}
                        />
                        <text
                          x={w + 34 + estimateTextWidth(d.valueLabel, 13)}
                          y={y + 22 + barH / 2}
                          dy="0.32em"
                          fontSize={12}
                          fontWeight={600}
                          style={{ fill: 'var(--warn-text)' }}
                        >
                          {d.flag}
                        </text>
                      </g>
                    ) : null}
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0">
              {data.map((d, i) => (
                <button
                  key={d.key}
                  ref={(el) => {
                    roving.refs.current[i] = el;
                  }}
                  type="button"
                  tabIndex={roving.tabIndexFor(i)}
                  aria-label={nameFor(d)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => {
                    roving.setFocusIndex(i);
                    setActive(i);
                  }}
                  onBlur={() => setActive(null)}
                  onKeyDown={(e) => roving.onKeyDown(e, i)}
                  className="absolute left-0 w-full rounded-control bg-transparent"
                  style={{ top: i * rowH, height: rowH - 4 }}
                />
              ))}
            </div>
            {active != null && data[active] ? (
              <ChartTooltip
                x={Math.min(width - 230, sx(data[active].value ?? 0) + 40)}
                y={active * rowH + rowH}
                containerWidth={width}
                title={tooltipTitle ? tooltipTitle(data[active]) : data[active].label}
                rows={rowsFor(data[active])}
              />
            ) : null}
          </>
        ) : null}
      </div>
    );
  }

  // Vertical columns
  const margin = { top: marker ? 40 : 24, right: 8, bottom: 30, left: 52 };
  const plotW = Math.max(10, width - margin.left - margin.right);
  const plotH = height - margin.top - margin.bottom;
  const slot = plotW / Math.max(1, data.length);
  const barW = Math.min(24, slot * 0.6);
  const ticks = max != null ? niceDomain([0, max], true, 4).ticks.filter((t) => t <= max) : auto.ticks;
  const sy = linearScale([0, domainMax], [margin.top + plotH, margin.top]);
  const xAt = (i: number) => margin.left + slot * i + slot / 2;
  const markerIndex = marker ? data.findIndex((d) => d.key === marker.beforeKey) : -1;
  const thinLabels = estimateTextWidth('2026', 12) + 8 > slot;

  return (
    <div ref={ref} className="relative w-full" style={{ height }} onMouseLeave={() => setActive(null)}>
      {width > 0 ? (
        <>
          <svg role="img" aria-label={ariaLabel} width={width} height={height} className="block overflow-visible">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={margin.left} x2={margin.left + plotW} y1={sy(t)} y2={sy(t)} style={{ stroke: chartColors.grid }} strokeWidth={1} />
                <text x={margin.left - 8} y={sy(t)} dy="0.32em" textAnchor="end" fontSize={12} className="tabular" style={{ fill: chartColors.axisText }}>
                  {formatTick ? formatTick(t) : String(t)}
                </text>
              </g>
            ))}
            {markerIndex >= 0 && marker ? (
              <g>
                <line
                  x1={xAt(markerIndex) - slot / 2 + slot * (marker.offset ?? 0)}
                  x2={xAt(markerIndex) - slot / 2 + slot * (marker.offset ?? 0)}
                  y1={margin.top - 22}
                  y2={margin.top + plotH}
                  style={{ stroke: chartColors.ink }}
                  strokeWidth={1}
                />
                <text
                  x={xAt(markerIndex) - slot / 2 + slot * (marker.offset ?? 0) - 6}
                  y={margin.top - 26}
                  textAnchor="end"
                  fontSize={12}
                  style={{ fill: chartColors.ink }}
                >
                  {marker.label}
                </text>
              </g>
            ) : null}
            {data.map((d, i) => {
              const v = d.value ?? 0;
              const top = sy(v);
              const showLabel = !labelKeys || labelKeys.includes(d.key);
              return (
                <g key={d.key}>
                  <path
                    d={barPath(xAt(i) - barW / 2, top, barW, margin.top + plotH - top, 'up')}
                    style={{ fill: d.color ?? chartColors.series1, opacity: active != null && active !== i ? 0.55 : 1 }}
                  />
                  {showLabel ? (
                    <text x={xAt(i)} y={top - 8} textAnchor="middle" fontSize={12} fontWeight={600} className="tabular" style={{ fill: chartColors.ink }}>
                      {d.valueLabel}
                    </text>
                  ) : null}
                  {!thinLabels || i % 2 === 0 || i === data.length - 1 ? (
                    <text x={xAt(i)} y={margin.top + plotH + 20} textAnchor="middle" fontSize={12} className="tabular" style={{ fill: chartColors.axisText }}>
                      {d.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
            <line x1={margin.left} x2={margin.left + plotW} y1={margin.top + plotH} y2={margin.top + plotH} style={{ stroke: chartColors.axisText }} strokeWidth={1} />
          </svg>
          <div className="absolute inset-0">
            {data.map((d, i) => (
              <button
                key={d.key}
                ref={(el) => {
                  roving.refs.current[i] = el;
                }}
                type="button"
                tabIndex={roving.tabIndexFor(i)}
                aria-label={nameFor(d)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => {
                  roving.setFocusIndex(i);
                  setActive(i);
                }}
                onBlur={() => setActive(null)}
                onKeyDown={(e) => roving.onKeyDown(e, i)}
                className="absolute bg-transparent"
                style={{ left: xAt(i) - slot / 2, width: slot, top: margin.top, height: plotH }}
              />
            ))}
          </div>
          {active != null && data[active] ? (
            <ChartTooltip
              x={xAt(active)}
              y={margin.top}
              containerWidth={width}
              title={tooltipTitle ? tooltipTitle(data[active]) : data[active].label}
              rows={rowsFor(data[active])}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
