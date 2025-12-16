/**
 * Filtering utilities for cocktails
 */

import { Cocktail } from "./google-sheets";
import { Filters } from "@/components/FilterModal";
import { caseInsensitiveEqual, caseInsensitiveIncludes } from "./utils";

/**
 * Filters cocktails based on provided filter criteria
 */
export function filterCocktails(
  cocktails: Cocktail[],
  filters: Filters,
  searchQuery?: string,
): Cocktail[] {
  return cocktails.filter((cocktail) => {
    // Base spirit filter
    const matchesBase =
      !filters.base || filters.base.length === 0
        ? true
        : filters.base.some((b) =>
            caseInsensitiveEqual(cocktail.base_spirit, b),
          );

    // Body level filter
    const matchesBody =
      !filters.body || filters.body.length === 0
        ? true
        : filters.body.some((b) =>
            caseInsensitiveEqual(cocktail.body_level, b),
          );

    // Method filter
    const matchesMethod =
      !filters.method || filters.method.length === 0
        ? true
        : filters.method.some((m) =>
            caseInsensitiveEqual(cocktail.method, m),
          );

    // Ingredients filter
    const matchesIngredients =
      !filters.ingredients || filters.ingredients.length === 0
        ? true
        : filters.ingredients.some((ing) =>
            cocktail.ingredients.some((cIng) =>
              caseInsensitiveEqual(cIng, ing),
            ),
          );

    // Glassware filter
    const matchesGlassware =
      !filters.glassware || filters.glassware.length === 0
        ? true
        : filters.glassware.some((g) =>
            caseInsensitiveEqual(cocktail.glassware, g),
          );

    // Search query filter
    const query = searchQuery?.trim();
    const matchesQuery = !query
      ? true
      : caseInsensitiveIncludes(
          [
            cocktail.name,
            cocktail.story,
            cocktail.base_spirit,
            cocktail.ingredients.join(" "),
          ].join(" "),
          query,
        );

    return (
      matchesBase &&
      matchesBody &&
      matchesMethod &&
      matchesIngredients &&
      matchesGlassware &&
      matchesQuery
    );
  });
}

/**
 * Checks if any filters are active
 */
export function hasActiveFilters(filters: Filters): boolean {
  return Object.values(filters).some(
    (value) => Array.isArray(value) && value.length > 0,
  );
}

