import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';

/**
 * Chart colours. They point at the CSS tokens, so set them through the
 * `style` prop (fill/stroke), never as SVG presentation attributes.
 * Teal (the action colour) is never used in charts.
 */
export const chartColors = {
  series1: 'var(--series-1)',
  series2: 'var(--series-2)',
  series3: 'var(--series-3)',
  muted: 'var(--series-muted)',
  warning: 'var(--warn-bar)',
  grid: 'var(--line)',
  grid2: 'var(--line-2)',
  axisText: 'var(--ink-2)',
  ink: 'var(--ink)',
  surface: 'var(--surface)',
  seq: ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)', 'var(--seq-5)'],
  ord: ['var(--ord-1)', 'var(--ord-2)', 'var(--ord-3)', 'var(--ord-4)'],
} as const;

/** Text colour inside a filled sequential/ordinal step: white only on the two darkest. */
export function textOnRamp(stepIndex: number, steps: number): string {
  return stepIndex >= steps - 2 ? '#ffffff' : 'var(--ink)';
}

/** Measure an element's content width and keep it current. */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.floor(el.getBoundingClientRect().width));
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w != null) setWidth(Math.floor(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export type Scale = (v: number) => number;

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

/** Round, human tick values covering [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const span = max - min;
  const raw = span / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const start = Math.ceil(min / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

/** Domain [0 or min, max] snapped outward to nice ticks. */
export function niceDomain(values: number[], includeZero = true, count = 5): { domain: [number, number]; ticks: number[] } {
  const finite = values.filter((v) => Number.isFinite(v));
  let min = finite.length ? Math.min(...finite) : 0;
  let max = finite.length ? Math.max(...finite) : 1;
  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  if (min === max) max = min + 1;
  const first = niceTicks(min, max, count);
  const step = first.length > 1 ? (first[1] as number) - (first[0] as number) : 1;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  return { domain: [lo, hi], ticks: niceTicks(lo, hi, count) };
}

/**
 * Path for a bar with a 4px rounded data end and a square baseline end.
 * orientation 'up' grows upward from the baseline; 'right' grows rightward.
 */
export function barPath(x: number, y: number, w: number, h: number, orientation: 'up' | 'right', radius = 4): string {
  if (w <= 0 || h <= 0) return '';
  if (orientation === 'up') {
    const r = Math.min(radius, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  const r = Math.min(radius, h / 2, w);
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

/** Roving focus for a row of chart hover targets: one tab stop, arrow keys move. */
export function useRoving(count: number) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusIndex, setFocusIndex] = useState(0);

  function move(to: number) {
    const next = Math.max(0, Math.min(count - 1, to));
    setFocusIndex(next);
    refs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(index + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      move(count - 1);
    }
  }

  return {
    refs,
    focusIndex,
    setFocusIndex,
    onKeyDown,
    tabIndexFor: (i: number) => (i === Math.min(focusIndex, count - 1) ? 0 : -1),
  };
}

/** Rough text width for 12–13px Roboto, used to decide whether a label fits inside a mark. */
export function estimateTextWidth(text: string, fontSize = 12): number {
  return text.length * fontSize * 0.56;
}
