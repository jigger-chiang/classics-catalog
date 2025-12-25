"use client";

import { useEffect } from "react";

/**
 * Scrolls to top when the detail page component mounts
 * This ensures the page always starts at the top, regardless of browser scroll position memory
 * Disables browser's automatic scroll restoration to prevent it from overriding our scroll command
 */
export function DetailPageScrollToTop() {
  useEffect(() => {
    // 1. Disable browser's default scroll restoration
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Force scroll to top with a tiny delay to beat the browser's race condition
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);

    // 3. Cleanup: Re-enable auto restoration when leaving this page
    return () => {
      if (typeof window !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }
      clearTimeout(timer);
    };
  }, []); // Run once on mount

  return null;
}

