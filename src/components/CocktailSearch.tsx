"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
    <form autoComplete="off" onSubmit={handleSearch} role="search" className="relative">
      <div className="flex h-12 items-center gap-3 border-b border-gold/55">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-muted" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <label htmlFor="cocktail-search" className="sr-only">Search cocktails or ingredients</label>
        <input
          id="cocktail-search"
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search cocktails or ingredients"
          className="min-w-0 flex-1 bg-transparent font-serif text-[17px] text-ivory placeholder:text-dim focus:outline-none"
          onFocus={() => { if (searchQuery) setShowSuggestions(true); }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onFilterClick?.();
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-end text-gold transition-colors hover:text-gold-light"
          aria-label="Filter"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
        </button>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionBox}
          className="absolute left-0 right-0 z-40 mt-1 max-h-72 overflow-auto border border-gold/30 bg-panel py-1"
        >
          {suggestions.map((cocktail) => (
            <button
              key={cocktail.id}
              type="button"
              className="flex w-full items-baseline gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gold/10"
              onClick={() => handleSelect(toSlug(cocktail.name))}
            >
              <span className="truncate font-serif text-lg text-ivory">{cocktail.name}</span>
              <span className="ml-auto truncate font-serif text-sm text-muted">
                {cocktail.ingredients.slice(0, 3).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
