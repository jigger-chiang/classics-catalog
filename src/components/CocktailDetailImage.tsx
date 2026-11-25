import { Cocktail } from "@/lib/google-sheets";
import { CocktailPhoto } from "@/components/CocktailPhoto";

/** Square photo inside a thin gold frame. */
export function CocktailDetailImage({ cocktail }: { cocktail: Cocktail }) {
  return (
    <div className="border border-gold/55 p-[5px]">
      <div className="relative aspect-square w-full overflow-hidden">
        <CocktailPhoto cocktail={cocktail} priority sizes="(max-width: 1024px) 100vw, 480px" />
      </div>
    </div>
  );
}
