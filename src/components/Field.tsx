import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { inputClass, selectClass, textareaClass } from './classes';
import { cx } from '@/lib/cx';
import { useDomId } from '@/lib/useId';

export interface FieldIds {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  hideLabel?: boolean;
  children: (ids: FieldIds) => ReactNode;
}

/** A labelled form field. The render prop receives the ids to wire up. */
export function Field({ label, hint, error, required, optional, className, hideLabel, children }: FieldProps) {
  const id = useDomId('field');
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cx(hideLabel ? 'sr-only' : 'text-sm font-semibold text-ink')}>
        {label}
        {required ? <span className="font-normal text-ink2"> (required)</span> : null}
        {optional ? <span className="font-normal text-ink2"> (optional)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="m-0 text-[13px] leading-snug text-ink2">
          {hint}
        </p>
      ) : null}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} className="m-0 text-[13px] font-medium text-crit-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(inputClass, className)} {...rest} />;
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(textareaClass, className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(selectClass, className)} {...rest}>
      {children}
    </select>
  );
}

/** A native checkbox with its label; the whole row is the touch target. */
export function Checkbox({
  label,
  description,
  checked,
  onChange,
  className,
}: {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
}) {
  const id = useDomId('check');
  return (
    <div className={cx('flex min-h-touch items-start gap-3 py-1', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={description ? `${id}-desc` : undefined}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-control accent-[var(--accent)]"
      />
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[15px] leading-snug text-ink">
          {label}
        </label>
        {description ? (
          <p id={`${id}-desc`} className="m-0 mt-0.5 text-[13px] leading-snug text-ink2">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
