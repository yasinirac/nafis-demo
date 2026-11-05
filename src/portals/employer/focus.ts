/**
 * Move focus to an element without leaving it under the sticky top bar.
 * Scrolls only when the element is out of view or covered by the bar, so a
 * focus move next to the control the person just used does not jump.
 */
export function focusInView(el: HTMLElement | null | undefined): void {
  if (!el) return;
  el.focus({ preventScroll: true });
  const rect = el.getBoundingClientRect();
  const bar = document.querySelector<HTMLElement>('header.sticky');
  const barBottom = bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
  if (rect.top < barBottom + 8 || rect.bottom > window.innerHeight - 8) {
    el.scrollIntoView({ block: 'center' });
  }
}
