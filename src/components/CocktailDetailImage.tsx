"use client";

import { useState, useMemo } from "react";
import { Cocktail } from "@/lib/google-sheets";
import { getImagePathVariations } from "@/lib/utils";
import { ImageOff } from "lucide-react";

export function CocktailDetailImage({ cocktail }: { cocktail: Cocktail }) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const candidates = useMemo(() => {
    return getImagePathVariations(cocktail.id, cocktail.slug);
  }, [cocktail.id, cocktail.slug]);

  const imageSrc = candidates.length > 0 ? candidates[candidateIndex] : undefined;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-zinc-900">
      {!imageError && imageSrc ? (
        <img
          src={imageSrc}
          alt={cocktail.name}
          className="h-full w-full object-cover"
          onError={() => {
            if (candidateIndex < candidates.length - 1) {
              setCandidateIndex((i) => i + 1);
            } else {
              setImageError(true);
            }
          }}
        />
      ) : (
        <div className="flex h-full items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-black text-sm text-zinc-400">
          <ImageOff className="h-6 w-6 text-zinc-500" />
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
}

