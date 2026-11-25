"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Martini } from "lucide-react";
import { getImagePathVariations } from "@/lib/utils";

type CocktailPhotoProps = {
  cocktail: { id: string; slug: string; name: string };
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Cocktail photo that fills its (relative, sized) parent.
 * Tries each possible file name in turn and falls back to a martini glass.
 */
export function CocktailPhoto({ cocktail, sizes, priority = false, className = "" }: CocktailPhotoProps) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const candidates = useMemo(
    () => getImagePathVariations(cocktail.id, cocktail.slug, cocktail.name),
    [cocktail.id, cocktail.slug, cocktail.name],
  );
  const src = candidates[candidateIndex];

  if (failed || !src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-panel ${className}`}>
        <Martini className="h-6 w-6 text-dim" strokeWidth={1.25} aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={cocktail.name}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-cover ${className}`}
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((i) => i + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
