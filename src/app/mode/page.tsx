"use client";

import Link from "next/link";
import { type ElementType, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Droplet,
  PartyPopper,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

type Selection = {
  base: string;
  body: string;
  method: string;
};

const vibePresets: Array<{
  title: string;
  description: string;
  preset: Selection;
  icon: ElementType;
}> = [
  {
    title: "Slow night in",
    description: "Silky, spirit-forward sippers to wind down.",
    preset: { base: "Whisky", body: "Heavy", method: "Stir" },
    icon: Droplet,
  },
  {
    title: "Pre-game sparkle",
    description: "Citrus-forward, easy drinking, bright energy.",
    preset: { base: "Tequila", body: "Light", method: "Shake" },
    icon: PartyPopper,
  },
  {
    title: "Conversation hour",
    description: "Balanced classics to keep the flow going.",
    preset: { base: "Gin", body: "Medium", method: "Stir" },
    icon: Sparkles,
  },
  {
    title: "Nightcap",
    description: "Cozy finishes with deeper notes.",
    preset: { base: "Brandy", body: "Heavy", method: "Stir" },
    icon: UtensilsCrossed,
  },
];

const baseOptions = ["Gin", "Whisky", "Tequila", "Rum", "Vodka", "Brandy"];
const bodyOptions = ["Light", "Medium", "Heavy"];
const methodOptions = ["Shake", "Stir", "Build"];

export default function ModePage() {
  const router = useRouter();
  const [selection, setSelection] = useState<Selection>({
    base: "",
    body: "",
    method: "",
  });

  const hasFilters = useMemo(
    () => !!(selection.base || selection.body || selection.method),
    [selection],
  );

  const launch = () => {
    const params = new URLSearchParams();
    if (selection.base) params.set("base", selection.base);
    if (selection.body) params.set("body", selection.body);
    if (selection.method) params.set("method", selection.method);
    router.push(params.toString() ? `/cocktails?${params}` : "/cocktails");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <p className="max-w-2xl text-lg text-zinc-300">
            Start with a preset or dial in a base spirit, body level, and method
            to see cocktails that match the moment.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {vibePresets.map((vibe) => {
            const Icon = vibe.icon;
            return (
              <button
                key={vibe.title}
                type="button"
                onClick={() => setSelection(vibe.preset)}
                className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-xl"
              >
                <div className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-5 w-5 text-amber-200" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-white">{vibe.title}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200">
                      {vibe.preset.base} · {vibe.preset.body} · {vibe.preset.method}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">{vibe.description}</p>
                </div>
              </button>
            );
          })}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <Sparkles className="h-5 w-5 text-amber-200" />
              Build your own
            </div>
            <Link
              href="/cocktails"
              className="text-sm text-zinc-300 underline underline-offset-4 transition hover:text-white"
            >
              Skip to full list
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ToggleGroup
              label="Base spirit"
              options={baseOptions}
              value={selection.base}
              onChange={(base) => setSelection((prev) => ({ ...prev, base }))}
            />
            <ToggleGroup
              label="Body level"
              options={bodyOptions}
              value={selection.body}
              onChange={(body) => setSelection((prev) => ({ ...prev, body }))}
            />
            <ToggleGroup
              label="Method"
              options={methodOptions}
              value={selection.method}
              onChange={(method) => setSelection((prev) => ({ ...prev, method }))}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              {hasFilters
                ? `Ready to search for ${selection.base || "any"} / ${selection.body || "any"} / ${selection.method || "any"}.`
                : "Pick at least one dimension or jump straight to the menu."}
            </p>
            <button
              type="button"
              onClick={launch}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/25 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-amber-400/30 hover:scale-105"
            >
              Show cocktails
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

type ToggleGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function ToggleGroup({ label, options, value, onChange }: ToggleGroupProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-zinc-300">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(active ? "" : option)}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ease-in-out ${
                active
                  ? "bg-white text-black shadow-lg shadow-amber-500/30 scale-105"
                  : "border border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10 hover:scale-105"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

