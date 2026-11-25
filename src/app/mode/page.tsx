"use client";

import { useState, useEffect } from "react";
import { getCocktails, type Cocktail } from "@/lib/google-sheets";
import { getIngredientFamily } from "@/lib/recommendation";
import { CocktailCard } from "@/components/CocktailCard";
import { EmptyGlassQuestion } from "@/components/icons/EmptyGlassQuestion";

type Intensity = "Light" | "Medium" | "Heavy" | "Any";
type FlavorProfile = "Fizzy" | "Sour/Sweet" | "Bittersweet" | "Any";

export default function ModePage() {
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>("Any");
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorProfile>("Any");
  const [allCocktails, setAllCocktails] = useState<Cocktail[]>([]);
  const [results, setResults] = useState<Cocktail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasShaken, setHasShaken] = useState(false);

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
      setHasShaken(true);
      setIsLoading(false);
    }, 300);
  };

  const intensities: Intensity[] = ["Any", "Light", "Medium", "Heavy"];
  const intensityIndex = intensities.indexOf(selectedIntensity);
  const fillPercent = (intensityIndex / (intensities.length - 1)) * 100;
  const flavorLabels: Record<FlavorProfile, string> = {
    Any: "Any",
    Fizzy: "Sparkling",
    "Sour/Sweet": "Sour Mix",
    Bittersweet: "Bitter Sweet",
  };

  return (
    <>
      <style>{`
        .vibe-slider { -webkit-appearance: none; appearance: none; height: 28px; background: transparent; }
        .vibe-slider::-webkit-slider-runnable-track { height: 1px; background: var(--track); }
        .vibe-slider::-moz-range-track { height: 1px; background: var(--track); }
        .vibe-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; margin-top: -7px;
          width: 15px; height: 15px; border-radius: 50%;
          background: #0d0d0c; border: 1px solid #c7a66b; cursor: pointer;
        }
        .vibe-slider::-moz-range-thumb {
          width: 13px; height: 13px; border-radius: 50%;
          background: #0d0d0c; border: 1px solid #c7a66b; cursor: pointer;
        }
        .vibe-slider:focus-visible { outline: 1px solid #c7a66b; outline-offset: 4px; }
      `}</style>
      <div className="min-h-screen bg-ink px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="pt-6">
            <h1 className="font-serif text-[44px] font-normal italic leading-none">Vibe Check</h1>
            <p className="mt-3 max-w-xl font-serif text-[17px] leading-snug text-muted">
              Pick your vibe and we&apos;ll recommend 3 cocktails that match your mood.
            </p>
          </header>

          <section className="mt-7 flex flex-col gap-8 border-y border-gold/28 py-7">
            {/* Mood (body level) */}
            <div>
              <div className="mb-3 text-[10px] tracking-[0.22em] text-dim">MOOD</div>
              <div className="mb-1 flex justify-between">
                {intensities.map((intensity) => (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() => setSelectedIntensity(intensity)}
                    className={`font-serif text-lg transition-colors ${
                      selectedIntensity === intensity ? "text-gold" : "text-ivory/70 hover:text-ivory"
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
              <label htmlFor="mood" className="sr-only">Mood</label>
              <input
                id="mood"
                type="range"
                min="0"
                max="3"
                step="1"
                value={intensityIndex}
                onChange={(e) => setSelectedIntensity(intensities[parseInt(e.target.value)])}
                className="vibe-slider w-full cursor-pointer"
                style={{
                  ["--track" as string]: `linear-gradient(to right, #c7a66b ${fillPercent}%, rgba(199,166,107,0.28) ${fillPercent}%)`,
                }}
              />
            </div>

            {/* Flavor */}
            <fieldset>
              <legend className="mb-3 text-[10px] tracking-[0.22em] text-dim">FLAVOR</legend>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:flex sm:gap-10">
                {(["Any", "Fizzy", "Sour/Sweet", "Bittersweet"] as FlavorProfile[]).map((flavor) => {
                  const active = selectedFlavor === flavor;
                  return (
                    <label key={flavor} className="flex min-h-11 cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name="flavor"
                        value={flavor}
                        checked={active}
                        onChange={() => setSelectedFlavor(flavor)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="flex h-4 w-4 items-center justify-center rounded-full border border-gold/55 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold"
                      >
                        {active && <span className="h-2 w-2 rounded-full bg-gold" />}
                      </span>
                      <span className={`font-serif text-lg ${active ? "text-gold" : "text-ivory"}`}>
                        {flavorLabels[flavor]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleShake}
                disabled={isLoading || allCocktails.length === 0}
                className="h-12 min-w-44 border border-gold px-10 text-[12px] tracking-[0.3em] text-gold transition-colors hover:bg-gold/10 hover:text-gold-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "SHAKING…" : "SHAKE IT"}
              </button>
            </div>
          </section>

          {results.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3.5 font-serif text-[28px] font-normal italic text-ivory">Your Recommendations</h2>
              <div className="-mx-1 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                {results.map((cocktail) => (
                  <CocktailCard key={cocktail.id} cocktail={cocktail} />
                ))}
              </div>
            </section>
          )}

          {hasShaken && results.length === 0 && !isLoading && (
            <div className="mt-10 flex flex-col items-center gap-3 py-10 text-center">
              <EmptyGlassQuestion className="h-8 w-8 text-gold" />
              <p className="font-serif text-2xl text-ivory">Nothing matches this vibe</p>
              <p className="text-sm text-muted">Try another mood or flavor.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
