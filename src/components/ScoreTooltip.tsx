"use client";

import { ScoreBreakdownItem } from "@/lib/recommendation";

type ScoreTooltipProps = {
  score: number;
  breakdown: ScoreBreakdownItem[];
  isManual?: boolean;
  children: React.ReactNode;
};

export function ScoreTooltip({ score, breakdown, isManual, children }: ScoreTooltipProps) {
  // Check if this is a manual recommendation (Bartender's Choice)
  const isManualRecommendation = isManual || breakdown.some((item) => item.reason === "Bartender's Choice");

  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none invisible absolute right-full top-0 z-50 mr-2 w-64 rounded-lg border border-white/20 bg-zinc-900/95 p-3 text-xs shadow-2xl opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
        {isManualRecommendation ? (
          // Manual recommendation: Show special "Bartender's Choice" message
          <div className="text-center py-2">
            <div className="text-2xl mb-1">🏆</div>
            <div className="font-semibold text-amber-300">Bartender's Choice</div>
            <div className="text-xs text-zinc-400 mt-1">Classic Pairing</div>
          </div>
        ) : (
          // Algorithmic recommendation: Show score breakdown
          <>
            <div className="mb-2 font-semibold text-white">Score Breakdown</div>
            <ul className="space-y-1">
              {breakdown.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-zinc-300">{item.reason}</span>
                  <span
                    className={`shrink-0 font-semibold ${
                      item.points >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {item.points >= 0 ? `+${item.points}` : `${item.points}`}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-white/10 pt-2">
              <div className="flex items-center justify-between gap-2 font-semibold">
                <span className="text-white">Total</span>
                <span className="shrink-0 text-amber-200">{score} pts</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

