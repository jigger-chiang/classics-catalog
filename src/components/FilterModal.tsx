"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export type Filters = {
  base?: string[];
  body?: string[];
  method?: string[];
  ingredients?: string[];
};

type FilterModalProps = {
  filterOptions: {
    base_spirit: string[];
    body_level: string[];
    method: string[];
    ingredients: string[];
  };
  initial: Filters;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const emptyFilters: Filters = {
  base: [],
  body: [],
  method: [],
  ingredients: [],
};

export default function FilterModal({
  filterOptions,
  initial,
  open,
  onOpenChange,
}: FilterModalProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<Filters>({
    base: initial.base || [],
    body: initial.body || [],
    method: initial.method || [],
    ingredients: initial.ingredients || [],
  });

  // Sync draft with initial prop changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft({
      base: initial.base || [],
      body: initial.body || [],
      method: initial.method || [],
      ingredients: initial.ingredients || [],
    });
  }, [initial]);


  const applyFilters = () => {
    const params = new URLSearchParams();
    if (draft.base && draft.base.length > 0) {
      params.set("base", draft.base.join(","));
    }
    if (draft.body && draft.body.length > 0) {
      params.set("body", draft.body.join(","));
    }
    if (draft.method && draft.method.length > 0) {
      params.set("method", draft.method.join(","));
    }
    if (draft.ingredients && draft.ingredients.length > 0) {
      params.set("ingredients", draft.ingredients.join(","));
    }
    const query = params.toString();
    router.replace(query ? `/cocktails?${query}` : "/cocktails", {
      scroll: false,
    });
    onOpenChange(false);
  };

  const clearFilters = () => {
    setDraft(emptyFilters);
    router.replace("/cocktails", { scroll: false });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl sm:max-h-[85vh]">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-6">
              <div className="text-lg font-semibold text-white">Filter</div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full p-1 text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
              <FilterButtonGroup
                label="Base Spirit"
                values={draft.base || []}
                onChange={(base) => setDraft((d) => ({ ...d, base }))}
                options={filterOptions.base_spirit}
              />
              <div className="h-px bg-white/10" />
              <FilterButtonGroup
                label="Body Level"
                values={draft.body || []}
                onChange={(body) => setDraft((d) => ({ ...d, body }))}
                options={filterOptions.body_level}
              />
              <div className="h-px bg-white/10" />
              <FilterButtonGroup
                label="Method"
                values={draft.method || []}
                onChange={(method) => setDraft((d) => ({ ...d, method }))}
                options={filterOptions.method}
              />
              <div className="h-px bg-white/10" />
              <IngredientsSelector
                values={draft.ingredients || []}
                onChange={(ingredients) =>
                  setDraft((d) => ({ ...d, ingredients }))
                }
                options={filterOptions.ingredients}
              />
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-white/10 p-6">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-zinc-400 underline underline-offset-4 transition hover:text-white"
              >
                Clear all
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:border-white/30 hover:bg-white/10 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all duration-200 ease-in-out hover:bg-zinc-100 hover:scale-105 hover:shadow-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
    </div>
  );
}

type FilterButtonGroupProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
};

function FilterButtonGroup({
  label,
  values,
  onChange,
  options,
}: FilterButtonGroupProps) {
  const toggleOption = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div>
      <span className="mb-3 block text-sm font-medium text-white">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                isSelected
                  ? "bg-zinc-700 text-white shadow-md"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:scale-105"
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

type IngredientsSelectorProps = {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
};

function IngredientsSelector({
  values,
  onChange,
  options,
}: IngredientsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const availableOptions = options.filter((opt) => !values.includes(opt));
  const filteredOptions = availableOptions.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (option: string) => {
    if (!values.includes(option)) {
      onChange([...values, option]);
    }
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleRemove = (option: string) => {
    onChange(values.filter((v) => v !== option));
  };

  return (
    <div>
      <span className="mb-3 block text-sm font-medium text-white">
        Ingredients
      </span>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white"
        >
          <span>Select</span>
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-xl backdrop-blur-sm">
            <div className="border-b border-white/10 p-2">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-zinc-400 transition-all duration-200 ease-in-out focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-2.5 text-left text-sm text-white transition-all duration-200 ease-in-out first:rounded-t-2xl last:rounded-b-2xl hover:bg-white/10"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-zinc-400">
                  No ingredients found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((ingredient) => (
            <span
              key={ingredient}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition-all duration-200 ease-in-out hover:bg-white/20 hover:scale-105"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => handleRemove(ingredient)}
                className="rounded-full p-0.5 transition-all duration-200 ease-in-out hover:bg-white/30 hover:scale-110"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

