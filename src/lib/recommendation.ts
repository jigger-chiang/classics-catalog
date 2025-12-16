/**
 * Content-Based Recommendation System
 * Calculates cocktail similarity based on attributes and ingredients
 */

import { Cocktail } from "./google-sheets";

/**
 * Scoring weights for similarity calculation
 * Note: Glassware is intentionally excluded to avoid false negatives
 * (e.g., Moscow Mule in Copper Mug vs Gin Buck in Highball are structurally identical)
 */
const SCORING_WEIGHTS = {
  BASE_SPIRIT: 20, // Base spirit match - encourages exploring different spirits
  INGREDIENT_MATCH: 20, // Per matching ingredient - shared ingredients are strong flavor bridges
  STRUCTURE_SYNERGY_BONUS: 40, // Bonus when method AND body_level both match (the "vibe")
  METHOD_ONLY: 5, // Method match only (if synergy not met)
  BODY_ONLY: 10, // Body match only (if synergy not met)
  // Note: Tags scoring can be added here when data is populated
  // TAG_MATCH: TBD, // Optional: Tags matching (future-proofing)
} as const;

/**
 * Calculates similarity score between two cocktails
 * Focuses on liquid composition and drinking structure, not glassware
 * Prioritizes "Cocktail Structure" over "Base Spirit"
 */
export function calculateSimilarityScore(
  current: Cocktail,
  candidate: Cocktail,
): number {
  let score = 0;

  // Base Spirit Match: +20 points
  // Note: Reduced weight to encourage spirit exploration
  if (
    current.base_spirit.toLowerCase().trim() ===
    candidate.base_spirit.toLowerCase().trim()
  ) {
    score += SCORING_WEIGHTS.BASE_SPIRIT;
  }

  // Structure Synergy Bonus: Check if method AND body_level both match
  // This groups similar "styles" like Spirit-Forward drinks (Stirred & Heavy)
  const methodMatches =
    current.method.toLowerCase().trim() === candidate.method.toLowerCase().trim();
  const bodyMatches =
    current.body_level.toLowerCase().trim() ===
    candidate.body_level.toLowerCase().trim();

  if (methodMatches && bodyMatches) {
    // Structure Synergy: Both method and body match - grant high bonus
    // This is our primary way of grouping similar cocktail styles
    score += SCORING_WEIGHTS.STRUCTURE_SYNERGY_BONUS;
  } else {
    // Individual attribute matches (only if synergy not met)
    if (methodMatches) {
      score += SCORING_WEIGHTS.METHOD_ONLY;
    }
    if (bodyMatches) {
      score += SCORING_WEIGHTS.BODY_ONLY;
    }
  }

  // Ingredient Overlap: +20 points for EACH matching ingredient
  // Shared ingredients (like Vermouth or Bitters) are strong flavor bridges
  const currentIngredients = new Set(
    current.ingredients.map((ing) => ing.toLowerCase().trim()),
  );
  const candidateIngredients = new Set(
    candidate.ingredients.map((ing) => ing.toLowerCase().trim()),
  );

  // Count matching ingredients
  let matchingIngredients = 0;
  for (const ingredient of currentIngredients) {
    if (candidateIngredients.has(ingredient)) {
      matchingIngredients++;
    }
  }

  score += matchingIngredients * SCORING_WEIGHTS.INGREDIENT_MATCH;

  // Glassware is intentionally NOT scored
  // Different glassware types should not affect similarity
  // (e.g., Moscow Mule in Copper Mug vs Gin Buck in Highball are structurally identical)

  // Future-proofing: Tags scoring (optional, when data is populated)
  // if (current.tags && candidate.tags) {
  //   // Implement tags matching logic here
  // }

  return score;
}

/**
 * Gets calculated recommendations based on similarity scoring
 * Returns top 6 similar cocktails excluding the current one
 */
export function getCalculatedRecommendations(
  currentCocktail: Cocktail,
  allCocktails: Cocktail[],
): Cocktail[] {
  // Filter out the current cocktail and calculate scores
  const scoredCocktails = allCocktails
    .filter((cocktail) => cocktail.id !== currentCocktail.id)
    .map((cocktail) => ({
      cocktail,
      score: calculateSimilarityScore(currentCocktail, cocktail),
    }))
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 6) // Get top 6
    .map((item) => item.cocktail);

  return scoredCocktails;
}

/**
 * Type for recommendations with scores
 */
export type ScoredRecommendation = {
  cocktail: Cocktail;
  score: number;
};

/**
 * Hybrid recommendation strategy:
 * 1. First, fetch cocktails from manual related_ids
 * 2. If count < 6, fill remaining slots with algorithmic recommendations
 * 3. Exclude duplicates and ensure we return exactly up to 6 cocktails
 * 4. Returns scored recommendations sorted by priority (score descending)
 */
export function getHybridRecommendations(
  currentCocktail: Cocktail,
  allCocktails: Cocktail[],
  manualRelatedIds: string[],
): ScoredRecommendation[] {
  const result: ScoredRecommendation[] = [];
  const usedIds = new Set<string>([currentCocktail.id]);

  // Step 1: Add manually related cocktails (assign max priority score)
  if (manualRelatedIds.length > 0) {
    const idSet = new Set(manualRelatedIds);
    const manualRecommendations = allCocktails
      .filter((cocktail) => idSet.has(cocktail.id) && !usedIds.has(cocktail.id))
      .map((cocktail) => ({
        cocktail,
        score: calculateSimilarityScore(currentCocktail, cocktail),
      }));

    for (const rec of manualRecommendations) {
      if (result.length < 6) {
        result.push(rec);
        usedIds.add(rec.cocktail.id);
      }
    }
  }

  // Step 2: Fill remaining slots with algorithmic recommendations
  if (result.length < 6) {
    const calculatedRecs = allCocktails
      .filter((cocktail) => cocktail.id !== currentCocktail.id && !usedIds.has(cocktail.id))
      .map((cocktail) => ({
        cocktail,
        score: calculateSimilarityScore(currentCocktail, cocktail),
      }))
      .sort((a, b) => b.score - a.score);

    for (const rec of calculatedRecs) {
      if (result.length >= 6) break;
      result.push(rec);
      usedIds.add(rec.cocktail.id);
    }
  }

  // Sort all results by score (priority) descending
  return result.sort((a, b) => b.score - a.score);
}

