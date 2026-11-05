/** Formatting helpers. They format values; they never hold figures. */

const grouping = new Intl.NumberFormat('en-US');

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatInt(value: number): string {
  return grouping.format(Math.round(value));
}

export function formatAED(value: number): string {
  return `AED ${grouping.format(value)}`;
}

export function formatAEDRange(min: number, max: number): string {
  return `AED ${grouping.format(min)}–${grouping.format(max)}`;
}

export function formatPct(value: number, digits = 0): string {
  return `${formatNumber(value, digits)}%`;
}

/** Signed percentage, using a true minus sign. */
export function formatSignedPct(value: number, digits = 0): string {
  const text = formatNumber(Math.abs(value), digits);
  if (value > 0) return `+${text}%`;
  if (value < 0) return `−${text}%`;
  return `${text}%`;
}

/** Compact axis label: 0 / 50K / 100K. */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1000000) return `${formatNumber(value / 1000000, value % 1000000 === 0 ? 0 : 1)}M`;
  if (Math.abs(value) >= 10000) return `${formatNumber(value / 1000, 0)}K`;
  return grouping.format(value);
}

/** Replace {key} tokens in a template with values. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
