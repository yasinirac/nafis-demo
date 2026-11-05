import { useCallback, useEffect, useRef } from 'react';

/**
 * Move focus to `target` whenever `key` changes, so focus is not lost when
 * the control that was pressed is replaced by its result. It compares with
 * the previous key, so StrictMode's double effect run never steals focus on
 * the first render.
 */
export function useFocusOnChange(key: string | number | boolean, target: { current: HTMLElement | null }) {
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    target.current?.focus();
  }, [key, target]);
}

/**
 * A callback ref for "the element that should take focus in this state".
 * Attach it to the one element rendered for the current state; when `key`
 * changes, focus moves there.
 */
export function useFocusTarget(key: string | number | boolean) {
  const target = useRef<HTMLElement | null>(null);
  useFocusOnChange(key, target);
  return useCallback((el: HTMLElement | null) => {
    target.current = el;
  }, []);
}
