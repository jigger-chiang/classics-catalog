"use client";

import Link from "next/link";
import { ScoredRecommendation } from "@/lib/recommendation";
import { CARD_HEIGHT, IMAGE_SIZE_PERCENTAGE, MAX_VISIBLE_INGREDIENTS } from "@/lib/constants";
import { ImageOff } from "lucide-react";
import { useMemo, useState } from "react";

type ScoredCocktailCardProps = {
  recommendation: ScoredRecommendation;
};

export function ScoredCocktailCard({ recommendation }: ScoredCocktailCardProps) {
  const { cocktail, score } = recommendation;
  const [imageError, setImageError] = useState(false);
  
  const imageSrc = useMemo(() => {
    if (!cocktail.id || cocktail.id.length < 3) return undefined;
    const idPrefix = cocktail.id.slice(0, 3);
    const slug = cocktail.slug || "";
    return `/cocktails/${idPrefix}-${slug}.png`;
  }, [cocktail.id, cocktail.slug]);

  const tags = [
    cocktail.method,
    cocktail.body_level,
    cocktail.base_spirit,
  ].filter(Boolean);

  // If ingredients >= MAX_VISIBLE_INGREDIENTS, show only first (MAX-1) and replace the rest with "..."
  const hasMoreIngredients = cocktail.ingredients.length >= MAX_VISIBLE_INGREDIENTS;
  const visibleCount = hasMoreIngredients ? MAX_VISIBLE_INGREDIENTS - 1 : cocktail.ingredients.length;
  const visibleIngredients = cocktail.ingredients.slice(0, visibleCount);

  const cardContent = (
    <article style={{ height: `${CARD_HEIGHT}px` }} className="group relative flex min-w-[360px] flex-row gap-4 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 to-black p-4 shadow-2xl ring-1 ring-white/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/25 hover:ring-white/25 hover:shadow-xl sm:p-5">
      {/* Score badge */}
      <div className="absolute right-3 top-3 z-10 rounded-full bg-amber-400/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30">
        {score} pts
      </div>

      {/* Image - Square that autoscales based on available space */}
      <div style={{ width: `${IMAGE_SIZE_PERCENTAGE}%` }} className="relative aspect-square shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        {!imageError && imageSrc ? (
          <img
            src={imageSrc}
            alt={cocktail.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-black text-sm text-zinc-400">
            <ImageOff className="h-4 w-4 text-zinc-500" />
          </div>
        )}
      </div>

      {/* Content on right - about 2/3 width */}
      <div className="flex flex-1 flex-col justify-between gap-2 overflow-hidden">
        <div className="flex flex-col gap-2 min-h-0">
          {/* Title */}
          <h3 className="text-xl font-semibold text-white sm:text-2xl">{cocktail.name}</h3>

          {/* Ingredients list */}
          {cocktail.ingredients.length > 0 && (
            <ul className="flex flex-col gap-0.5 overflow-hidden">
              {visibleIngredients.map((ingredient, idx) => (
                <li key={idx} className="text-xs text-zinc-300 leading-tight">
                  {ingredient}
                </li>
              ))}
              {hasMoreIngredients && (
                <li className="text-xs text-zinc-400 leading-tight italic">
                  ...
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Tags at bottom */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 sm:text-sm shrink-0">
            {tags.map((tag, idx) => (
              <span key={idx} className="flex items-center">
                {tag}
                {idx < tags.length - 1 && (
                  <span className="mx-1.5 text-zinc-500">•</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );

  return (
    <Link href={`/cocktails/${cocktail.slug}`} className="block h-full">
      {cardContent}
    </Link>
  );
}

