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
 * Converts text to a URL-safe slug by:
 * - Converting to lowercase
 * - Removing accents (Normalize NFD -> Remove Diacritics)
 * - Replacing spaces with hyphens
 * - Removing non-alphanumeric characters (except hyphens)
 * 
 * Examples:
 * - "Vieux Carré" -> "vieux-carre"
 * - "Champs-Élysées" -> "champs-elysees"
 * - "Old Fashioned" -> "old-fashioned"
 * 
 * Use this function to generate slugs from names when the CSV slug column is missing or messy.
 * For best reliability, ensure image files are named to match the slug (e.g., vieux-carre.jpg).
 */
export function toSlug(text: string): string {
  if (!text) return "";
  
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Split accented characters (é -> e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars (except hyphens)
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

/**
 * Generates all possible image path variations for a cocktail
 * 
 * Strategy:
 * 1. Primary: Uses normalized slug (recommended - files should be named vieux-carre.jpg)
 * 2. Fallback: Uses encoded name (handles files named with original name like "Vieux Carré.jpg")
 * 
 * Tries both hyphen and underscore versions, and both .jpg and .jpeg extensions.
 * 
 * Image Path Formats:
 * - Normalized: /cocktails/{idPrefix}-{normalized-slug}.{ext}
 * - Encoded: /cocktails/{idPrefix}-{encoded-name}.{ext}
 * 
 * Recommendation: For best reliability, rename image files to match the normalized slug format
 * (e.g., if slug is "vieux-carre", name the file "001-vieux-carre.jpg").
 * This ensures consistent matching regardless of special characters in the original name.
 */
export function getImagePathVariations(id: string, slug: string, name?: string): string[] {
  if (!id || id.length < 3) return [];
  
  const idPrefix = id.slice(0, 3);
  const variations: string[] = [];
  const extensions = [".jpg", ".jpeg"];
  
  // Strategy 1: Normalized slug paths (recommended - files should match slug)
  const normalizedSlug = toSlug(slug || "");
  if (normalizedSlug) {
    const slugLower = normalizedSlug.toLowerCase();
    const slugWithHyphens = slugLower;
    const slugWithUnderscores = slugLower.replace(/-/g, "_");
    
    // If slug already has hyphens, try hyphen version first, then underscore version
    if (slugLower.includes("-")) {
      extensions.forEach(ext => {
        variations.push(`/cocktails/${idPrefix}-${slugWithHyphens}${ext}`);
      });
      extensions.forEach(ext => {
        variations.push(`/cocktails/${idPrefix}-${slugWithUnderscores}${ext}`);
      });
    } 
    // If slug has underscores, try underscore version first, then hyphen version
    else if (slugLower.includes("_")) {
      extensions.forEach(ext => {
        variations.push(`/cocktails/${idPrefix}-${slugWithUnderscores}${ext}`);
      });
      extensions.forEach(ext => {
        variations.push(`/cocktails/${idPrefix}-${slugWithHyphens}${ext}`);
      });
    }
    // If slug has neither, just try the original with both extensions
    else {
      extensions.forEach(ext => {
        variations.push(`/cocktails/${idPrefix}-${slugWithHyphens}${ext}`);
      });
    }
  }
  
  // Strategy 2: Encoded name paths (fallback - handles files named with original name)
  // Only add if name is provided and different from slug
  if (name && name !== slug) {
    const encodedName = encodeURIComponent(name);
    extensions.forEach(ext => {
      variations.push(`/cocktails/${idPrefix}-${encodedName}${ext}`);
    });
  }
  
  return variations;
}

