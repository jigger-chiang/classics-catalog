"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Sticky back button header for cocktail detail page
 * Uses glassmorphism effect and router.back() for history navigation
 */
export function StickyBackHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-amber-100 transition-all duration-200 ease-in-out hover:bg-white/10 hover:scale-110"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" />
          <span>Back</span>
        </button>
      </div>
    </header>
  );
}

