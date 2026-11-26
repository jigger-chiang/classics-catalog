import Link from "next/link";
import { Cocktail } from "@/lib/google-sheets";
import { ScoreBreakdownItem } from "@/lib/recommendation";
import { toSlug } from "@/lib/utils";
import { CocktailPhoto } from "@/components/CocktailPhoto";
import { ScoreTooltip } from "@/components/ScoreTooltip";

type CocktailCardProps = {
  cocktail: Cocktail;
  priority?: boolean;
  /** Recommendation score; shows a circle on the arch when given */
  score?: number;
  breakdown?: ScoreBreakdownItem[];
  isManual?: boolean;
};

const SEPARATOR = " · "; // en spaces keep the dots airy and never collapse

/**
 * Arch card: framed arch photo, gold name, two lines of ingredients
 * (a third fades out), and method · body · base. A thin gold frame
 * appears around the whole card on hover.
 */
export function CocktailCard({ cocktail, priority = false, score, breakdown, isManual }: CocktailCardProps) {
  const href = `/cocktails/${toSlug(cocktail.name)}`;
  const meta = [cocktail.method, cocktail.body_level, cocktail.base_spirit].filter(Boolean).join(SEPARATOR);
  const showScore = score !== undefined && breakdown !== undefined;

  return (
    <div className="h-full border border-transparent px-[9px] pt-[9px] pb-4 text-center transition-colors duration-200 hover:border-gold/55">
      <div className="arch-frame relative w-full border border-gold/55 p-1">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block h-full w-full overflow-hidden rounded-t-full">
          <CocktailPhoto
            cocktail={cocktail}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          />
        </Link>

        {showScore && (
          // On the arch at 45°: 85.36% across and 14.64% of the width down.
          // margin-top % is measured against the width in every browser,
          // so the circle stays put whatever the card's height.
          <div className="absolute left-[calc(85.36%-15px)] top-0 z-10 mt-[calc(14.64%-15px)]">
            <ScoreTooltip score={score} breakdown={breakdown} isManual={isManual} />
          </div>
        )}
      </div>

      <Link href={href} className="flex flex-col items-center">
        <h3 className="mt-3 font-serif text-[22px] font-medium leading-[1.15] text-gold">{cocktail.name}</h3>
        <p className="ingredient-fade mt-1.5 h-9 w-full overflow-hidden font-serif text-[9.3px] leading-[13.5px] text-ivory">
          {cocktail.ingredients.join(SEPARATOR)}
        </p>
        <p className="mt-1 text-[7.5px] uppercase tracking-[0.14em] text-dim">{meta}</p>
      </Link>
    </div>
  );
}

export default CocktailCard;
