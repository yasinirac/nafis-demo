import type { ReactNode } from 'react';
import { Check, CornerUpLeft } from 'lucide-react';
import { cx } from '@/lib/cx';

export type StepState = 'done' | 'current' | 'upcoming' | 'returned';

export interface Step {
  label: ReactNode;
  detail?: ReactNode;
  state: StepState;
}

const stateWords: Record<StepState, string> = {
  done: 'Done',
  current: 'Current step',
  upcoming: 'Not started',
  returned: 'Returned',
};

/**
 * An ordered list of steps. The current step carries aria-current="step";
 * every state is spelled out in words, not colour alone.
 */
export function Stepper({
  steps,
  label,
  orientation = 'horizontal',
  className,
  showStateWords = true,
}: {
  steps: Step[];
  label: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  showStateWords?: boolean;
}) {
  return (
    <ol
      aria-label={label}
      className={cx(
        'm-0 list-none p-0',
        orientation === 'horizontal' ? 'grid gap-3 sm:auto-cols-fr sm:grid-flow-col' : 'flex flex-col gap-3',
        className,
      )}
    >
      {steps.map((step, i) => (
        <li key={i} aria-current={step.state === 'current' ? 'step' : undefined} className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className={cx(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-semibold',
              step.state === 'done' && 'border-accent bg-accent text-white',
              step.state === 'current' && 'border-accent bg-surface text-accent',
              step.state === 'upcoming' && 'border-control bg-surface text-ink2',
              step.state === 'returned' && 'border-warn-text bg-warn-bg text-warn-text',
            )}
          >
            {step.state === 'done' ? (
              <Check className="h-4 w-4" strokeWidth={3} />
            ) : step.state === 'returned' ? (
              <CornerUpLeft className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              i + 1
            )}
          </span>
          <span className="min-w-0">
            <span className={cx('block text-sm leading-snug', step.state === 'current' ? 'font-semibold text-ink' : 'font-medium text-ink')}>
              {step.label}
            </span>
            {showStateWords ? (
              <span
                className={cx(
                  'block text-[13px] leading-snug',
                  step.state === 'returned' ? 'font-medium text-warn-text' : 'text-ink2',
                )}
              >
                {stateWords[step.state]}
                {step.detail ? <> · {step.detail}</> : null}
              </span>
            ) : step.detail ? (
              <span className="block text-[13px] leading-snug text-ink2">{step.detail}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** A thin segmented progress bar, e.g. "Stage 6 of 8". Decorative: pair it with text. */
export function SegmentProgress({
  total,
  done,
  className,
  label,
}: {
  total: number;
  done: number;
  className?: string;
  label: string;
}) {
  return (
    <div role="img" aria-label={label} className={cx('flex gap-1', className)}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cx('h-2 flex-1 rounded-full', i < done ? 'bg-accent' : 'bg-line')} />
      ))}
    </div>
  );
}
