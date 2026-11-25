"use client";

import { RefObject, useLayoutEffect, useState } from "react";

/**
 * Returns true when the element's content is taller than its visible box,
 * i.e. something is actually being cut off. Re-checks whenever the element
 * or its content resizes (window width, font loading, data changes).
 *
 * Pass enabled=false to pause measuring (e.g. while a clamp is lifted);
 * the last measured value is kept.
 */
export function useIsOverflowing<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled: boolean = true,
): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const check = () => {
      // 1px tolerance for sub-pixel rounding
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return isOverflowing;
}
