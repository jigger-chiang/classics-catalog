"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scrolls to top when the pathname changes
 * This handles browser back/forward button navigation
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes (including browser back/forward)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use instant for better UX on navigation
    });
  }, [pathname]);

  return null;
}

