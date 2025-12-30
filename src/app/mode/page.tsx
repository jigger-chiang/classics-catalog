"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { getCocktails, type Cocktail } from "@/lib/google-sheets";
import { getIngredientFamily } from "@/lib/recommendation";
import { getImagePathVariations, toSlug } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { ImageOff } from "lucide-react";

type Intensity = "Light" | "Medium" | "Heavy" | "Any";
type FlavorProfile = "Fizzy" | "Sour/Sweet" | "Bittersweet" | "Any";

export default function ModePage() {
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>("Any");
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorProfile>("Any");
  const [allCocktails, setAllCocktails] = useState<Cocktail[]>([]);
  const [results, setResults] = useState<Cocktail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cocktails on mount
  useEffect(() => {
    getCocktails().then((cocktails) => {
      setAllCocktails(cocktails);
    });
  }, []);

  // Filter cocktails based on selected vibe
  const filterByVibe = (cocktails: Cocktail[]): Cocktail[] => {
    return cocktails.filter((cocktail) => {
      // Intensity filter (Body Level)
      const matchesIntensity =
        selectedIntensity === "Any" ||
        cocktail.body_level.toLowerCase().trim() === selectedIntensity.toLowerCase();

      if (!matchesIntensity) return false;

      // Flavor Profile filter
      if (selectedFlavor === "Any") return true;

      const ingredientFamilies = cocktail.ingredients.map((ing) =>
        getIngredientFamily(ing),
      );

      switch (selectedFlavor) {
        case "Fizzy":
          return ingredientFamilies.includes("CARBONATED");
        case "Sour/Sweet":
          return ingredientFamilies.includes("ACID");
        case "Bittersweet":
          return (
            ingredientFamilies.includes("AMARO_APERITIF") ||
            ingredientFamilies.includes("VERMOUTH_FORTIFIED")
          );
        default:
          return true;
      }
    });
  };

  const handleShake = () => {
    setIsLoading(true);
    
    // Filter cocktails
    const filtered = filterByVibe(allCocktails);
    
    // Shuffle array (Fisher-Yates algorithm)
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Take top 3
    const top3 = shuffled.slice(0, 3);
    
    // Simulate a brief delay for better UX
    setTimeout(() => {
      setResults(top3);
      setIsLoading(false);
    }, 300);
  };

  return (
    <>
      <style>{`
        .vibe-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(251, 191, 36);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .vibe-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(251, 191, 36);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .vibe-slider::-ms-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(251, 191, 36);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-12 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <header className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-200" />
              <h1 className="text-3xl font-bold text-white">Vibe Check</h1>
            </div>
            <p className="max-w-2xl text-lg text-zinc-300">
              Pick your vibe and we&apos;ll recommend 3 cocktails that match your mood.
            </p>
          </header>

          {/* Vibe Selection Card */}
          <section className="rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl">
            {/* Intensity Selector with Slider */}
            <div className="mb-8">
              <div className="mb-4 text-base font-bold text-white">Mood</div>
              <div className="relative">
                {/* Labels */}
                <div className="mb-4 flex justify-between">
                  {(["Any", "Light", "Medium", "Heavy"] as Intensity[]).map((intensity) => {
                    return (
                      <div
                        key={intensity}
                        className="flex cursor-pointer flex-col items-center gap-1"
                        onClick={() => setSelectedIntensity(intensity)}
                      >
                        <span className="text-sm font-medium text-zinc-300">
                          {intensity === "Medium" ? "Med." : intensity}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={selectedIntensity === "Any" ? 0 : selectedIntensity === "Light" ? 1 : selectedIntensity === "Medium" ? 2 : 3}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const intensities: Intensity[] = ["Any", "Light", "Medium", "Heavy"];
                      setSelectedIntensity(intensities[val]);
                    }}
                    className="vibe-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700"
                    style={{
                      background: (() => {
                        const value = selectedIntensity === "Any" ? 0 : selectedIntensity === "Light" ? 1 : selectedIntensity === "Medium" ? 2 : 3;
                        const percentage = (value / 3) * 100;
                        return `linear-gradient(to right, rgb(251, 191, 36) 0%, rgb(251, 191, 36) ${percentage}%, rgb(63, 63, 70) ${percentage}%, rgb(63, 63, 70) 100%)`;
                      })(),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Flavor Profile with Radio Buttons */}
            <div className="mb-8">
              <div className="mb-4 text-base font-bold text-white">Flavor</div>
              <div className="flex gap-6">
                {(["Any", "Fizzy", "Sour/Sweet", "Bittersweet"] as FlavorProfile[]).map((flavor) => {
                  const labels = {
                    Fizzy: "Sparkling",
                    "Sour/Sweet": "Sour Mix",
                    Bittersweet: "Bitter Sweet",
                    Any: "Any",
                  };
                  const active = selectedFlavor === flavor;
                  return (
                    <label
                      key={flavor}
                      className="flex cursor-pointer flex-col items-center gap-2"
                    >
                      <span className="text-sm font-medium text-zinc-300">{labels[flavor]}</span>
                      <div className="relative h-5 w-5">
                        <input
                          type="radio"
                          name="flavor"
                          value={flavor}
                          checked={active}
                          onChange={() => setSelectedFlavor(flavor)}
                          className="absolute h-5 w-5 cursor-pointer appearance-none rounded-full border-2 transition-colors"
                          style={{
                            backgroundColor: active ? "rgb(251, 191, 36)" : "transparent",
                            borderColor: active ? "rgb(251, 191, 36)" : "rgb(82, 82, 91)",
                          }}
                        />
                        {active && (
                          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Shake Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleShake}
                disabled={isLoading}
                className="rounded-lg bg-black px-8 py-3 text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Shaking..." : "Shake it!"}
              </button>
            </div>
          </section>

        {/* Results */}
        {results.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-6 text-2xl font-bold text-white">Your Recommendations</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {results.map((cocktail) => (
                <div key={cocktail.id} className="w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)]">
                  <VibeCard cocktail={cocktail} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  );
}

// Vibe Card Component
function VibeCard({ cocktail }: { cocktail: Cocktail }) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const imageCandidates = useMemo(() => {
    return getImagePathVariations(cocktail.id, cocktail.slug, cocktail.name);
  }, [cocktail.id, cocktail.slug, cocktail.name]);

  const imageSrc = imageCandidates.length > 0 ? imageCandidates[candidateIndex] : undefined;

  // Top 3 ingredients
  const topIngredients = cocktail.ingredients.slice(0, 3);

  // Description text
  const description = cocktail.story || "";
  // Approximate check: 3 lines at ~50 chars per line = ~150 chars
  const isDescriptionLong = description.length > 150;

  return (
    <Link
      href={`/cocktails/${toSlug(cocktail.name)}`}
      className="group flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 to-black p-5 shadow-2xl ring-1 ring-white/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/25 hover:ring-white/25 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        {!imageError && imageSrc ? (
          <Image
            src={imageSrc}
            alt={cocktail.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
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
            <ImageOff className="h-6 w-6 text-zinc-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3">
        <h3 className="text-xl font-semibold text-white">{cocktail.name}</h3>

        {/* Ingredients Section - Fixed height with gradient mask */}
        <div className="relative h-[6rem] overflow-hidden">
          <div>
            {topIngredients.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {topIngredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-400">No ingredients listed</p>
            )}
          </div>
          {/* Gradient mask for fade-out effect */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        {/* Description - Line clamped to 3 lines */}
        {description && (
          <div className="flex-1">
            <p
              className={`text-sm leading-relaxed text-zinc-300 ${
                showFullDescription ? "" : "line-clamp-3"
              }`}
            >
              {description}
            </p>
            {isDescriptionLong && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="mt-1 text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                {showFullDescription ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
