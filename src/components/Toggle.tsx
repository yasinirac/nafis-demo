import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { useDomId } from '@/lib/useId';

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  /** Words shown beside the track so state is not colour alone. */
  onText?: string;
  offText?: string;
}

/** An on/off switch: a real button with role="switch" and aria-checked. */
export function Switch({ checked, onChange, label, description, className, onText = 'On', offText = 'Off' }: SwitchProps) {
  const id = useDomId('switch');
  return (
    <div className={cx('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <span id={`${id}-label`} className="block text-[15px] font-semibold text-ink">
          {label}
        </span>
        {description ? (
          <span id={`${id}-desc`} className="mt-1 block text-sm leading-relaxed text-ink2">
            {description}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className="inline-flex min-h-touch shrink-0 items-center gap-2 rounded-full px-1 text-sm font-medium text-ink"
      >
        <span
          aria-hidden="true"
          className={cx(
            'relative inline-flex h-7 w-12 items-center rounded-full border-2 transition-colors',
            checked ? 'border-accent bg-accent' : 'border-control bg-surface',
          )}
        >
          <span
            className={cx(
              'absolute h-5 w-5 rounded-full transition-transform',
              checked ? 'translate-x-[22px] bg-white' : 'translate-x-[2px] bg-control',
            )}
          />
        </span>
        <span aria-hidden="true" className="w-7 text-start">
          {checked ? onText : offText}
        </span>
      </button>
    </div>
  );
}
