import { notFound } from "next/navigation";
import { getCocktailBySlug, getCocktails } from "@/lib/google-sheets";
import { getHybridRecommendations } from "@/lib/recommendation";
import { CocktailCard } from "@/components/CocktailCard";
import { CocktailDetailImage } from "@/components/CocktailDetailImage";
import { BackButton } from "@/components/BackButton";
import { ScoreTooltip } from "@/components/ScoreTooltip";
import { Playfair_Display } from "next/font/google";

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
  const cocktail = await getCocktailBySlug(slug);

  if (!cocktail) {
    notFound();
  }

  // Get all cocktails for recommendation calculation
  const allCocktails = await getCocktails();

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
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="mb-6">
          <BackButton />
        </div>
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
                  {cocktail.ingredients.map((ingredient, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-base text-amber-100/90"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-200" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cocktail.story && (
              <div>
                <p className="text-base leading-relaxed text-amber-100/90 sm:text-lg">
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
              {recommendations.map((recommendation) => (
                <div key={recommendation.cocktail.id} className="relative">
                  <CocktailCard cocktail={recommendation.cocktail} />
                  {/* Score badge on the right side with tooltip */}
                  <div className="absolute right-0 top-4 z-10">
                    <ScoreTooltip
                      score={recommendation.score}
                      breakdown={recommendation.breakdown}
                    >
                      <div className="cursor-help rounded-full bg-amber-400/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-amber-200 ring-2 ring-amber-400/30 shadow-lg transition-all duration-200 hover:bg-amber-400/30 hover:ring-amber-400/50">
                        {recommendation.score} pts
                      </div>
                    </ScoreTooltip>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

