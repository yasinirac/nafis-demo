import { LegendSwatch, type LegendKind } from './ChartFrame';

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
  kind?: LegendKind;
}

const MIN_W = 200;
const MAX_W = 300;

/**
 * The hover/focus readout. Values lead, labels follow; series are keyed with
 * a short line, not a box. Width adapts between 200 and 300px and values never
 * wrap. Hidden from assistive tech because the focused target already carries
 * the same text in its accessible name.
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
  const longest = Math.max(title.length, ...rows.map((r) => r.value.length + r.label.length + 4));
  const estimate = Math.min(MAX_W, Math.max(MIN_W, longest * 7 + 40));
  const flip = x + 16 + estimate > containerWidth;
  const left = flip ? Math.max(0, x - 16 - estimate) : x + 16;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-10 rounded-control border border-line bg-surface px-3 py-2 text-[13px] shadow-md"
      style={{ left, top: Math.max(0, y), minWidth: MIN_W, maxWidth: MAX_W, width: estimate }}
    >
      <p className="m-0 mb-1 font-medium text-ink2">{title}</p>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            {row.color ? <LegendSwatch kind={row.kind ?? 'line'} color={row.color} /> : null}
            <span className="tabular whitespace-nowrap font-semibold text-ink">{row.value}</span>
            <span className="min-w-0 truncate text-ink2">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
