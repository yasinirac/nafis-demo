import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Whether an element is wider than its box (it scrolls sideways). Used to
 * make a scroll region a tab stop only when there is something to scroll.
 */
export function useOverflow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const child = el.firstElementChild;
    if (child) ro.observe(child);
    return () => ro.disconnect();
  }, []);
  return [ref, overflowing] as const;
}
