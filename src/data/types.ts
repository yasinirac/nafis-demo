/**
 * Shared data types. Every figure on screen comes from src/data and carries
 * a status so a reader can tell published facts from sample data.
 */

export type DataStatus = 'published' | 'sample' | 'estimate' | 'provisional' | 'illustrative';

export const statusLabels: Record<DataStatus, string> = {
  published: 'Published',
  sample: 'Sample',
  estimate: 'Estimate',
  provisional: 'Provisional',
  illustrative: 'Illustrative',
};

export const statusDescriptions: Record<DataStatus, string> = {
  published: 'A figure that has been published, with its date.',
  sample: 'Fictional sample data made up for this concept.',
  estimate: 'A model estimate, not a count.',
  provisional: 'A count that may still be revised.',
  illustrative: 'An illustrative figure that shows how the screen would work.',
};

export interface Figure<T = number> {
  value: T;
  status: DataStatus;
  /** Preformatted text when the plain value would mislead, for example "190,000+". */
  display?: string;
  asOf?: string;
  note?: string;
}

export function fig<T>(value: T, status: DataStatus, extra: Omit<Figure<T>, 'value' | 'status'> = {}): Figure<T> {
  return { value, status, ...extra };
}

/** Data tiers used by the policy engine. */
export type Tier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4';

export const tierLabels: Record<Tier, string> = {
  T0: 'T0 public',
  T1: 'T1 internal aggregates',
  T2: 'T2 pseudonymised',
  T3: 'T3 identified',
  T4: 'T4 sensitive',
};

/** Support levels, in the fixed order used across the platform. */
export type SupportLevel = 'Accelerate' | 'Grow' | 'Stabilise' | 'Support';
export const supportLevels: SupportLevel[] = ['Accelerate', 'Grow', 'Stabilise', 'Support'];

/** Fit tiers shown to employers instead of any number about a person. */
export type FitTier = 'Strong' | 'Good' | 'Stretch' | 'Cannot assess';

export type Tone = 'good' | 'warning' | 'critical' | 'accent' | 'neutral';
