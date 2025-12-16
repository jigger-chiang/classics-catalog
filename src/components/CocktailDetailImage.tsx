"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { Cocktail } from "@/lib/google-sheets";
import { ImageOff } from "lucide-react";

export function CocktailDetailImage({ cocktail }: { cocktail: Cocktail }) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const candidates = useMemo(() => {
    const slug = (cocktail.slug || "placeholder").toLowerCase();
    const slugUnderscore = slug.replace(/-/g, "_");
    const idPrefix = cocktail.id ? `${cocktail.id}-` : "";
    return [
      `/cocktails/${idPrefix}${slug}.png`,
      `/cocktails/${idPrefix}${slugUnderscore}.png`,
    ];
  }, [cocktail.id, cocktail.slug]);

  const imageSrc = candidates.length > 0 ? candidates[candidateIndex] : undefined;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-zinc-900">
      {!imageError && imageSrc ? (
        <Image
          src={imageSrc}
          alt={cocktail.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
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

