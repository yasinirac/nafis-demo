import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Bot } from 'lucide-react';
import type { AgentName } from '@/components/AiNote';
import { Card, type CardProps } from '@/components/Card';
import { cx } from '@/lib/cx';

/** The shared Card with 16px padding, which suits the 390px phone frame. */
export function PhoneCard({ className, ...rest }: CardProps) {
  return <Card padded={false} className={cx('p-4', className)} {...rest} />;
}

/** Section heading used on the talent phone screens. */
export function SectionHeading({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cx('m-0 text-[17px] font-semibold leading-snug text-ink', className)}>
      {children}
    </h2>
  );
}

/**
 * An agent label that reads as one sentence, for example
 * "Drafted by your Coach Agent from Emirati career records · you decide".
 * It matches the shared AiNote, which always puts " · " straight after the
 * agent name and so cannot carry words after it.
 */
export function AgentLine({
  before,
  agent,
  after,
  decides,
  className,
}: {
  before?: ReactNode;
  agent: AgentName;
  after?: ReactNode;
  decides: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx('m-0 inline-flex items-start gap-1.5 text-[13px] leading-snug text-ink2', className)}>
      <Bot aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-ink2" strokeWidth={2} />
      <span>
        {before ? <>{before} </> : null}
        <span className="font-semibold text-ink">{agent}</span>
        {after ? <> {after}</> : null} · {decides}
      </span>
    </p>
  );
}

/** A button that reads as a text link, for actions that stay on the page. */
export const LinkButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function LinkButton(
  { className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex min-h-touch items-center gap-1.5 rounded-control text-start text-[15px] font-medium text-accent underline-offset-2 hover:text-accent-hover hover:underline',
        className,
      )}
      {...rest}
    />
  );
});

/** A read-only value, for example a Support level or a fit tier. */
export function ValuePill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-line bg-ground px-3 py-1 text-[13px] font-semibold leading-tight text-ink">
      {children}
    </span>
  );
}

/** A 36px icon tile at the start of a list row. Decorative. */
export function IconTile({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-line2 text-ink">
      {children}
    </span>
  );
}
