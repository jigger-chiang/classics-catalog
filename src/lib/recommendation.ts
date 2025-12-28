/**
 * Hybrid, Content-Aware Recommendation System
 * Zero manual tagging required - achieves "Bartender-level" accuracy through data pattern analysis
 * Balances Manual Curation, Chemical Structure, and Ingredient Rarity with Flavor Family classification
 */

import { Cocktail } from "./google-sheets";

/**
 * Flavor family types
 */
type FlavorFamily =
  | "AMARO_APERITIF"
  | "HERBAL_LIQUEUR"
  | "ANISE"
  | "CHERRY_LIQUEUR"
  | "ORANGE_LIQUEUR"
  | "NUT_LIQUEUR"
  | "COFFEE_LIQUEUR"
  | "VERMOUTH_FORTIFIED"
  | "SWEETENER"
  | "ACID"
  | "BITTER"
  | "DAIRY"
  | "BASE_SPIRIT"
  | "CARBONATED";

/**
 * Type for ingredient distribution analysis (by family)
 */
type IngredientDistribution = {
  familyCounts: Record<FlavorFamily | string, number>;
  totalCocktails: number;
  rareFamilies: Set<string>; // Families appearing in < 10% of cocktails
  commonFamilies: Set<string>; // Families appearing in >= 10% of cocktails
};

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
 * Type for recommendations with scores and breakdown
 */
export type ScoredRecommendation = {
  cocktail: Cocktail;
  score: number;
  breakdown: ScoreBreakdownItem[];
  isManual?: boolean; // Flag to indicate manual recommendation (from related_ids)
};

/**
 * Minimum similarity score threshold for recommendations
 * Recommendations below this score are filtered out to ensure quality
 */
const MIN_SCORE_THRESHOLD = 40; // Minimum score required for recommendations

const RECOMMENDATION_COUNT = 6; // Target number of recommendations

/**
 * Step 1: The Classifier - Comprehensive ingredient family categorization
 * Normalizes input to lowercase and categorizes ingredients by flavor profile
 */
export function getIngredientFamily(ingredientName: string): FlavorFamily | string {
  const normalized = ingredientName.toLowerCase().trim();

  // AMARO_APERITIF (Bittersweet)
  if (
    normalized.includes("cynar") ||
    normalized.includes("campari") ||
    normalized.includes("aperol") ||
    normalized.includes("fernet") ||
    normalized.includes("amaro") ||
    normalized.includes("suze") ||
    normalized.includes("averna") ||
    normalized.includes("montenegro") ||
    normalized.includes("picon")
  ) {
    return "AMARO_APERITIF";
  }

  // HERBAL_LIQUEUR (Sweet/Complex)
  if (
    normalized.includes("chartreuse") ||
    normalized.includes("benedictine") ||
    normalized.includes("galliano") ||
    normalized.includes("drambuie") ||
    normalized.includes("strega")
  ) {
    return "HERBAL_LIQUEUR";
  }

  // ANISE (Licorice)
  if (
    normalized.includes("absinthe") ||
    normalized.includes("pastis") ||
    normalized.includes("pernod") ||
    normalized.includes("sambuca") ||
    normalized.includes("herbsaint")
  ) {
    return "ANISE";
  }

  // CHERRY_LIQUEUR
  if (
    normalized.includes("maraschino") ||
    normalized.includes("cherry") ||
    normalized.includes("heering") ||
    normalized.includes("kirsch") ||
    normalized.includes("luxardo")
  ) {
    return "CHERRY_LIQUEUR";
  }

  // ORANGE_LIQUEUR
  if (
    normalized.includes("cointreau") ||
    normalized.includes("triple sec") ||
    normalized.includes("curacao") ||
    normalized.includes("grand marnier")
  ) {
    return "ORANGE_LIQUEUR";
  }

  // NUT_LIQUEUR
  if (
    normalized.includes("amaretto") ||
    normalized.includes("dissarano") ||
    normalized.includes("frangelico")
  ) {
    return "NUT_LIQUEUR";
  }

  // COFFEE_LIQUEUR
  if (
    normalized.includes("kahlua") ||
    normalized.includes("coffee") ||
    normalized.includes("espresso") ||
    normalized.includes("tia maria")
  ) {
    return "COFFEE_LIQUEUR";
  }

  // VERMOUTH_FORTIFIED
  if (
    normalized.includes("vermouth") ||
    normalized.includes("lillet") ||
    normalized.includes("sherry") ||
    normalized.includes("dubonnet") ||
    normalized.includes("port") ||
    normalized.includes("madeira") ||
    normalized.includes("cocchi")
  ) {
    return "VERMOUTH_FORTIFIED";
  }

  // SWEETENER
  if (
    normalized.includes("sugar") ||
    normalized.includes("syrup") ||
    normalized.includes("honey") ||
    normalized.includes("agave") ||
    normalized.includes("grenadine") ||
    normalized.includes("maple") ||
    normalized.includes("gum")
  ) {
    return "SWEETENER";
  }

  // ACID
  if (
    normalized.includes("lemon") ||
    normalized.includes("lime") ||
    normalized.includes("grapefruit") ||
    normalized.includes("yuzu")
  ) {
    return "ACID";
  }

  // CARBONATED
  if (
    normalized.includes("tonic") ||
    normalized.includes("soda") ||
    normalized.includes("ginger ale") ||
    normalized.includes("ginger beer") ||
    normalized.includes("coke") ||
    normalized.includes("cola") ||
    normalized.includes("sprite") ||
    normalized.includes("7-up") ||
    normalized.includes("7up") ||
    normalized.includes("fanta") ||
    normalized.includes("grapefruit soda")
  ) {
    return "CARBONATED";
  }

  // BITTER (for dashes only, e.g. Angostura)
  if (normalized.includes("bitter")) {
    return "BITTER";
  }

  // DAIRY
  if (
    normalized.includes("cream") ||
    normalized.includes("milk") ||
    normalized.includes("egg") ||
    normalized.includes("baileys")
  ) {
    return "DAIRY";
  }

  // BASE_SPIRIT
  if (
    normalized.includes("whiskey") ||
    normalized.includes("whisky") ||
    normalized.includes("gin") ||
    normalized.includes("rum") ||
    normalized.includes("vodka") ||
    normalized.includes("tequila") ||
    normalized.includes("brandy") ||
    normalized.includes("cognac") ||
    normalized.includes("pisco") ||
    normalized.includes("mezcal") ||
    normalized.includes("cachaca")
  ) {
    return "BASE_SPIRIT";
  }

  // Default: Return the clean ingredient name if no match
  return normalized;
}

/**
 * Step 2: Frequency Analysis - Analyze ingredient distribution by flavor family
 * Counts the frequency of each flavor family to determine rarity
 */
function analyzeIngredientDistribution(
  allCocktails: Cocktail[],
): IngredientDistribution {
  const familyCounts: Record<string, number> = {};
  const totalCocktails = allCocktails.length;

  // Count occurrences of each flavor family
  for (const cocktail of allCocktails) {
    const familiesInCocktail = new Set<string>();
    
    for (const ingredient of cocktail.ingredients) {
      const family = getIngredientFamily(ingredient);
      familiesInCocktail.add(family);
    }

    // Count each family once per cocktail (regardless of how many ingredients match that family)
    for (const family of familiesInCocktail) {
      familyCounts[family] = (familyCounts[family] || 0) + 1;
    }
  }

  // Classify families as rare (< 10%) or common (>= 10%)
  const rareFamilies = new Set<string>();
  const commonFamilies = new Set<string>();
  const rarityThreshold = Math.max(1, Math.floor(totalCocktails * 0.1));

  for (const [family, count] of Object.entries(familyCounts)) {
    if (count < rarityThreshold) {
      rareFamilies.add(family);
    } else {
      commonFamilies.add(family);
    }
  }

  return {
    familyCounts,
    totalCocktails,
    rareFamilies,
    commonFamilies,
  };
}

/**
 * Step 3: Scoring Logic - Calculate similarity score between two cocktails
 */
export function calculateSimilarityScore(
  target: Cocktail,
  candidate: Cocktail,
  ingredientDistribution: IngredientDistribution,
  isManualPick: boolean = false,
): SimilarityScoreResult {
  let score = 0;
  const breakdown: ScoreBreakdownItem[] = [];

  // A. Manual Override
  if (isManualPick) {
    score = 10000;
    breakdown.push({
      reason: "Bartender's Choice",
      points: 0,
    });
    return { score, breakdown };
  }

  // Helper: Get families for ingredients
  const getFamilies = (cocktail: Cocktail): Set<string> => {
    const families = new Set<string>();
    for (const ingredient of cocktail.ingredients) {
      families.add(getIngredientFamily(ingredient));
    }
    return families;
  };

  const targetFamilies = getFamilies(target);
  const candidateFamilies = getFamilies(candidate);

  // Helper: Check if a family acts as a sweet component in Sour cocktails
  // In a Sour context, any liqueur or fortified wine acts as the balancing sweet agent
  const isSweetComponent = (family: string): boolean => {
    return (
      family === "SWEETENER" ||
      family === "ORANGE_LIQUEUR" ||
      family === "NUT_LIQUEUR" ||
      family === "CHERRY_LIQUEUR" ||
      family === "HERBAL_LIQUEUR" ||
      family === "COFFEE_LIQUEUR" ||
      family === "AMARO_APERITIF" ||
      family === "VERMOUTH_FORTIFIED"
    );
  };

  // Check if cocktail has any sweet component
  const hasSweetComponent = (families: Set<string>): boolean => {
    for (const family of families) {
      if (isSweetComponent(family)) {
        return true;
      }
    }
    return false;
  };

  // B. Structure Synergy (The Vibe)
  const targetHasBaseSpirit = target.base_spirit.toLowerCase().trim().length > 0;
  const candidateHasBaseSpirit = candidate.base_spirit.toLowerCase().trim().length > 0;
  const targetHasAcid = targetFamilies.has("ACID");
  const candidateHasAcid = candidateFamilies.has("ACID");
  const targetHasSweetComponent = hasSweetComponent(targetFamilies);
  const candidateHasSweetComponent = hasSweetComponent(candidateFamilies);
  const targetHasCarbonated = targetFamilies.has("CARBONATED");
  const candidateHasCarbonated = candidateFamilies.has("CARBONATED");

  // Condition A: Sour/Daisy structure (Base + Acid + SweetComponent)
  // SweetComponent includes: Sweeteners, Orange Liqueurs, Nut Liqueurs, Cherry Liqueurs,
  // Herbal Liqueurs, Coffee Liqueurs, Amaro/Aperitifs, and Fortified Wines
  const targetHasSourStructure =
    targetHasBaseSpirit && targetHasAcid && targetHasSweetComponent;
  const candidateHasSourStructure =
    candidateHasBaseSpirit && candidateHasAcid && candidateHasSweetComponent;

  // Condition B: Highball structure (Base + Carbonated)
  const targetHasHighballStructure =
    targetHasBaseSpirit && targetHasCarbonated;
  const candidateHasHighballStructure =
    candidateHasBaseSpirit && candidateHasCarbonated;

  // Award points if BOTH cocktails match the same structure type
  if (targetHasSourStructure && candidateHasSourStructure) {
    score += 20;
    breakdown.push({
      reason: "Structure Synergy (Sour/Daisy)",
      points: 20,
    });
  } else if (targetHasHighballStructure && candidateHasHighballStructure) {
    score += 20;
    breakdown.push({
      reason: "Structure Synergy (Highball)",
      points: 20,
    });
  }

  // C. Ingredient Match (The Smart Logic) - Family-based matching
  const matchedFamilies = new Set<string>();

  for (const targetIngredient of target.ingredients) {
    const targetFamily = getIngredientFamily(targetIngredient);

    // Rule 1: Base Spirit Masking - Ignore BASE_SPIRIT in ingredient matching
    if (targetFamily === "BASE_SPIRIT") {
      continue; // Skip base spirits here (handled in Step D)
    }

    // Rule 2: Check if candidate has the same family
    if (candidateFamilies.has(targetFamily) && !matchedFamilies.has(targetFamily)) {
      matchedFamilies.add(targetFamily);

      // Rule 3: Rarity Check - Award points based on family rarity
      if (ingredientDistribution.rareFamilies.has(targetFamily)) {
        // Rare family match (e.g., Cynar, Chartreuse)
        score += 30;
        breakdown.push({
          reason: `Rare Family Match: ${targetFamily}`,
          points: 30,
        });
      } else if (ingredientDistribution.commonFamilies.has(targetFamily)) {
        // Common family match (e.g., Lemon, Triple Sec)
        score += 5;
        breakdown.push({
          reason: `Common Family Match: ${targetFamily}`,
          points: 5,
        });
      } else {
        // Default match (not categorized as rare or common, but family matches)
        score += 5;
        breakdown.push({
          reason: `Family Match: ${targetFamily}`,
          points: 5,
        });
      }
    }
  }

  // D. Base Spirit Match
  const targetBaseNormalized = target.base_spirit.toLowerCase().trim();
  const candidateBaseNormalized = candidate.base_spirit.toLowerCase().trim();

  if (targetBaseNormalized && candidateBaseNormalized && targetBaseNormalized === candidateBaseNormalized) {
    score += 15;
    breakdown.push({
      reason: "Base Spirit Match",
      points: 15,
    });
  }

  // E. Body Level Mismatch Penalty
  if (
    target.body_level.toLowerCase().trim() !==
    candidate.body_level.toLowerCase().trim()
  ) {
    score -= 10;
    breakdown.push({
      reason: "Body Level Mismatch",
      points: -10,
    });
  }

  // F. Dynamic Complexity Adjustment
  // Rewards similar complexity and penalizes disparity using a mathematical formula
  const countA = target.ingredients.length;
  const countB = candidate.ingredients.length;
  const diff = Math.abs(countA - countB);
  const complexityScore = 20 - (7 * diff);
  
  score += complexityScore;
  breakdown.push({
    reason: `Complexity Adjustment (diff: ${diff})`,
    points: complexityScore,
  });

  return { score, breakdown };
}

/**
 * Step 4: Hybrid Recommendation Strategy
 * Phase 1: Manual picks from related_ids (highest priority)
 * Phase 2: Algorithmic fill from similarity scoring
 */
export function getHybridRecommendations(
  currentCocktail: Cocktail,
  allCocktails: Cocktail[],
  manualRelatedIds: string[],
): ScoredRecommendation[] {
  // Pre-process: Analyze ingredient distribution by family
  const ingredientDistribution = analyzeIngredientDistribution(allCocktails);

  const result: ScoredRecommendation[] = [];
  const usedIds = new Set<string>([currentCocktail.id]);

  // Phase 1: Manual Picks (absolute priority)
  if (manualRelatedIds.length > 0) {
    const idSet = new Set(manualRelatedIds);
    const manualRecommendations = allCocktails
      .filter((cocktail) => idSet.has(cocktail.id) && !usedIds.has(cocktail.id))
      .map((cocktail) => {
        const scoreResult = calculateSimilarityScore(
          currentCocktail,
          cocktail,
          ingredientDistribution,
          true, // isManualPick = true
        );
        return {
          cocktail,
          score: scoreResult.score,
          breakdown: scoreResult.breakdown,
          isManual: true,
        };
      });

    for (const rec of manualRecommendations) {
      if (result.length < RECOMMENDATION_COUNT) {
        result.push(rec);
        usedIds.add(rec.cocktail.id);
      }
    }
  }

  // Phase 2: Algorithmic Fill (Top Scores)
  if (result.length < RECOMMENDATION_COUNT) {
    const calculatedRecs = allCocktails
      .filter(
        (cocktail) => cocktail.id !== currentCocktail.id && !usedIds.has(cocktail.id),
      )
      .map((cocktail) => {
        const scoreResult = calculateSimilarityScore(
          currentCocktail,
          cocktail,
          ingredientDistribution,
          false, // isManualPick = false
        );
        return {
          cocktail,
          score: scoreResult.score,
          breakdown: scoreResult.breakdown,
          isManual: false,
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by score descending

    for (const rec of calculatedRecs) {
      if (result.length >= RECOMMENDATION_COUNT) break;
      result.push(rec);
      usedIds.add(rec.cocktail.id);
    }
  }

  // Sort all results by score (priority) descending
  const sortedResults = result.sort((a, b) => b.score - a.score);

  // Apply minimum score threshold: filter out low-scoring recommendations
  // Manual recommendations (score 10000) are always included regardless of threshold
  const filteredResults = sortedResults.filter(
    (item) => item.isManual || item.score >= MIN_SCORE_THRESHOLD,
  );

  return filteredResults;
}

/**
 * Legacy function: Gets calculated recommendations based on similarity scoring
 * Kept for backward compatibility, but uses the new scoring algorithm
 */
export function getCalculatedRecommendations(
  currentCocktail: Cocktail,
  allCocktails: Cocktail[],
): Cocktail[] {
  const ingredientDistribution = analyzeIngredientDistribution(allCocktails);

  const scoredCocktails = allCocktails
    .filter((cocktail) => cocktail.id !== currentCocktail.id)
    .map((cocktail) => {
      const scoreResult = calculateSimilarityScore(
        currentCocktail,
        cocktail,
        ingredientDistribution,
        false,
      );
      return {
        cocktail,
        score: scoreResult.score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score >= MIN_SCORE_THRESHOLD)
    .slice(0, RECOMMENDATION_COUNT)
    .map((item) => item.cocktail);

  return scoredCocktails;
}
