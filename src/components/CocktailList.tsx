"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import CocktailCard from "./CocktailCard";
import { INITIAL_COCKTAIL_COUNT, COCKTAILS_PER_PAGE } from "@/lib/constants";
import { Cocktail } from "@/lib/google-sheets";
import { Loader2 } from "lucide-react";

type CocktailListProps = {
  cocktails: Cocktail[];
};

export function CocktailList({ cocktails }: CocktailListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COCKTAIL_COUNT);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const visibleCocktails = useMemo(
    () => cocktails.slice(0, visibleCount),
    [cocktails, visibleCount],
  );
  
  const hasMore = useMemo(
    () => visibleCount < cocktails.length,
    [visibleCount, cocktails.length],
  );

  // Set up IntersectionObserver to detect when sentinel becomes visible
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Use ref to check loading state to avoid dependency issues
        if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
          isLoadingRef.current = true;
          setIsLoading(true);
          
          // Load more cocktails with a small delay for better UX
          setTimeout(() => {
            setVisibleCount((prev) => {
              const newCount = Math.min(prev + COCKTAILS_PER_PAGE, cocktails.length);
              isLoadingRef.current = false;
              setIsLoading(false);
              return newCount;
            });
          }, 100);
        }
      },
      {
        root: null,
        rootMargin: "100px", // Start loading 100px before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, [hasMore, cocktails.length]);

  // Reset visible count when cocktails list changes (e.g., filter applied)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(INITIAL_COCKTAIL_COUNT);
    isLoadingRef.current = false;
    setIsLoading(false);
  }, [cocktails]);

  if (cocktails.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {visibleCocktails.map((cocktail, index) => (
          <CocktailCard 
            key={cocktail.id} 
            cocktail={cocktail} 
            priority={index < 2}
          />
        ))}
      </div>
      
      {/* Sentinel element for IntersectionObserver */}
      {hasMore && (
        <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      )}
      
      {/* Loading spinner */}
      {isLoading && hasMore && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-200" />
        </div>
      )}
    </>
  );
}

