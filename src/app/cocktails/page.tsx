import { CocktailSearchWithFilter } from "@/components/CocktailSearchWithFilter";
import { CocktailList } from "@/components/CocktailList";
import { BaseSpiritTabs } from "@/components/BaseSpiritTabs";
import { Filters } from "@/components/FilterModal";
import { DEFAULT_CSV_URL } from "@/lib/constants";
import { filterCocktails, hasActiveFilters } from "@/lib/filter";
import {
  getCocktailsWithSource,
  getFilterOptions,
} from "@/lib/google-sheets";
import { toArray, toString } from "@/lib/utils";
import { EmptyGlassQuestion } from "@/components/icons/EmptyGlassQuestion";
import Link from "next/link";
import type { SearchParams } from "@/types";

export default async function CocktailsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : (searchParams ?? {});
  const params = resolvedSearchParams;

  const filters: Filters = {
    base: toArray(params.base),
    body: toArray(params.body),
    method: toArray(params.method),
    ingredients: toArray(params.ingredients),
  };

  const searchQuery = toString(params.q);

  const csvUrl = process.env.NEXT_PUBLIC_COCKTAIL_CSV_URL ?? DEFAULT_CSV_URL;
  const { cocktails, source } = await getCocktailsWithSource(csvUrl);
  const filterOptions = await getFilterOptions();

  const filtered = filterCocktails(cocktails, filters, searchQuery);

  // A single base spirit is already shown by the tabs; anything more counts as "filtered"
  const extraFilters =
    !!searchQuery ||
    (filters.base?.length ?? 0) > 1 ||
    hasActiveFilters({ ...filters, base: [] });

  return (
    <div className="min-h-screen bg-ink px-5 pb-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="pt-6">
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-[44px] font-normal italic leading-none">Classics</h1>
            <span className="font-serif text-base text-muted">
              {filtered.length === cocktails.length ? `${cocktails.length} 款` : `${filtered.length} / ${cocktails.length} 款`}
            </span>
          </div>
          <div className="mt-[18px]">
            <CocktailSearchWithFilter
              cocktails={cocktails}
              filterOptions={filterOptions}
              initialFilters={filters}
            />
          </div>
          <BaseSpiritTabs filters={filters} searchQuery={searchQuery} />
        </header>

        {(extraFilters || source === "fallback") && (
          <div className="mt-4 flex flex-col gap-3">
            {source === "fallback" && (
              <p className="border border-gold/30 px-4 py-3 text-sm text-muted">
                <span className="text-ivory">Showing sample cocktails.</span> Couldn&apos;t read the sheet
                data, so a fallback list is shown.
              </p>
            )}
            {extraFilters && (
              <div className="flex items-center justify-between gap-3 text-[13px] text-muted">
                <span className="truncate">
                  {searchQuery ? <>Results for “<span className="text-ivory">{searchQuery}</span>”</> : "Filters applied"}
                </span>
                <Link href="/cocktails" className="shrink-0 text-[11px] tracking-[0.2em] text-gold hover:text-gold-light">
                  CLEAR ×
                </Link>
              </div>
            )}
          </div>
        )}

        <section className="mt-[18px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 border-y border-gold/30 px-6 py-14 text-center">
              <EmptyGlassQuestion className="h-8 w-8 text-gold" />
              <p className="font-serif text-2xl text-ivory">No cocktails found</p>
              <p className="text-sm text-muted">Try adjusting your filters or clearing the search.</p>
            </div>
          ) : (
            <CocktailList cocktails={filtered} />
          )}
        </section>
      </div>
    </div>
  );
}
