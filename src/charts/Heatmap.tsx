import { useRef, useState, type KeyboardEvent } from 'react';
import { chartColors, textOnRamp, useMeasure } from './core';
import { ChartTooltip } from './Tooltip';

export interface HeatBin {
  /** Upper bound (exclusive). The last bin uses Infinity. */
  below: number;
  label: string;
}

export interface HeatmapProps {
  ariaLabel: string;
  rows: string[];
  columns: Array<{ key: string; label: string; name: string }>;
  /** values[row][col]; null renders "—" (too few people). */
  values: Array<Array<number | null>>;
  bins: HeatBin[];
  format: (v: number) => string;
  selected: { row: number; col: number } | null;
  onSelect: (cell: { row: number; col: number }) => void;
  nullLabel?: string;
  /** Word for the value in the tooltip, for example 'coverage'. */
  measureLabel?: string;
}

/**
 * A heatmap on the sequential ramp. Every cell is a button over the drawing;
 * arrow keys move between cells (one tab stop) and Enter or Space selects.
 * The selected cell is outlined in ink, never in the action colour.
 */
export function Heatmap({ ariaLabel, rows, columns, values, bins, format, selected, onSelect, nullLabel = 'too few people', measureLabel = 'coverage' }: HeatmapProps) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);
  const [focus, setFocus] = useState<{ row: number; col: number }>(selected ?? { row: 0, col: 0 });
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const labelW = Math.min(150, Math.max(96, width * 0.24));
  const cellW = columns.length ? (width - labelW) / columns.length : 0;
  const cellH = 44;
  const maxLabelChars = Math.max(6, Math.floor((labelW - 10) / (13 * 0.56)));
  const shortLabel = (r: string) => (r.length > maxLabelChars ? `${r.slice(0, maxLabelChars - 1)}…` : r);
  const top = 26;
  const h = top + rows.length * cellH;

  function binIndex(v: number): number {
    const i = bins.findIndex((b) => v < b.below);
    return i === -1 ? bins.length - 1 : i;
  }

  function move(row: number, col: number) {
    const r = Math.max(0, Math.min(rows.length - 1, row));
    const c = Math.max(0, Math.min(columns.length - 1, col));
    setFocus({ row: r, col: c });
    refs.current[`${r}-${c}`]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, row: number, col: number) {
    const keys: Record<string, [number, number]> = {
      ArrowRight: [row, col + 1],
      ArrowLeft: [row, col - 1],
      ArrowDown: [row + 1, col],
      ArrowUp: [row - 1, col],
      Home: [row, 0],
      End: [row, columns.length - 1],
    };
    const target = keys[e.key];
    if (target) {
      e.preventDefault();
      move(target[0], target[1]);
    }
  }

  const tip = hover ?? null;

  return (
    <div ref={ref} className="relative w-full" style={{ height: h }} onMouseLeave={() => setHover(null)}>
      {width > 0 ? (
        <>
          <svg role="img" aria-label={ariaLabel} width={width} height={h} className="block">
            {columns.map((c, j) => (
              <text key={c.key} x={labelW + cellW * j + cellW / 2} y={16} textAnchor="middle" fontSize={12} fontWeight={600} style={{ fill: chartColors.axisText }}>
                {c.label}
              </text>
            ))}
            {rows.map((r, i) => (
              <g key={r}>
                <text x={0} y={top + cellH * i + cellH / 2} dy="0.32em" fontSize={13} style={{ fill: chartColors.ink }}>
                  {shortLabel(r)}
                </text>
                {columns.map((c, j) => {
                  const v = values[i]?.[j] ?? null;
                  const bi = v == null ? -1 : binIndex(v);
                  const fill = v == null ? chartColors.surface : chartColors.seq[bi] ?? chartColors.seq[0];
                  const isSel = selected?.row === i && selected?.col === j;
                  return (
                    <g key={c.key}>
                      <rect
                        x={labelW + cellW * j + 1}
                        y={top + cellH * i + 1}
                        width={Math.max(0, cellW - 2)}
                        height={cellH - 2}
                        rx={4}
                        style={{ fill, stroke: v == null ? chartColors.grid : 'none' }}
                        strokeWidth={1}
                      />
                      <text
                        x={labelW + cellW * j + cellW / 2}
                        y={top + cellH * i + cellH / 2}
                        dy="0.32em"
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={500}
                        className="tabular"
                        style={{ fill: v == null ? chartColors.axisText : textOnRamp(bi, bins.length) }}
                      >
                        {v == null ? '—' : format(v)}
                      </text>
                      {isSel ? (
                        <rect
                          x={labelW + cellW * j + 2}
                          y={top + cellH * i + 2}
                          width={Math.max(0, cellW - 4)}
                          height={cellH - 4}
                          rx={4}
                          fill="none"
                          style={{ stroke: chartColors.ink }}
                          strokeWidth={2.5}
                        />
                      ) : null}
                    </g>
                  );
                })}
              </g>
            ))}
          </svg>
          <div className="absolute inset-0">
            {rows.map((r, i) =>
              columns.map((c, j) => {
                const v = values[i]?.[j] ?? null;
                const isSel = selected?.row === i && selected?.col === j;
                return (
                  <button
                    key={`${i}-${j}`}
                    ref={(el) => {
                      refs.current[`${i}-${j}`] = el;
                    }}
                    type="button"
                    tabIndex={focus.row === i && focus.col === j ? 0 : -1}
                    aria-pressed={isSel}
                    aria-label={`${r} in ${c.name}: ${v == null ? `no value, ${nullLabel}` : format(v)}`}
                    onClick={() => onSelect({ row: i, col: j })}
                    onMouseEnter={() => setHover({ row: i, col: j })}
                    onFocus={() => {
                      setFocus({ row: i, col: j });
                      setHover({ row: i, col: j });
                    }}
                    onBlur={() => setHover(null)}
                    onKeyDown={(e) => onKeyDown(e, i, j)}
                    className="absolute rounded bg-transparent"
                    style={{ left: labelW + cellW * j, top: top + cellH * i, width: cellW, height: cellH }}
                  />
                );
              }),
            )}
          </div>
          {tip ? (
            <ChartTooltip
              x={labelW + cellW * tip.col + cellW / 2}
              y={top + cellH * (tip.row + 1) + 4}
              containerWidth={width}
              title={`${rows[tip.row]} · ${columns[tip.col]?.name ?? ''}`}
              rows={[
                {
                  label: measureLabel,
                  value: values[tip.row]?.[tip.col] == null ? `— ${nullLabel}` : format(values[tip.row]?.[tip.col] as number),
                },
              ]}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/** Legend for the heatmap bins, plus the "—" key. */
export function HeatmapLegend({ bins, nullLabel = 'too few people' }: { bins: HeatBin[]; nullLabel?: string }) {
  return (
    <ul className="m-0 mt-3 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 p-0 text-[13px] text-ink2" aria-label="Colour key">
      {bins.map((b, i) => (
        <li key={b.label} className="inline-flex items-center gap-1.5">
          <svg aria-hidden="true" width="18" height="14">
            <rect x="0.5" y="0.5" width="17" height="13" rx="3" style={{ fill: chartColors.seq[i], stroke: i === 0 ? chartColors.grid : 'none' }} />
          </svg>
          {b.label}
        </li>
      ))}
      <li className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-flex h-[14px] w-[18px] items-center justify-center rounded-[3px] border border-line text-[11px] leading-none">
          —
        </span>
        {nullLabel}
      </li>
    </ul>
  );
}
