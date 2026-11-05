import { useState } from 'react';
import { chartColors, estimateTextWidth, textOnRamp, useMeasure, useRoving } from './core';
import { ChartTooltip } from './Tooltip';
import { Legend } from './ChartFrame';

export interface Segment {
  key: string;
  label: string;
  value: number;
}

/**
 * One whole split into parts: a tall (28px) segmented bar on the ordinal
 * ramp with a 2px surface gap between parts, amounts printed inside when they
 * fit, and a legend that lists the names in block order.
 */
export function SegmentedBar({
  ariaLabel,
  segments,
  colors = [...chartColors.ord],
  unit = '',
}: {
  ariaLabel: string;
  segments: Segment[];
  colors?: string[];
  unit?: string;
}) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const roving = useRoving(segments.length);
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const gap = 2;
  const barH = 28;
  const usable = Math.max(0, width - gap * (segments.length - 1));
  let cursor = 0;
  const geo = segments.map((s) => {
    const w = (s.value / total) * usable;
    const x = cursor;
    cursor += w + gap;
    return { x, w };
  });

  return (
    <div>
      <div ref={ref} className="relative w-full" style={{ height: barH }} onMouseLeave={() => setActive(null)}>
        {width > 0 ? (
          <>
            <svg role="img" aria-label={ariaLabel} width={width} height={barH} className="block">
              {segments.map((s, i) => {
                const g = geo[i] as { x: number; w: number };
                const color = colors[i] ?? chartColors.ord[0];
                const text = `${s.value}`;
                const fits = estimateTextWidth(text, 13) + 12 < g.w;
                return (
                  <g key={s.key}>
                    {s.value > 0 ? (
                      <rect x={g.x} y={0} width={g.w} height={barH} rx={4} style={{ fill: color, opacity: active != null && active !== i ? 0.6 : 1 }} />
                    ) : null}
                    {fits && s.value > 0 ? (
                      <text x={g.x + 8} y={barH / 2} dy="0.32em" fontSize={13} fontWeight={600} className="tabular" style={{ fill: textOnRamp(i, segments.length) }}>
                        {text}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0">
              {segments.map((s, i) => {
                const g = geo[i] as { x: number; w: number };
                const share = Math.round((s.value / total) * 100);
                return (
                  <button
                    key={s.key}
                    ref={(el) => {
                      roving.refs.current[i] = el;
                    }}
                    type="button"
                    tabIndex={roving.tabIndexFor(i)}
                    aria-label={`${s.label}: ${s.value}${unit ? ` ${unit}` : ''}, ${share}%`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => {
                      roving.setFocusIndex(i);
                      setActive(i);
                    }}
                    onBlur={() => setActive(null)}
                    onKeyDown={(e) => roving.onKeyDown(e, i)}
                    className="absolute top-0 h-full rounded bg-transparent"
                    style={{ left: g.x, width: Math.max(8, g.w) }}
                  />
                );
              })}
            </div>
            {active != null && segments[active] ? (
              <ChartTooltip
                x={(geo[active]?.x ?? 0) + (geo[active]?.w ?? 0) / 2}
                y={barH + 6}
                containerWidth={width}
                title={segments[active].label}
                rows={[
                  {
                    label: `${unit ? `${unit} · ` : ''}${Math.round((segments[active].value / total) * 100)}% of the total`,
                    value: String(segments[active].value),
                    color: colors[active],
                    kind: 'rect',
                  },
                ]}
              />
            ) : null}
          </>
        ) : null}
      </div>
      <Legend className="mt-3" items={segments.map((s, i) => ({ label: s.label, color: colors[i] ?? chartColors.ord[0], kind: 'rect' as const }))} />
    </div>
  );
}
