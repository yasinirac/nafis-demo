import { cx } from '@/lib/cx';

/**
 * A dark, read-only code panel in Roboto Mono. Wide lines scroll inside the
 * panel, which is a focusable region so keyboard users can scroll it too.
 * Comment lines or tails (after `--` in SQL, or lines starting with `#`)
 * render in the muted code colour.
 */
export function CodePanel({
  label,
  lines,
  comment = '#',
  className,
}: {
  /** Accessible name of the scroll region. */
  label: string;
  lines: string[];
  comment?: '#' | '--';
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cx('max-w-full overflow-x-auto rounded-control bg-code-bg', className)}
    >
      <pre className="m-0 w-max min-w-full px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-code-ink">
        <code>
          {lines.map((line, i) => (
            <CodeLine key={i} line={line} comment={comment} />
          ))}
        </code>
      </pre>
    </div>
  );
}

function commentIndex(line: string, comment: '#' | '--'): number {
  if (comment === '#') return line.trimStart().startsWith('#') ? line.indexOf('#') : -1;
  let inString = false;
  for (let i = 0; i < line.length - 1; i++) {
    if (line[i] === "'") inString = !inString;
    if (!inString && line[i] === '-' && line[i + 1] === '-') return i;
  }
  return -1;
}

function CodeLine({ line, comment }: { line: string; comment: '#' | '--' }) {
  const at = commentIndex(line, comment);
  if (at < 0) return <span className="block min-h-[1.7em]">{line}</span>;
  return (
    <span className="block min-h-[1.7em]">
      {line.slice(0, at)}
      <span className="text-code-muted">{line.slice(at)}</span>
    </span>
  );
}
