import type { ReactNode } from 'react';
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import { cx } from '@/lib/cx';
import type { Tone } from '@/data/types';

const toneClass: Record<Tone, string> = {
  good: 'bg-good-bg text-ink',
  warning: 'bg-warn-bg text-warn-text',
  critical: 'bg-crit-bg text-crit-text',
  accent: 'bg-accent-tint text-ink',
  neutral: 'bg-line2 text-ink2',
};

const iconClass: Record<Tone, string> = {
  good: 'text-good-icon',
  warning: 'text-warn-text',
  critical: 'text-crit-text',
  accent: 'text-accent',
  neutral: 'text-ink2',
};

export function ToneIcon({ tone, className }: { tone: Tone; className?: string }) {
  const Icon = tone === 'warning' ? TriangleAlert : tone === 'critical' ? OctagonAlert : tone === 'neutral' ? Info : CircleCheck;
  return <Icon aria-hidden="true" className={cx('h-4 w-4 shrink-0', iconClass[tone], className)} strokeWidth={2} />;
}

/** A small status label. Status always has an icon and a word, never colour alone. */
export function StatusPill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium leading-tight',
        toneClass[tone],
        className,
      )}
    >
      <ToneIcon tone={tone} />
      <span className="min-w-0">{children}</span>
    </span>
  );
}

/**
 * A polite live region that is always in the DOM. Put messages that appear
 * after an action inside it, so screen readers announce them: a region that
 * mounts together with its text is often not announced.
 */
export function LiveRegion({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      {children}
    </div>
  );
}

/**
 * A block-level status message. For a message that appears after an action,
 * wrap it in LiveRegion (the `live` prop is kept for banners present at load).
 */
export function StatusBanner({
  tone,
  title,
  children,
  live,
  icon,
  className,
}: {
  tone: Tone;
  title?: ReactNode;
  children?: ReactNode;
  live?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={live ? 'status' : undefined}
      className={cx('flex gap-3 rounded-control px-4 py-3 text-sm leading-relaxed', toneClass[tone], className)}
    >
      <span className="mt-0.5">{icon ?? <ToneIcon tone={tone} />}</span>
      <div className="min-w-0">
        {title ? <p className="m-0 font-semibold">{title}</p> : null}
        {children ? <div className={cx(title ? 'mt-0.5' : undefined)}>{children}</div> : null}
      </div>
    </div>
  );
}
