import { useState, type ReactNode } from 'react';
import { Table2 } from 'lucide-react';
import { cx } from '@/lib/cx';
import { useDomId } from '@/lib/useId';
import { useOverflow } from '@/lib/useOverflow';
import type { DataStatus } from '@/data/types';
import { DataTag } from '@/components/Chip';

export type LegendKind = 'line' | 'dashed' | 'rect' | 'band' | 'hollow' | 'dot';

export interface LegendItem {
  label: string;
  color: string;
  kind: LegendKind;
}

export interface ChartTableColumn {
  key: string;
  label: string;
  numeric?: boolean;
}

export interface ChartTableSpec {
  columns: ChartTableColumn[];
  rows: Array<Record<string, ReactNode>>;
  /** Defaults to the chart title. */
  caption?: string;
}

export function LegendSwatch({ kind, color }: { kind: LegendKind; color: string }) {
  if (kind === 'rect' || kind === 'band') {
    return (
      <svg aria-hidden="true" width="14" height="14" className="shrink-0">
        <rect x="1" y="1" width="12" height="12" rx="3" style={{ fill: color, opacity: kind === 'band' ? 0.28 : 1 }} />
      </svg>
    );
  }
  if (kind === 'hollow' || kind === 'dot') {
    return (
      <svg aria-hidden="true" width="14" height="14" className="shrink-0">
        <circle cx="7" cy="7" r="4.5" style={{ fill: kind === 'hollow' ? 'var(--surface)' : color, stroke: color, strokeWidth: 2 }} />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width="22" height="10" className="shrink-0">
      <line
        x1="1"
        y1="5"
        x2="21"
        y2="5"
        style={{ stroke: color, strokeWidth: 2, strokeDasharray: kind === 'dashed' ? '5 3' : undefined }}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cx('m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[13px] text-ink2', className)} aria-label="Legend">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <LegendSwatch kind={item.kind} color={item.color} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export interface ChartFrameProps {
  title: ReactNode;
  titleAs?: 'h2' | 'h3' | 'h4';
  subtitle?: ReactNode;
  status?: DataStatus;
  statusAsOf?: string;
  legend?: LegendItem[];
  table: ChartTableSpec;
  /** Extra controls beside "Show table", for example a series switch or Download CSV. */
  actions?: ReactNode;
  footnote?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Draw the card chrome (border, padding). */
  card?: boolean;
}

/**
 * Wraps every chart: title, data status, legend (for two or more series),
 * the plot, a footnote, and a "Show table" toggle that renders the same values.
 */
export function ChartFrame({
  title,
  titleAs: H = 'h3',
  subtitle,
  status,
  statusAsOf,
  legend,
  table,
  actions,
  footnote,
  children,
  className,
  card = true,
}: ChartFrameProps) {
  const [showTable, setShowTable] = useState(false);
  const [tableRef, tableOverflows] = useOverflow<HTMLDivElement>();
  const tableId = useDomId('chart-table');
  const caption = table.caption ?? (typeof title === 'string' ? title : 'Chart values');
  return (
    <figure className={cx('m-0 min-w-0', card && 'rounded-card border border-line bg-surface p-5', className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1 basis-[240px]">
          <H className="m-0 text-[16px] font-semibold leading-snug text-ink">{title}</H>
          {subtitle ? <div className="mt-1 text-[13px] leading-snug text-ink2">{subtitle}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status ? <DataTag status={status} asOf={statusAsOf} /> : null}
          {actions}
          <button
            type="button"
            aria-pressed={showTable}
            aria-controls={tableId}
            onClick={() => setShowTable((v) => !v)}
            className={cx(
              'inline-flex min-h-touch items-center gap-1.5 rounded-control border px-3 text-[13px] font-medium',
              showTable ? 'border-accent bg-accent-tint text-ink' : 'border-control bg-surface text-accent hover:bg-accent-tint',
            )}
          >
            <Table2 aria-hidden="true" className="h-4 w-4" />
            Show table
          </button>
        </div>
      </div>
      {legend && legend.length > 1 ? <Legend items={legend} className="mb-3" /> : null}
      {children}
      {footnote ? <figcaption className="mt-3 text-[13px] leading-relaxed text-ink2">{footnote}</figcaption> : null}
      <div id={tableId} hidden={!showTable} className="mt-4">
        {showTable ? (
          <div
            ref={tableRef}
            role={tableOverflows ? 'region' : undefined}
            aria-label={tableOverflows ? `${caption} table` : undefined}
            tabIndex={tableOverflows ? 0 : undefined}
            className="relative max-w-full overflow-x-auto"
          >
            <table className="w-full border-collapse text-start text-sm">
              <caption className="sr-only">{caption}</caption>
              <thead>
                <tr className="border-b border-line">
                  {table.columns.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={cx('whitespace-nowrap px-3 py-2 text-start text-[13px] font-semibold text-ink2', c.numeric && 'text-end')}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line2 last:border-b-0">
                    {table.columns.map((c, j) => {
                      const Cell = j === 0 ? 'th' : 'td';
                      return (
                        <Cell
                          key={c.key}
                          scope={j === 0 ? 'row' : undefined}
                          className={cx('relative px-3 py-2 text-start text-ink', j === 0 && 'font-medium', c.numeric && 'tabular text-end')}
                        >
                          {row[c.key] ?? '—'}
                        </Cell>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
