"use client";

import { useState } from "react";

const VISIBLE_PARAGRAPHS = 2;

/** The cocktail's story: first two paragraphs, the rest behind "Continue reading". */
export function StoryText({ story }: { story: string }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = story
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const canCollapse = paragraphs.length > VISIBLE_PARAGRAPHS;
  const shown = expanded || !canCollapse ? paragraphs : paragraphs.slice(0, VISIBLE_PARAGRAPHS);

  return (
    <div>
      <div className="flex flex-col gap-4 font-tc text-[15px] leading-[1.95] text-muted">
        {shown.map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="mt-1 inline-flex min-h-11 items-center text-[11px] tracking-[0.22em] text-gold transition-colors hover:text-gold-light"
        >
          {expanded ? "SHOW LESS ‹" : "CONTINUE READING ›"}
        </button>
      )}
    </div>
  );
}
