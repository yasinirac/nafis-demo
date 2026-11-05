import { useId } from 'react';

/** A DOM-safe id with a readable prefix. */
export function useDomId(prefix: string): string {
  const raw = useId();
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}
