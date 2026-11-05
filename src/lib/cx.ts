import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind-aware class merging: when a component's base classes and a
 * className override set the same property (for example two text colours),
 * the override wins regardless of CSS order. The design system's custom
 * utility names are registered so they merge too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{ rounded: ['card', 'control'] }],
      'min-h': [{ 'min-h': ['touch'] }],
      'min-w': [{ 'min-w': ['touch'] }],
      'max-w': [{ 'max-w': ['content'] }],
      'font-family': [{ font: ['heading', 'arabic', 'arabic-heading'] }],
    },
  },
});

/** Join class names, skipping falsy values, and resolve Tailwind conflicts. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return twMerge(parts.filter(Boolean).join(' '));
}
