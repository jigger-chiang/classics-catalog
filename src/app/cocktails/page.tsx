import { CocktailSearchWithFilter } from "@/components/CocktailSearchWithFilter";
import { CocktailList } from "@/components/CocktailList";
import { Filters } from "@/components/FilterModal";
import { DEFAULT_CSV_URL } from "@/lib/constants";
import { filterCocktails, hasActiveFilters } from "@/lib/filter";
import {
  getCocktailsWithSource,
  getFilterOptions,
} from "@/lib/google-sheets";
import { toArray, toString } from "@/lib/utils";
import { Frown, Info, X } from "lucide-react";
import Link from "next/link";
import type { SearchParams } from "@/types";

export default async function CocktailsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = await Promise.resolve(searchParams ?? {});

  const filters: Filters = {
    base: toArray(params.base),
    body: toArray(params.body),
    method: toArray(params.method),
    ingredients: toArray(params.ingredients),
    glassware: toArray(params.glassware),
  };

  const searchQuery = toString(params.q);

  const csvUrl = process.env.NEXT_PUBLIC_COCKTAIL_CSV_URL ?? DEFAULT_CSV_URL;
  const { cocktails, source } = await getCocktailsWithSource(csvUrl);
  const filterOptions = await getFilterOptions();

  const filtered = filterCocktails(cocktails, filters, searchQuery);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-10 md:px-10">
      <header className="mx-auto flex max-w-5xl flex-col gap-4">
        <div>
          <CocktailSearchWithFilter
            cocktails={cocktails}
            filterOptions={filterOptions}
            initialFilters={filters}
          />
        </div>
      </header>

      <section className="mx-auto mt-8 max-w-5xl">
        {source === "fallback" && (
          <div className="mb-4 flex items-start gap-3 rounded-3xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-50">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
            <div>
              <p className="font-semibold text-amber-50">Showing sample cocktails</p>
              <p className="text-amber-100">
                Couldn&apos;t read the sheet data. Check the CSV URL or network; using
                fallback list so you can still browse.
              </p>
            </div>
          </div>
        )}

        <div className="mb-5 flex items-center justify-between text-sm text-zinc-400">
          <span>
            Showing {filtered.length} of {cocktails.length} cocktails
            {searchQuery && ` for "${searchQuery}"`}
          </span>
          {hasActiveFilters(filters) && (
            <Link
              href="/cocktails"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white transition-all duration-200 ease-in-out hover:bg-white/10 hover:scale-105"
            >
              <span>Filters active</span>
              <X className="h-3 w-3" />
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-300">
            <Frown className="h-8 w-8 text-amber-200" />
            <p className="text-lg font-semibold text-white">No cocktails found</p>
            <p className="text-sm text-zinc-400">
              Try adjusting your filters or clearing the search.
            </p>
          </div>
        ) : (
          <CocktailList cocktails={filtered} />
        )}
      </section>
    </div>
  );
}

