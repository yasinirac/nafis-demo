import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { BadgeCheck, Check, FlaskConical, Hourglass, Shapes, Sigma } from 'lucide-react';
import { cx } from '@/lib/cx';
import { statusLabels, type DataStatus } from '@/data/types';

type ChipTone = 'neutral' | 'outline' | 'accent' | 'warning' | 'critical' | 'good' | 'dark';

const tones: Record<ChipTone, string> = {
  neutral: 'bg-line2 text-ink2 border border-line2',
  outline: 'bg-surface text-ink2 border border-line',
  accent: 'bg-accent-tint text-ink border border-accent-tint',
  warning: 'bg-warn-bg text-warn-text border border-warn-bg',
  critical: 'bg-crit-bg text-crit-text border border-crit-bg',
  good: 'bg-good-bg text-ink border border-good-bg',
  dark: 'bg-ink text-white border border-ink',
};

export interface ChipProps {
  tone?: ChipTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

/** A static, fully rounded label. Not interactive. */
export function Chip({ tone = 'outline', icon, children, className, size = 'md' }: ChipProps) {
  return (
    <span
      className={cx(
        'inline-flex max-w-full items-center gap-1.5 rounded-full font-medium leading-tight',
        size === 'md' ? 'px-3 py-1.5 text-[13px]' : 'px-2 py-0.5 text-xs',
        tones[tone],
        className,
      )}
    >
      {icon}
      <span className="min-w-0">{children}</span>
    </span>
  );
}

const statusIcons: Record<DataStatus, typeof BadgeCheck> = {
  published: BadgeCheck,
  sample: FlaskConical,
  estimate: Sigma,
  provisional: Hourglass,
  illustrative: Shapes,
};

/** Shows the data status of a figure: Published, Sample, Estimate, Provisional or Illustrative. */
export function DataTag({ status, asOf, className }: { status: DataStatus; asOf?: string; className?: string }) {
  const Icon = statusIcons[status];
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-xs font-medium leading-tight text-ink2',
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
      <span>
        {statusLabels[status]}
        {asOf ? `, ${asOf}` : ''}
      </span>
    </span>
  );
}

export interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
}

/** A chip that toggles on and off, announced with aria-pressed. */
export function ToggleChip({ pressed, onPressedChange, children, className, ...rest }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cx(
        'inline-flex min-h-touch items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium leading-tight transition-colors',
        pressed
          ? 'border-accent bg-accent-tint text-ink'
          : 'border-control bg-surface text-ink hover:bg-accent-tint',
        className,
      )}
      {...rest}
    >
      {pressed ? <Check aria-hidden="true" className="h-4 w-4 text-accent" strokeWidth={2.5} /> : null}
      {children}
    </button>
  );
}
