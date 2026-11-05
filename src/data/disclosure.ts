import { fig } from './types';

/**
 * Statistical disclosure rules, shared by every screen that reports groups of
 * people. One source so the analyst workbench, the developer samples, the
 * public tables and the monthly pack never drift apart.
 */
export const disclosureRules = {
  /** Internal and employer views hide groups smaller than this. */
  minGroup: fig(10, 'illustrative'),
  /** Internal totals round to this so a hidden cell cannot be worked out. */
  internalRoundTo: fig(100, 'illustrative'),
  /** Public tables round to this. */
  publicRoundTo: fig(10, 'illustrative'),
  /** Public tables hide cells under this. */
  publicMinCell: fig(20, 'illustrative'),
};
