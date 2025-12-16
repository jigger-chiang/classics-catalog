"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { CARD_HEIGHT, IMAGE_SIZE_PERCENTAGE, MAX_VISIBLE_INGREDIENTS } from "@/lib/constants";
import { Cocktail } from "@/lib/google-sheets";
import { getImagePathVariations } from "@/lib/utils";
import { ImageOff } from "lucide-react";

export function CocktailCard({ 
  cocktail,
  priority = false,
}: { 
  cocktail: Cocktail;
  priority?: boolean;
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const imageCandidates = useMemo(() => {
    return getImagePathVariations(cocktail.id, cocktail.slug);
  }, [cocktail.id, cocktail.slug]);
  
  const imageSrc = imageCandidates.length > 0 ? imageCandidates[candidateIndex] : undefined;

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
      {/* Image - Square that autoscales based on available space */}
      <div style={{ width: `${IMAGE_SIZE_PERCENTAGE}%` }} className="relative aspect-square shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        {!imageError && imageSrc ? (
          <Image
            src={imageSrc}
            alt={cocktail.name}
            fill
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            onError={() => {
              if (candidateIndex < imageCandidates.length - 1) {
                setCandidateIndex((i) => i + 1);
              } else {
                setImageError(true);
              }
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
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400 shrink-0">
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

export default CocktailCard;

