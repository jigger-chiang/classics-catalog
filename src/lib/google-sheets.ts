import Papa from "papaparse";

export type Cocktail = {
  id: string;
  name: string;
  slug: string;
  base_spirit: string;
  ingredients: string[];
  body_level: string;
  method: string;
  glassware: string;
  story: string;
  related_ids: string[];
};

import { DEFAULT_CSV_URL, FILTER_OPTIONS_CSV_URL } from "./constants";
import { sortCocktailsByName, toSlug } from "./utils";

// Cache duration: 60 seconds
const CACHE_REVALIDATE = 60;

// Small set of rows used when the real sheet is not available yet.
const FALLBACK_CSV = `id,name,slug,base_spirit,ingredients,body_level,method,glassware,image_url,story,related_ids
101,Old Fashioned,old-fashioned,Whisky,\"Rye Whisky, Bitters, Sugar\",Heavy,Stir,Old Fashioned,https://images.unsplash.com/photo-1544145945-f90425340c7b,\"A timeless classic with rye, bitters, and a touch of sweetness.\",102
102,Negroni,negroni,Gin,\"Gin, Campari, Sweet Vermouth\",Medium,Stir,Rocks,https://images.unsplash.com/photo-1527169402691-feff5539e52c,\"A balanced bitter-sweet aperitivo that never goes out of style.\",101
103,Margarita,margarita,Tequila,\"Tequila, Triple Sec, Lime\",Light,Shake,Coupe,https://images.unsplash.com/photo-1581501967821-02c8daa2d3e1,\"Bright, zesty, and perfect to start the night.\",`;

export type CocktailsResult = {
  cocktails: Cocktail[];
  source: "sheet" | "fallback";
};

/**
 * Parses CSV string into Cocktail objects
 */
function parseCSV(csv: string): Cocktail[] {
  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  }) as { data: Record<string, string>[] };

  const cocktails = data
    .filter((row: Record<string, string>) => Object.keys(row).length > 0)
    .map((row: Record<string, string>) => {
      const name = row.name?.trim() ?? "";
      const rawSlug = row.slug?.trim() ?? "";
      // Use slug from CSV if available and not empty, otherwise generate from name
      // This ensures we always have a valid slug for routing and image paths
      const slug = rawSlug || toSlug(name);
      
      return {
        id: row.id?.trim() ?? "",
        name,
        slug,
        base_spirit: row.base_spirit?.trim() ?? "",
        ingredients: row.ingredients
          ? row.ingredients
              .split(",")
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [],
        body_level: row.body_level?.trim() ?? "",
        method: row.method?.trim() ?? "",
        glassware: row.glassware?.trim() ?? "",
        story: row.story?.trim() ?? "",
        related_ids: row.related_ids
          ? row.related_ids
              .split(",")
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [],
      };
    })
    .filter(
      (cocktail: Cocktail) => cocktail.id && cocktail.name && cocktail.slug,
    );

  // Sort cocktails alphabetically by name, ignoring articles (The, A, An)
  return sortCocktailsByName(cocktails) as Cocktail[];
}

/**
 * Fetches CSV content from a URL with caching
 * Uses Next.js fetch caching with revalidation
 */
async function fetchCSV(url: string): Promise<string> {
  const response = await fetch(url, { 
    next: { revalidate: CACHE_REVALIDATE },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

/**
 * Get cocktails with source information
 * Uses Next.js fetch caching (60s revalidation) - fetch automatically caches by URL
 */
export async function getCocktailsWithSource(
  csvUrl: string = DEFAULT_CSV_URL,
): Promise<CocktailsResult> {
  try {
    const csv = await fetchCSV(csvUrl);
    const parsed = parseCSV(csv);
    console.info(
      "[cocktails] fetched sheet",
      csvUrl,
      "rows:",
      parsed.length,
      "first:",
      parsed[0]?.name,
    );
    if (parsed.length === 0) {
      console.warn("Fetched CSV was empty; using fallback sample data");
      return { cocktails: parseCSV(FALLBACK_CSV), source: "fallback" };
    }
    return { cocktails: parsed, source: "sheet" };
  } catch (error) {
    console.warn("Falling back to local cocktail CSV mock", error);
    return { cocktails: parseCSV(FALLBACK_CSV), source: "fallback" };
  }
}

export async function getCocktails(csvUrl: string = DEFAULT_CSV_URL) {
  const result = await getCocktailsWithSource(csvUrl);
  return result.cocktails;
}

/**
 * Get a single cocktail by slug, with caching
 * This function accepts allCocktails to avoid duplicate fetching
 */
export async function getCocktailBySlug(
  slug: string,
  allCocktails?: Cocktail[]
): Promise<Cocktail | undefined> {
  if (allCocktails) {
    return allCocktails.find((cocktail) => cocktail.slug === slug);
  }
  const cocktails = await getCocktails();
  return cocktails.find((cocktail) => cocktail.slug === slug);
}

export async function getRecommendations(relatedIds: string[]) {
  const cocktails = await getCocktails();
  const idSet = new Set(relatedIds);
  return cocktails.filter((cocktail) => idSet.has(cocktail.id));
}


export type FilterOptions = {
  base_spirit: string[];
  ingredients: string[];
  method: string[];
  body_level: string[];
};

/**
 * Get filter options
 * Uses Next.js fetch caching (60s revalidation) - fetch automatically caches by URL
 */
export async function getFilterOptions(
  csvUrl: string = FILTER_OPTIONS_CSV_URL,
): Promise<FilterOptions> {
  try {
    const csv = await fetchCSV(csvUrl);
    const { data } = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    }) as { data: Record<string, string>[] };

    const options: FilterOptions = {
      base_spirit: [],
      ingredients: [],
      method: [],
      body_level: [],
    };

    data.forEach((row: Record<string, string>) => {
      if (row.base_spirit?.trim()) {
        options.base_spirit.push(row.base_spirit.trim());
      }
      if (row.ingredients?.trim()) {
        options.ingredients.push(row.ingredients.trim());
      }
      if (row.method?.trim()) {
        options.method.push(row.method.trim());
      }
      if (row.body_level?.trim()) {
        options.body_level.push(row.body_level.trim());
      }
    });

    // Remove duplicates and sort
    options.base_spirit = Array.from(new Set(options.base_spirit)).sort();
    options.ingredients = Array.from(new Set(options.ingredients)).sort();
    options.method = Array.from(new Set(options.method)).sort();
    options.body_level = Array.from(new Set(options.body_level)).sort();

    return options;
  } catch (error) {
    console.warn("Failed to fetch filter options, using empty arrays", error);
    return {
      base_spirit: [],
      ingredients: [],
      method: [],
      body_level: [],
    };
  }
}

