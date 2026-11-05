import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export interface RadioOption<T extends string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
}

export interface RadioGroupProps<T extends string> {
  legend: ReactNode;
  hideLegend?: boolean;
  legendClassName?: string;
  name: string;
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /**
   * pill: rounded pills that wrap · segmented: equal-width row ·
   * card: stacked cards with a description · compact: small pills for dense rows
   */
  variant?: 'pill' | 'segmented' | 'card' | 'compact';
  describedBy?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * A radio group built on native inputs inside a fieldset, so arrow keys,
 * Tab and screen readers behave as expected (role="radio" is implicit).
 */
export function RadioGroup<T extends string>({
  legend,
  hideLegend,
  legendClassName,
  name,
  options,
  value,
  onChange,
  variant = 'pill',
  describedBy,
  className,
  disabled,
}: RadioGroupProps<T>) {
  return (
    <fieldset className={cx('m-0 min-w-0 border-0 p-0', className)} aria-describedby={describedBy} disabled={disabled}>
      <legend className={cx(hideLegend ? 'sr-only' : 'mb-2 p-0 text-[15px] font-semibold text-ink', legendClassName)}>{legend}</legend>
      <div
        className={cx(
          variant === 'card' && 'flex flex-col gap-2',
          variant === 'pill' && 'flex flex-wrap gap-2',
          variant === 'compact' && 'flex flex-wrap gap-1.5',
          variant === 'segmented' && 'grid auto-cols-fr grid-flow-col gap-1.5',
        )}
      >
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label key={option.value} className={cx('relative min-w-0', variant === 'card' ? 'block' : 'inline-flex')}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              {variant === 'card' ? (
                <span
                  className={cx(
                    'peer-ring flex w-full cursor-pointer gap-3 rounded-card border bg-surface p-4 transition-colors',
                    checked ? 'border-2 border-accent bg-accent-tint' : 'border-control hover:bg-accent-tint',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      checked ? 'border-accent' : 'border-control',
                    )}
                  >
                    {checked ? <span className="h-2.5 w-2.5 rounded-full bg-accent" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-ink">
                      {option.label}
                      {option.badge}
                    </span>
                    {option.description ? <span className="mt-1 block text-sm leading-relaxed text-ink2">{option.description}</span> : null}
                  </span>
                </span>
              ) : (
                <span
                  className={cx(
                    'peer-ring inline-flex w-full cursor-pointer items-center justify-center rounded-full border text-center font-medium leading-tight transition-colors',
                    variant === 'compact' ? 'min-h-touch px-3 py-1.5 text-[13px]' : 'min-h-touch px-4 py-2 text-sm',
                    variant === 'segmented' && 'rounded-control px-2',
                    checked ? 'border-accent bg-accent text-white' : 'border-control bg-surface text-ink hover:bg-accent-tint',
                  )}
                >
                  {option.label}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
