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
  COMPLEXITY_PENALTY: 15, // Penalty for ingredient count difference >= 2
  // Note: Tags scoring can be added here when data is populated
  // TAG_MATCH: TBD, // Optional: Tags matching (future-proofing)
} as const;

/**
 * Minimum similarity score threshold for recommendations
 * Recommendations below this score are filtered out to ensure quality
 * It's better to return fewer high-quality recommendations than to show irrelevant matches
 */
const MIN_SCORE_THRESHOLD = 50;

/**
 * Type for score breakdown items
 */
export type ScoreBreakdownItem = {
  reason: string;
  points: number;
};

/**
 * Type for similarity score result with breakdown
 */
export type SimilarityScoreResult = {
  score: number;
  breakdown: ScoreBreakdownItem[];
};

/**
 * Calculates similarity score between two cocktails
 * Focuses on liquid composition and drinking structure, not glassware
 * Prioritizes "Cocktail Structure" over "Base Spirit"
 * Returns both the score and a breakdown of contributing factors
 */
export function calculateSimilarityScore(
  current: Cocktail,
  candidate: Cocktail,
): SimilarityScoreResult {
  let score = 0;
  const breakdown: ScoreBreakdownItem[] = [];

  // Base Spirit Match: +20 points
  // Note: Reduced weight to encourage spirit exploration
  if (
    current.base_spirit.toLowerCase().trim() ===
    candidate.base_spirit.toLowerCase().trim()
  ) {
    score += SCORING_WEIGHTS.BASE_SPIRIT;
    breakdown.push({
      reason: "Base Spirit",
      points: SCORING_WEIGHTS.BASE_SPIRIT,
    });
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
    // Special case: "Stir + Light" gets reduced bonus (too broad, covers watered-down spirits and wine-based cocktails)
    const method = current.method.toLowerCase().trim();
    const body = current.body_level.toLowerCase().trim();
    if (method === "stir" && body === "light") {
      const points = 20; // Reduced bonus for Stir + Light
      score += points;
      breakdown.push({
        reason: "Structure Synergy (Stir + Light)",
        points,
      });
    } else {
      score += SCORING_WEIGHTS.STRUCTURE_SYNERGY_BONUS; // Full bonus for other combinations
      breakdown.push({
        reason: "Structure Synergy",
        points: SCORING_WEIGHTS.STRUCTURE_SYNERGY_BONUS,
      });
    }
  } else {
    // Individual attribute matches (only if synergy not met)
    if (methodMatches) {
      score += SCORING_WEIGHTS.METHOD_ONLY;
      breakdown.push({
        reason: "Method Match",
        points: SCORING_WEIGHTS.METHOD_ONLY,
      });
    }
    if (bodyMatches) {
      score += SCORING_WEIGHTS.BODY_ONLY;
      breakdown.push({
        reason: "Body Level Match",
        points: SCORING_WEIGHTS.BODY_ONLY,
      });
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

  if (matchingIngredients > 0) {
    const points = matchingIngredients * SCORING_WEIGHTS.INGREDIENT_MATCH;
    score += points;
    breakdown.push({
      reason: `Ingredient Match x${matchingIngredients}`,
      points,
    });
  }

  // Complexity Penalty: Penalize large ingredient count differences
  // A simple 2-ingredient drink is rarely a good substitute for a 4-ingredient cocktail
  const ingredientDiff = Math.abs(
    current.ingredients.length - candidate.ingredients.length,
  );
  if (ingredientDiff >= 2) {
    score -= SCORING_WEIGHTS.COMPLEXITY_PENALTY;
    breakdown.push({
      reason: "Complexity Mismatch",
      points: -SCORING_WEIGHTS.COMPLEXITY_PENALTY,
    });
  }

  // Glassware is intentionally NOT scored
  // Different glassware types should not affect similarity
  // (e.g., Moscow Mule in Copper Mug vs Gin Buck in Highball are structurally identical)

  // Future-proofing: Tags scoring (optional, when data is populated)
  // if (current.tags && candidate.tags) {
  //   // Implement tags matching logic here
  // }

  return { score, breakdown };
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
    .map((cocktail) => {
      const scoreResult = calculateSimilarityScore(currentCocktail, cocktail);
      return {
        cocktail,
        score: scoreResult.score,
      };
    })
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 6) // Get top 6
    .map((item) => item.cocktail);

  return scoredCocktails;
}

/**
 * Type for recommendations with scores and breakdown
 */
export type ScoredRecommendation = {
  cocktail: Cocktail;
  score: number;
  breakdown: ScoreBreakdownItem[];
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
      .map((cocktail) => {
        const scoreResult = calculateSimilarityScore(currentCocktail, cocktail);
        return {
          cocktail,
          score: scoreResult.score,
          breakdown: scoreResult.breakdown,
        };
      });

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
      .map((cocktail) => {
        const scoreResult = calculateSimilarityScore(currentCocktail, cocktail);
        return {
          cocktail,
          score: scoreResult.score,
          breakdown: scoreResult.breakdown,
        };
      })
      .sort((a, b) => b.score - a.score);

    for (const rec of calculatedRecs) {
      if (result.length >= 6) break;
      result.push(rec);
      usedIds.add(rec.cocktail.id);
    }
  }

  // Sort all results by score (priority) descending
  const sortedResults = result.sort((a, b) => b.score - a.score);

  // Apply minimum score threshold: filter out low-scoring recommendations
  // Strict policy: do not backfill with low-scoring items even if we have fewer than 6
  // It's better to return fewer high-quality recommendations than to show irrelevant matches
  const filteredResults = sortedResults.filter(
    (item) => item.score >= MIN_SCORE_THRESHOLD,
  );

  // Return top 6 (or fewer if filtered results have less)
  return filteredResults.slice(0, 6);
}

