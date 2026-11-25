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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="filter-title">
          <div className="relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col border border-gold/30 bg-panel sm:max-h-[85vh]">
            <div className="flex shrink-0 items-center justify-between border-b border-gold/30 px-6 py-4">
              <h2 id="filter-title" className="font-serif text-3xl italic text-ivory">Filter</h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-end text-muted transition-colors hover:text-gold"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
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
              <div className="h-px bg-gold/20" />
              <FilterButtonGroup
                label="Body Level"
                values={draft.body || []}
                onChange={(body) => setDraft((d) => ({ ...d, body }))}
                options={filterOptions.body_level}
              />
              <div className="h-px bg-gold/20" />
              <FilterButtonGroup
                label="Method"
                values={draft.method || []}
                onChange={(method) => setDraft((d) => ({ ...d, method }))}
                options={filterOptions.method}
              />
              <div className="h-px bg-gold/20" />
              <IngredientsSelector
                values={draft.ingredients || []}
                onChange={(ingredients) =>
                  setDraft((d) => ({ ...d, ingredients }))
                }
                options={filterOptions.ingredients}
              />
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-gold/30 px-6 py-4">
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] tracking-[0.2em] text-muted transition-colors hover:text-ivory"
              >
                CLEAR ALL
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="h-11 px-4 text-[11px] tracking-[0.2em] text-muted transition-colors hover:text-ivory"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="h-11 border border-gold px-6 text-[11px] tracking-[0.2em] text-gold transition-colors hover:bg-gold/10 hover:text-gold-light"
                >
                  APPLY
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
      <span className="mb-3 block text-[10px] tracking-[0.22em] text-dim">{label.toUpperCase()}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              aria-pressed={isSelected}
              className={`min-h-10 border px-4 py-2 font-serif text-[17px] transition-colors ${
                isSelected
                  ? "border-gold text-gold"
                  : "border-ivory/15 text-ivory hover:border-gold/55"
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
      <span className="mb-3 block text-[10px] tracking-[0.22em] text-dim">
        INGREDIENTS
      </span>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-full items-center justify-between border-b border-gold/55 text-left font-serif text-[17px] text-muted"
        >
          <span>Select ingredients</span>
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
          <div className="absolute z-50 mt-1 w-full overflow-hidden border border-gold/30 bg-ink">
            <div className="border-b border-gold/20 px-3">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients..."
                className="h-11 w-full bg-transparent font-serif text-[16px] text-ivory placeholder:text-dim focus:outline-none"
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
                    className="w-full px-4 py-2.5 text-left font-serif text-[17px] text-ivory transition-colors hover:bg-gold/10"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2.5 text-sm text-muted">
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
              className="inline-flex items-center gap-2 border border-gold px-3 py-1.5 font-serif text-[17px] text-gold"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => handleRemove(ingredient)}
                aria-label={`Remove ${ingredient}`}
                className="text-gold/70 transition-colors hover:text-gold-light"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

