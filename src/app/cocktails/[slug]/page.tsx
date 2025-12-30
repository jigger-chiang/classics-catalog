import { notFound } from "next/navigation";
import Link from "next/link";
import { getCocktails } from "@/lib/google-sheets";
import { getHybridRecommendations } from "@/lib/recommendation";
import { CocktailCard } from "@/components/CocktailCard";
import { CocktailDetailImage } from "@/components/CocktailDetailImage";
import { StickyBackHeader } from "@/components/StickyBackHeader";
import { DetailPageScrollToTop } from "@/components/DetailPageScrollToTop";
import { Playfair_Display } from "next/font/google";
import { toSlug } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

export default async function CocktailDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch all cocktails once - this is cached
  const allCocktails = await getCocktails();
  
  // Find the cocktail using normalized slug comparison
  // This handles cases where the URL slug is normalized (e.g., "vieux-carre")
  // but the database slug might be raw (e.g., "Vieux Carré")
  const cocktail = allCocktails.find(
    (c) => toSlug(c.slug) === slug || toSlug(c.name) === slug
  );

  if (!cocktail) {
    notFound();
  }

  // Use hybrid strategy: manual related_ids + algorithmic recommendations
  const recommendations = getHybridRecommendations(
    cocktail,
    allCocktails,
    cocktail.related_ids,
  );

  return (
    <div
      className={`${playfair.variable} min-h-screen bg-black text-amber-100`}
    >
      <DetailPageScrollToTop />
      <StickyBackHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
          <Link
            href="/cocktails"
            className="transition-colors hover:text-white"
          >
            Cocktails
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300">{cocktail.name}</span>
        </nav>

        <h1
          className="mb-6 text-4xl font-semibold text-amber-100 sm:text-5xl lg:mb-8"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {cocktail.name}
        </h1>

        <div className="mb-8 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:gap-8">
          <div className="flex-1">
            <CocktailDetailImage cocktail={cocktail} />
          </div>

          <div className="flex-1 lg:flex lg:flex-col lg:justify-start">
            {cocktail.ingredients.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-4 text-lg font-semibold text-amber-100">
                  Ingredients
                </h2>
                <ul className="flex flex-col gap-2">
                  {cocktail.ingredients.map((ingredient, idx) => {
                    const ingredientTrimmed = ingredient.trim();
                    const normalizedIngredient = ingredientTrimmed.toLowerCase();
                    const normalizedBaseSpirit = cocktail.base_spirit.toLowerCase().trim();
                    
                    // Smart Linking Logic: Check if ingredient is the base spirit
                    const isBaseSpirit = normalizedIngredient === normalizedBaseSpirit || 
                                        normalizedIngredient.includes(normalizedBaseSpirit) ||
                                        normalizedBaseSpirit.includes(normalizedIngredient);
                    
                    // Case A: Base Spirit -> use base filter
                    // Case B: Regular Ingredient -> use ingredients filter
                    const filterUrl = isBaseSpirit
                      ? `/cocktails?base=${encodeURIComponent(ingredientTrimmed)}`
                      : `/cocktails?ingredients=${encodeURIComponent(ingredientTrimmed)}`;
                    
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-base text-amber-100/90"
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-200" />
                        <Link
                          href={filterUrl}
                          className="transition-colors hover:text-amber-300 hover:underline cursor-pointer"
                        >
                          {ingredient}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {cocktail.story && (
              <div>
                <p className="whitespace-pre-line text-base leading-relaxed text-amber-100/90 sm:text-lg">
                  {cocktail.story}
                </p>
              </div>
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <section className="mt-12 border-t border-white/10 pt-8">
            <h2
              className="mb-6 text-2xl font-semibold text-amber-100 sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Recommends
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((recommendation) => {
                const isManual = recommendation.isManual || recommendation.breakdown.some((item) => item.reason === "Bartender's Choice");
                return (
                  <CocktailCard
                    key={recommendation.cocktail.id}
                    cocktail={recommendation.cocktail}
                    score={recommendation.score}
                    breakdown={recommendation.breakdown}
                    isManual={isManual}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

