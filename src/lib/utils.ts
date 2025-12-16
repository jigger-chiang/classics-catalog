/**
 * Utility functions for the application
 */

/**
 * Converts URL search param value to string array
 */
export function toArray(
  value: string | string[] | undefined,
): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

/**
 * Converts URL search param value to string
 */
export function toString(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * Case-insensitive string comparison
 */
export function caseInsensitiveEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Case-insensitive string includes check
 */
export function caseInsensitiveIncludes(
  text: string,
  search: string,
): boolean {
  return text.toLowerCase().includes(search.toLowerCase());
}

/**
 * Removes common articles from the beginning of a string for sorting purposes
 * Articles: "The ", "A ", "An "
 */
export function removeArticlesForSorting(name: string): string {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  
  if (lower.startsWith("the ")) {
    return trimmed.slice(4).trim();
  }
  if (lower.startsWith("a ")) {
    return trimmed.slice(2).trim();
  }
  if (lower.startsWith("an ")) {
    return trimmed.slice(3).trim();
  }
  
  return trimmed;
}

/**
 * Sorts an array of cocktails alphabetically by name, ignoring articles
 */
export function sortCocktailsByName(cocktails: Array<{ name: string }>): Array<{ name: string }> {
  return [...cocktails].sort((a, b) => {
    const nameA = removeArticlesForSorting(a.name).toLowerCase();
    const nameB = removeArticlesForSorting(b.name).toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Generates all possible image path variations for a cocktail
 * Tries both hyphen and underscore versions of the slug
 */
export function getImagePathVariations(id: string, slug: string): string[] {
  if (!id || id.length < 3) return [];
  
  const idPrefix = id.slice(0, 3);
  const slugLower = (slug || "").toLowerCase();
  const slugWithHyphens = slugLower;
  const slugWithUnderscores = slugLower.replace(/-/g, "_");
  
  const variations: string[] = [];
  
  // If slug already has hyphens, try hyphen version first, then underscore version
  if (slugLower.includes("-")) {
    variations.push(`/cocktails/${idPrefix}-${slugWithHyphens}.png`);
    variations.push(`/cocktails/${idPrefix}-${slugWithUnderscores}.png`);
  } 
  // If slug has underscores, try underscore version first, then hyphen version
  else if (slugLower.includes("_")) {
    variations.push(`/cocktails/${idPrefix}-${slugWithUnderscores}.png`);
    variations.push(`/cocktails/${idPrefix}-${slugWithHyphens}.png`);
  }
  // If slug has neither, just try the original
  else {
    variations.push(`/cocktails/${idPrefix}-${slugWithHyphens}.png`);
  }
  
  return variations;
}

