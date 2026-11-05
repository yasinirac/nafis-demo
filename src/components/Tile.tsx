import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import type { DataStatus } from '@/data/types';
import { DataTag } from './Chip';

export interface TileProps {
  label: ReactNode;
  value: ReactNode;
  /** Small text after the value, for example "of 14" or "/ month". */
  unit?: ReactNode;
  sub?: ReactNode;
  status?: DataStatus;
  statusAsOf?: string;
  /** A StatusPill or similar, shown under the value. */
  badge?: ReactNode;
  footer?: ReactNode;
  hero?: boolean;
  className?: string;
  as?: 'div' | 'li' | 'section';
}

/** A KPI tile: label, value, a line of context and the data status. */
export function Tile({ label, value, unit, sub, status, statusAsOf, badge, footer, hero, className, as: As = 'div' }: TileProps) {
  return (
    <As className={cx('flex min-w-0 flex-col gap-2 rounded-card border border-line bg-surface p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="m-0 text-[13px] font-medium leading-snug text-ink2">{label}</p>
        {status ? <DataTag status={status} asOf={statusAsOf} /> : null}
      </div>
      <p className="m-0 flex flex-wrap items-baseline gap-x-1.5 font-heading leading-none text-ink">
        <span className={cx('font-semibold', hero ? 'text-[52px]' : 'text-[30px]')}>{value}</span>
        {unit ? <span className="font-sans text-sm font-medium text-ink2">{unit}</span> : null}
      </p>
      {badge ? <div>{badge}</div> : null}
      {sub ? <div className="text-[13px] leading-snug text-ink2">{sub}</div> : null}
      {footer ? <div className="mt-auto pt-1 text-sm">{footer}</div> : null}
    </As>
  );
}
