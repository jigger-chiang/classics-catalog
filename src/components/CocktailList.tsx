"use client";

import { useState, useMemo, useCallback } from "react";
import CocktailCard from "./CocktailCard";
import { INITIAL_COCKTAIL_COUNT, COCKTAILS_PER_PAGE } from "@/lib/constants";
import { Cocktail } from "@/lib/google-sheets";

type CocktailListProps = {
  cocktails: Cocktail[];
};

export function CocktailList({ cocktails }: CocktailListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COCKTAIL_COUNT);

  const visibleCocktails = useMemo(
    () => cocktails.slice(0, visibleCount),
    [cocktails, visibleCount],
  );
  
  const hasMore = useMemo(
    () => visibleCount < cocktails.length,
    [visibleCount, cocktails.length],
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + COCKTAILS_PER_PAGE, cocktails.length));
  }, [cocktails.length]);

  if (cocktails.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {visibleCocktails.map((cocktail) => (
          <CocktailCard key={cocktail.id} cocktail={cocktail} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:border-white/30 hover:bg-white/10 hover:scale-105 hover:shadow-lg"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}

