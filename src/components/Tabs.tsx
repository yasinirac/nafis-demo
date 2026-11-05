import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { useDomId } from '@/lib/useId';

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps<T extends string> {
  /** Accessible name of the tab list. */
  label: string;
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  variant?: 'underline' | 'pill';
  className?: string;
  panelClassName?: string;
  /** Stretch tabs to equal widths (useful on phone screens). */
  fill?: boolean;
  /** sm: tighter padding and 13px labels, for three or more tabs in a phone frame. */
  size?: 'md' | 'sm';
}

/**
 * ARIA tabs with a roving tabindex. Arrow keys move between tabs and select
 * them; Home and End jump to the first and last tab.
 */
export function Tabs<T extends string>({ label, tabs, value, onChange, variant = 'underline', className, panelClassName, fill, size = 'md' }: TabsProps<T>) {
  const base = useDomId('tabs');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const index = Math.max(0, tabs.findIndex((t) => t.id === value));

  function focusAt(i: number) {
    const next = (i + tabs.length) % tabs.length;
    const tab = tabs[next];
    if (!tab) return;
    onChange(tab.id);
    refs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusAt(tabs.length - 1);
    }
  }

  const active = tabs[index];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className={cx(
          'flex gap-1',
          variant === 'underline' ? 'border-b border-line' : 'flex-wrap rounded-control bg-line2 p-1',
          fill ? 'w-full' : 'flex-wrap',
        )}
      >
        {tabs.map((tab, i) => {
          const selected = i === index;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={onKeyDown}
              className={cx(
                'min-h-touch font-medium leading-tight transition-colors',
                size === 'sm' ? 'px-2 text-[13px]' : 'px-3 text-sm',
                fill && 'flex-1',
                variant === 'underline'
                  ? cx(
                      '-mb-px border-b-2 py-2',
                      selected ? 'border-accent text-ink' : 'border-transparent text-ink2 hover:text-accent',
                    )
                  : cx('rounded-control py-1.5', selected ? 'bg-surface text-ink shadow-sm ring-1 ring-accent' : 'text-ink2 hover:bg-surface'),
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {active ? (
        <div
          role="tabpanel"
          id={`${base}-panel-${active.id}`}
          aria-labelledby={`${base}-tab-${active.id}`}
          tabIndex={0}
          className={cx('pt-4 focus-visible:rounded-control', panelClassName)}
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}
