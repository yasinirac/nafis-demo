import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { buttonClass, type ButtonSize, type ButtonVariant } from './classes';
import { cx } from '@/lib/cx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, iconEnd, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
      {iconEnd}
    </button>
  );
});

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export function ButtonLink({ variant = 'secondary', size = 'md', icon, iconEnd, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
      {iconEnd}
    </Link>
  );
}

/** A plain text link styled as an action. */
export function TextLink({ className, children, ...rest }: LinkProps) {
  return (
    <Link className={cx('font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline', className)} {...rest}>
      {children}
    </Link>
  );
}
