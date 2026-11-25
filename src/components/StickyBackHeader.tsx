"use client";

import { useRouter } from "next/navigation";

/**
 * Detail page header: back on the left, the cocktail's number in the middle.
 * Goes back in history when there is one, otherwise to the list.
 */
export function StickyBackHeader({ label }: { label?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/cocktails");
  };

  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center px-1.5 sm:px-4">
        <button
          onClick={handleBack}
          className="flex h-11 w-11 items-center justify-center text-ivory transition-colors hover:text-gold"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        {label && (
          <span className="absolute left-1/2 -translate-x-1/2 font-serif text-[17px] italic text-gold">{label}</span>
        )}
      </div>
    </header>
  );
}
