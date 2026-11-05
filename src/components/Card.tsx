import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

type CardTone = 'default' | 'accent' | 'muted' | 'warning';

const tones: Record<CardTone, string> = {
  default: 'bg-surface border border-line',
  accent: 'bg-accent-tint border-2 border-accent',
  muted: 'bg-line2 border border-line',
  warning: 'bg-warn-bg border border-warn-bar',
};

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article' | 'aside' | 'li';
  tone?: CardTone;
  /** Deprecated: use padding. padded={false} equals padding="none". */
  padded?: boolean;
  /** md = 20px (default), sm = 16px for narrow phone frames, none. */
  padding?: 'md' | 'sm' | 'none';
}

const paddings = { md: 'p-5', sm: 'p-4', none: '' } as const;

export function Card({ as: As = 'section', tone = 'default', padded = true, padding, className, children, ...rest }: CardProps) {
  const pad = padding ?? (padded ? 'md' : 'none');
  return (
    <As className={cx('rounded-card min-w-0', tones[tone], paddings[pad], className)} {...rest}>
      {children}
    </As>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  titleAs?: 'h2' | 'h3' | 'h4';
  id?: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, titleAs: H = 'h2', id, eyebrow, description, actions, className }: CardHeaderProps) {
  return (
    <div className={cx('mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2', className)}>
      <div className="min-w-0 flex-1 basis-[220px]">
        {eyebrow ? <div className="mb-1 text-[13px] font-medium text-ink2">{eyebrow}</div> : null}
        <H id={id} className="m-0 text-[17px] font-semibold leading-snug text-ink">
          {title}
        </H>
        {description ? <div className="mt-1 text-sm leading-relaxed text-ink2">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Page title block used at the top of desktop screens. */
export function PageHeader({
  eyebrow,
  title,
  description,
  chips,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  chips?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1 basis-[520px]">
        {eyebrow ? <p className="m-0 mb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink2">{eyebrow}</p> : null}
        <h1 className="m-0 text-[26px] font-bold leading-tight text-ink">{title}</h1>
        {description ? <div className="mt-2 max-w-[820px] text-[15px] leading-relaxed text-ink2">{description}</div> : null}
        {chips ? <div className="mt-3 flex flex-wrap gap-2">{chips}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
