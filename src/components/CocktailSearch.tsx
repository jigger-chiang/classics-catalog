"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { getCocktails, type Cocktail } from "@/lib/google-sheets";
import { toSlug } from "@/lib/utils";

export function CocktailSearch({ 
  cocktails: initialCocktails,
  onFilterClick,
}: { 
  cocktails?: Cocktail[];
  onFilterClick?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Cocktail[]>([]);
  const [cocktails, setCocktails] = useState<Cocktail[]>(initialCocktails || []);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBox = useRef<HTMLDivElement>(null);

  // Initialize search query from URL parameter when URL changes
  useEffect(() => {
    const queryParam = searchParams.get("q") || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(queryParam);
  }, [searchParams]);

  useEffect(() => {
    if (!cocktails.length && !initialCocktails?.length) {
      getCocktails().then((c) => setCocktails(c));
    }
  }, [cocktails.length, initialCocktails?.length]);

  useEffect(() => {
    if (!showSuggestions) return;
    const onClick = (e: MouseEvent) => {
      if (suggestionBox.current && !suggestionBox.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showSuggestions]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cocktails?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  }, [searchQuery, router]);

  const handleSelect = useCallback((slug: string) => {
    setSearchQuery("");
    setShowSuggestions(false);
    router.push(`/cocktails/${slug}`);
  }, [router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 0) {
      const q = value.toLowerCase();
      const filtered = cocktails.filter((c) =>
        c.name.toLowerCase().includes(q) || c.ingredients.join(", ").toLowerCase().includes(q)
      );
      setSuggestions(filtered.slice(0, 7));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [cocktails]);


  return (
    <form autoComplete="off" onSubmit={handleSearch} className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Find A Cocktail"
          className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 pr-12 text-sm text-white placeholder:text-zinc-400 transition-all duration-200 ease-in-out focus:border-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-300/30 focus:bg-white/10"
          onFocus={() => { if (searchQuery) setShowSuggestions(true); }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onFilterClick?.();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-amber-200 transition-all duration-200 ease-in-out hover:bg-white/10 hover:scale-110"
          aria-label="Filter"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionBox}
            className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-auto rounded-2xl border border-amber-100/20 bg-zinc-950 py-2 shadow-xl backdrop-blur-sm"
          >
            {suggestions.map((cocktail) => (
              <button
                key={cocktail.id}
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-all duration-200 ease-in-out first:rounded-t-2xl last:rounded-b-2xl hover:bg-amber-100/10"
                onClick={() => handleSelect(toSlug(cocktail.name))}
              >
                <span className="truncate font-medium text-amber-100">{cocktail.name}</span>
                <span className="ml-auto truncate text-xs text-zinc-300">
                  {cocktail.ingredients.slice(0, 3).join(", ")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

