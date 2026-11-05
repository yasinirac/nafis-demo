import { useState, type ReactNode } from 'react';
import { ConceptChip } from '@/app/ConceptChip';
import { RoleSwitcher } from '@/app/RoleSwitcher';
import { PlatformMapLink, SkipLink } from '@/app/TopBar';
import { publicMeta, publicNav } from '@/data/publicStats';
import { useDomId } from '@/lib/useId';

/** Scroll to an in-page section and move focus to it (HashRouter owns the URL hash). */
function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
}

function DemoControls() {
  return (
    <>
      <RoleSwitcher tone="dark" current="visitor" />
      <PlatformMapLink tone="dark" />
    </>
  );
}

/**
 * Page shell for the public statistics site: a dark strip with the concept
 * notice, the role switcher and the Platform map link, then a plain site
 * header with in-page navigation and the planned Arabic edition.
 * Like the portal shells, the concept notice stays on screen while scrolling;
 * on phones only the notice row is sticky and the controls row scrolls away.
 */
export function PublicShell({ children }: { children: ReactNode }) {
  const [arabicOpen, setArabicOpen] = useState(false);
  const noteId = useDomId('arabic-note');
  return (
    <div className="min-h-screen bg-ground">
      <SkipLink />
      <div role="region" aria-label={publicMeta.noticeLabel} className="sticky top-0 z-40 bg-ink">
        <div className="mx-auto flex max-w-[1248px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
          <ConceptChip tone="dark" />
          <div className="ms-auto hidden flex-wrap items-center gap-2 sm:flex">
            <DemoControls />
          </div>
        </div>
      </div>
      <header className="border-b border-line bg-surface">
        <div className="flex flex-wrap items-center gap-2 bg-ink px-4 pb-2 sm:hidden">
          <DemoControls />
        </div>
        <div className="mx-auto flex max-w-[1248px] flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
          <p className="m-0 py-2 font-heading text-[15px] font-bold leading-tight text-ink">{publicMeta.brand}</p>
          <nav aria-label={publicMeta.navLabel} className="min-w-0">
            <ul className="m-0 -ms-3 flex list-none flex-wrap gap-x-1 p-0 sm:ms-0">
              {publicNav.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(item.id)}
                    className="inline-flex min-h-touch items-center rounded-control px-3 text-sm font-medium text-accent hover:bg-accent-tint hover:text-accent-hover"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            lang="ar"
            aria-expanded={arabicOpen}
            aria-controls={noteId}
            onClick={() => setArabicOpen((v) => !v)}
            className="-ms-3 inline-flex min-h-touch items-center rounded-control px-3 font-arabic text-[15px] font-semibold text-accent hover:bg-accent-tint hover:text-accent-hover sm:ms-auto"
          >
            {/* dir sits on the text, not the button, so the button's logical margins follow the page. */}
            <span dir="rtl">{publicMeta.arabicControl}</span>
          </button>
        </div>
        <div id={noteId} role="status" className="mx-auto max-w-[1248px] px-4 sm:px-6">
          {arabicOpen ? (
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-control bg-line2 px-4 py-3 text-sm text-ink">
              <p className="m-0">{publicMeta.arabicNote}</p>
              <p lang="ar" dir="rtl" className="m-0 font-arabic">
                {publicMeta.arabicNoteAr}
              </p>
            </div>
          ) : null}
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto flex max-w-[1248px] flex-col gap-6 px-4 pb-12 pt-8 focus:outline-none sm:px-6">
        {children}
      </main>
      <footer className="border-t border-line bg-surface">
        <p className="mx-auto my-0 max-w-[1248px] px-4 py-5 text-[13px] leading-relaxed text-ink2 sm:px-6">{publicMeta.footer}</p>
      </footer>
    </div>
  );
}
