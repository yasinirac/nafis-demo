import { LegendSwatch, type LegendKind } from './ChartFrame';

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
  kind?: LegendKind;
}

/**
 * The hover/focus readout. Values lead, labels follow; series are keyed with
 * a short line, not a box. Hidden from assistive tech because the focused
 * target already carries the same text in its accessible name.
 */
export function ChartTooltip({
  x,
  y,
  containerWidth,
  title,
  rows,
}: {
  x: number;
  y: number;
  containerWidth: number;
  title: string;
  rows: TooltipRow[];
}) {
  const width = 220;
  const flip = x + 16 + width > containerWidth;
  const left = flip ? Math.max(0, x - 16 - width) : x + 16;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-10 rounded-control border border-line bg-surface px-3 py-2 text-[13px] shadow-md"
      style={{ left, top: Math.max(0, y), width }}
    >
      <p className="m-0 mb-1 font-medium text-ink2">{title}</p>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            {row.color ? <LegendSwatch kind={row.kind ?? 'line'} color={row.color} /> : null}
            <span className="tabular font-semibold text-ink">{row.value}</span>
            <span className="min-w-0 truncate text-ink2">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
