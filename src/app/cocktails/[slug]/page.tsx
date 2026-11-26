import { notFound } from "next/navigation";
import Link from "next/link";
import { getCocktails } from "@/lib/google-sheets";
import { getHybridRecommendations } from "@/lib/recommendation";
import { CocktailCard } from "@/components/CocktailCard";
import { CocktailDetailImage } from "@/components/CocktailDetailImage";
import { StickyBackHeader } from "@/components/StickyBackHeader";
import { DetailPageScrollToTop } from "@/components/DetailPageScrollToTop";
import { StoryText } from "@/components/StoryText";
import { toSlug } from "@/lib/utils";

const sectionTitle = "mb-3 font-serif text-[28px] font-normal italic leading-tight text-ivory";

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

  const eyebrow = [cocktail.base_spirit, cocktail.method, cocktail.glassware].filter(Boolean).join(" · ");
  const specs = [
    { label: "BASE", value: cocktail.base_spirit },
    { label: "METHOD", value: cocktail.method },
    { label: "GLASS", value: cocktail.glassware },
    { label: "BODY", value: cocktail.body_level },
  ];

  return (
    <div className="min-h-screen bg-ink text-ivory">
      <DetailPageScrollToTop />
      <StickyBackHeader number={cocktail.id || undefined} name={cocktail.name} />

      <main className="mx-auto max-w-5xl px-6 pb-16 sm:px-8">
        <section className="flex flex-col items-center pt-[18px] text-center">
          {eyebrow && <span className="text-[11px] uppercase tracking-[0.26em] text-gold">{eyebrow}</span>}
          <h1 className="mt-2.5 font-serif text-[60px] font-medium leading-none sm:text-7xl">{cocktail.name}</h1>
        </section>

        <div className="mt-6 lg:mt-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <CocktailDetailImage cocktail={cocktail} />

          <div>
            <dl className="mt-[30px] grid grid-cols-2 border-t border-gold/28 lg:mt-0">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`border-b border-gold/28 py-3.5 ${i % 2 === 0 ? "border-r pr-3" : "pl-[18px]"}`}
                >
                  <dt className="text-[10px] tracking-[0.22em] text-dim">{spec.label}</dt>
                  <dd className="mt-1 font-serif text-[21px]">{spec.value || "—"}</dd>
                </div>
              ))}
            </dl>

            {cocktail.ingredients.length > 0 && (
              <section className="mt-[42px]">
                <h2 className={sectionTitle}>Ingredients</h2>
                <ul className="border-b border-gold/28">
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
                      <li key={idx} className="border-t border-gold/28">
                        <Link
                          href={filterUrl}
                          className="group flex min-h-10 items-center justify-between font-serif text-base text-ivory transition-colors hover:text-gold"
                        >
                          {ingredient}
                          <span className="text-[15px] text-gold transition-transform group-hover:translate-x-0.5" aria-hidden="true">›</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {cocktail.story && (
              <section className="mt-[42px]">
                <h2 className={sectionTitle}>The Story</h2>
                <StoryText story={cocktail.story} />
              </section>
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <section className="mt-10 lg:mt-16">
            <h2 className={`${sectionTitle} mb-3.5`}>You May Also Like</h2>
            <div className="-mx-1 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
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
