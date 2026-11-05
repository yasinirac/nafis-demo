import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Users } from 'lucide-react';
import { cx } from '@/lib/cx';
import { useDomId } from '@/lib/useId';
import { personaById, personas, type PersonaId } from '@/data/platform';

/**
 * Demo role switcher. It replaces sign-in: there is no login anywhere in the
 * concept. Each entry is a link to the screen that persona uses.
 */
export function RoleSwitcher({
  current,
  tone = 'light',
  compact = false,
}: {
  current: PersonaId | null;
  tone?: 'light' | 'dark';
  /** Phone widths: show "View as" and keep the persona name for screen readers only. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useDomId('roles');
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const currentPersona = current ? personaById(current) : null;

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          'inline-flex min-h-touch items-center gap-2 rounded-control border px-3 text-sm font-medium',
          tone === 'light' ? 'border-control bg-surface text-accent hover:bg-accent-tint' : 'border-white/60 bg-transparent text-white hover:bg-white/10',
        )}
      >
        <Users aria-hidden="true" className="h-4 w-4" />
        <span>
          <span className="sr-only">Demo role switcher. </span>View as
          {currentPersona ? <span className={compact ? 'sr-only' : undefined}>{`: ${currentPersona.name}`}</span> : null}
        </span>
        <ChevronDown aria-hidden="true" className={cx('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <div
          id={id}
          className="fixed inset-x-4 top-20 z-50 max-h-[70vh] overflow-y-auto rounded-card border border-line bg-surface p-2 text-ink shadow-lg sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-[340px]"
        >
          <p className="m-0 px-2 pb-2 pt-1 text-[13px] leading-snug text-ink2">
            Demo role switcher. There is no sign-in in this concept; pick a persona to see their screen.
          </p>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {personas.map((p, i) => (
              <li key={p.id}>
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  to={p.path}
                  aria-current={p.id === current ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                  className={cx(
                    'flex min-h-touch flex-col justify-center rounded-control px-2 py-1.5 no-underline hover:bg-accent-tint',
                    p.id === current && 'bg-accent-tint',
                  )}
                >
                  <span className="text-sm font-semibold text-ink">{p.name}</span>
                  <span className="text-[13px] text-ink2">{p.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
