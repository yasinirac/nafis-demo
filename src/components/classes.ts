import { cx } from '@/lib/cx';

/** Shared class strings for buttons and form controls. */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium min-h-touch leading-tight transition-colors select-none no-underline';

const sizes: Record<ButtonSize, string> = {
  md: 'px-4 py-2 text-[15px]',
  sm: 'px-3 py-1.5 text-sm',
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover hover:text-white',
  secondary: 'bg-surface text-accent border border-control hover:bg-accent-tint hover:text-accent-hover',
  ghost: 'text-accent hover:bg-accent-tint hover:text-accent-hover',
};

const disabledClass =
  'disabled:cursor-not-allowed disabled:border disabled:border-line disabled:bg-line2 disabled:text-muted disabled:hover:bg-line2';

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', className?: string): string {
  return cx(base, sizes[size], variants[variant], disabledClass, className);
}

const controlBase =
  'w-full rounded-control border border-control bg-surface px-3 text-[15px] text-ink placeholder:text-muted read-only:bg-line2 read-only:text-ink2 disabled:bg-line2 disabled:text-muted';

export const inputClass = cx(controlBase, 'min-h-touch py-2');
export const textareaClass = cx(controlBase, 'min-h-[96px] py-2 leading-relaxed');
export const selectClass = cx(controlBase, 'min-h-touch py-2 pe-8');

