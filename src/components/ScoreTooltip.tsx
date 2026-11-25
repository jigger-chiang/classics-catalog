"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreBreakdownItem } from "@/lib/recommendation";

type ScoreTooltipProps = {
  score: number;
  breakdown: ScoreBreakdownItem[];
  isManual?: boolean;
};

function TrophyIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </svg>
  );
}

const TOOLTIP_WIDTH = 214;

/**
 * Small circle sitting on the arch frame (score, or a trophy for a
 * Bartender's Choice). Hover on desktop or tap to see the breakdown.
 */
export function ScoreTooltip({ score, breakdown, isManual }: ScoreTooltipProps) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  const isManualRecommendation = isManual || breakdown.some((item) => item.reason === "Bartender's Choice");

  // Open towards whichever side has room, so it never runs off a phone screen
  const show = () => {
    const rect = wrapper.current?.getBoundingClientRect();
    if (rect) setAlignRight(rect.left + TOOLTIP_WIDTH > window.innerWidth - 12);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const hoverCapable = () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  return (
    <div
      ref={wrapper}
      className="relative"
      onMouseEnter={() => hoverCapable() && show()}
      onMouseLeave={() => hoverCapable() && setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) setOpen(false);
          else show();
        }}
        aria-expanded={open}
        aria-label={isManualRecommendation ? "Bartender's Choice — details" : `${score} points — score breakdown`}
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-gold/55 bg-ink font-serif text-[13px] font-semibold leading-none text-gold transition-colors hover:border-gold"
      >
        {isManualRecommendation ? <TrophyIcon size={13} /> : score}
      </button>

      {open && (
        <div
          role="tooltip"
          style={{ width: TOOLTIP_WIDTH }}
          className={`absolute top-[calc(100%+6px)] z-30 border border-gold/55 bg-panel p-3.5 text-left font-sans ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          {isManualRecommendation ? (
            <div className="flex flex-col items-center gap-1.5 py-1 text-gold">
              <TrophyIcon size={22} />
              <span className="font-serif text-[19px] text-ivory">Bartender&apos;s Choice</span>
              <span className="text-[11px] text-muted">Classic Pairing</span>
            </div>
          ) : (
            <>
              <div className="mb-2 text-[10px] tracking-[0.2em] text-dim">SCORE BREAKDOWN</div>
              <ul>
                {breakdown.map((item, index) => (
                  <li key={index} className="flex justify-between gap-2.5 py-[3px] text-[11px] leading-[1.45]">
                    <span className="text-muted">{item.reason}</span>
                    <span className={`shrink-0 ${item.points >= 0 ? "text-gold" : "text-[#c98a7e]"}`}>
                      {item.points >= 0 ? `+${item.points}` : item.points}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-gold/30 pt-2 text-xs font-medium">
                <span className="text-ivory">Total</span>
                <span className="text-gold">{score} pts</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
