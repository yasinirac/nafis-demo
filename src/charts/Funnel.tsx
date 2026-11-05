import { useState } from 'react';
import { barPath, chartColors, linearScale, useMeasure, useRoving } from './core';
import { ChartTooltip } from './Tooltip';
import { formatInt } from '@/lib/format';

export interface FunnelStage {
  key: string;
  label: string;
  value: number;
  /** Share of the previous stage that reached this one, in percent. */
  conversion?: number;
}

/**
 * A funnel drawn as decreasing bars from one baseline. Each stage has its
 * name on one line and the conversion from the previous stage on a second
 * line, so long labels never run into each other. The step with the lowest
 * conversion (the biggest drop) is marked in words and with an underline.
 */
export function Funnel({
  ariaLabel,
  stages,
  dropLabel = 'Biggest drop',
  conversionLabel = 'of the previous step',
}: {
  ariaLabel: string;
  stages: FunnelStage[];
  dropLabel?: string;
  conversionLabel?: string;
}) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const roving = useRoving(stages.length);
  const rowH = 70;
  const barTop = 40;
  const barH = 20;
  const h = stages.length * rowH + 4;
  const maxV = Math.max(...stages.map((s) => s.value));
  const sx = linearScale([0, maxV], [0, Math.max(10, width - 96)]);
  const conversions = stages.map((s) => s.conversion ?? Infinity);
  const minConv = Math.min(...conversions);
  const dropIndex = conversions.indexOf(minConv);

  return (
    <div ref={ref} className="relative w-full" style={{ height: h }} onMouseLeave={() => setActive(null)}>
      {width > 0 ? (
        <>
          <svg role="img" aria-label={ariaLabel} width={width} height={h} className="block">
            {stages.map((s, i) => {
              const y = i * rowH;
              const w = Math.max(2, sx(s.value));
              const isDrop = i === dropIndex;
              return (
                <g key={s.key}>
                  <text x={0} y={y + 14} fontSize={13} fontWeight={500} style={{ fill: chartColors.ink }}>
                    {s.label}
                  </text>
                  {s.conversion != null ? (
                    <text x={0} y={y + 31} fontSize={12} fontWeight={isDrop ? 600 : 400} style={{ fill: isDrop ? chartColors.ink : chartColors.axisText }}>
                      {`${s.conversion}% ${conversionLabel}${isDrop ? ` · ${dropLabel}` : ''}`}
                    </text>
                  ) : null}
                  <path
                    d={barPath(0, y + barTop, w, barH, 'right')}
                    style={{ fill: chartColors.series1, opacity: active != null && active !== i ? 0.55 : 1 }}
                  />
                  <text x={w + 8} y={y + barTop + barH / 2} dy="0.32em" fontSize={13} fontWeight={600} className="tabular" style={{ fill: chartColors.ink }}>
                    {formatInt(s.value)}
                  </text>
                  {isDrop ? <rect x={0} y={y + 34} width={Math.min(w, 120)} height={2} style={{ fill: chartColors.ink }} /> : null}
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0">
            {stages.map((s, i) => (
              <button
                key={s.key}
                ref={(el) => {
                  roving.refs.current[i] = el;
                }}
                type="button"
                tabIndex={roving.tabIndexFor(i)}
                aria-label={`${s.label}: ${formatInt(s.value)}${s.conversion != null ? `, ${s.conversion}% ${conversionLabel}` : ''}${i === dropIndex ? `, ${dropLabel.toLowerCase()}` : ''}`}
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
          {active != null && stages[active] ? (
            <ChartTooltip
              x={Math.min(width - 230, sx(stages[active].value) + 40)}
              y={active * rowH + barTop - 4}
              containerWidth={width}
              title={stages[active].label}
              rows={[
                { label: 'people', value: formatInt(stages[active].value), color: chartColors.series1, kind: 'rect' },
                ...(stages[active].conversion != null ? [{ label: conversionLabel, value: `${stages[active].conversion}%` }] : []),
              ]}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
