import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
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
        <div id={hintId} className="text-[13px] leading-snug text-ink2">
          {hint}
        </div>
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

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cx(inputClass, className)} {...rest} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cx(textareaClass, className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={cx(selectClass, className)} {...rest}>
      {children}
    </select>
  );
});

/** A native checkbox with its label; the whole row is the touch target. */
export function Checkbox({
  label,
  description,
  checked,
  onChange,
  className,
  id: idProp,
  disabled,
}: {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
}) {
  const generated = useDomId('check');
  const id = idProp ?? generated;
  return (
    <div className={cx('flex min-h-touch items-start gap-3 py-1', disabled && 'opacity-60', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={description ? `${id}-desc` : undefined}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-control accent-[var(--accent)] disabled:cursor-not-allowed"
      />
      <div className="min-w-0">
        <label htmlFor={id} className={cx('text-[15px] leading-snug text-ink', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
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
