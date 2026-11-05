import { Info } from 'lucide-react';
import { cx } from '@/lib/cx';
import { conceptNotice } from '@/data/platform';

/**
 * The persistent concept notice. Every page shows it in a sticky header.
 * The test suite looks for data-testid="concept-chip".
 */
export function ConceptChip({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <p
      data-testid="concept-chip"
      className={cx(
        'm-0 inline-flex max-w-full items-start gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] leading-tight',
        tone === 'light' ? 'border-line bg-surface text-ink2' : 'border-white/30 bg-transparent text-white',
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
      <span>{conceptNotice}</span>
    </p>
  );
}
