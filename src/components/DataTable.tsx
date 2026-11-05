import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** Right-aligned, tabular figures. */
  numeric?: boolean;
  className?: string;
  /** Render this column's cells as row headers (th scope="row"). */
  rowHeader?: boolean;
}

export interface DataTableProps<T> {
  caption: ReactNode;
  hideCaption?: boolean;
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T, index: number) => string;
  dense?: boolean;
  /** Highlight a selected row (pair with a button inside the row). */
  selectedKey?: string | null;
  className?: string;
  /** Accessible name for the scroll region when the table is wider than its box. */
  regionLabel?: string;
  footer?: ReactNode;
}

/**
 * A plain semantic table inside a horizontally scrollable, focusable region.
 * Never add a risk column: employers never see a number about a person.
 */
export function DataTable<T>({
  caption,
  hideCaption,
  columns,
  rows,
  getKey,
  dense,
  selectedKey,
  className,
  regionLabel,
  footer,
}: DataTableProps<T>) {
  const pad = dense ? 'px-3 py-2' : 'px-3 py-3';
  const label = regionLabel ?? (typeof caption === 'string' ? caption : 'Table');
  return (
    <div role="region" aria-label={label} tabIndex={0} className={cx('max-w-full overflow-x-auto rounded-control', className)}>
      <table className="w-full border-collapse text-left text-sm">
        <caption className={cx(hideCaption ? 'sr-only' : 'pb-2 text-left text-[15px] font-semibold text-ink')}>{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cx(pad, 'whitespace-nowrap text-[13px] font-semibold text-ink2', col.numeric && 'text-right', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const key = getKey(row, i);
            const selected = selectedKey != null && selectedKey === key;
            return (
              <tr key={key} className={cx('border-b border-line2 last:border-b-0', selected && 'bg-accent-tint')}>
                {columns.map((col) => {
                  const Cell = col.rowHeader ? 'th' : 'td';
                  return (
                    <Cell
                      key={col.key}
                      scope={col.rowHeader ? 'row' : undefined}
                      className={cx(
                        pad,
                        'align-top text-ink',
                        col.rowHeader && 'font-medium',
                        col.numeric && 'tabular text-right',
                        col.className,
                      )}
                    >
                      {col.render(row)}
                    </Cell>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        {footer ? <tfoot>{footer}</tfoot> : null}
      </table>
    </div>
  );
}
