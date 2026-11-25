import Link from "next/link";
import { Filters } from "@/components/FilterModal";

/** The six main base spirits shown as tabs; everything else stays in the filter. */
export const BASE_SPIRIT_TABS = ["Gin", "Whiskey", "Rum", "Vodka", "Tequila", "Brandy"];

type BaseSpiritTabsProps = {
  filters: Filters;
  searchQuery: string;
};

function buildHref(filters: Filters, searchQuery: string, base?: string) {
  const params = new URLSearchParams();
  if (searchQuery) params.set("q", searchQuery);
  if (base) params.set("base", base);
  if (filters.body?.length) params.set("body", filters.body.join(","));
  if (filters.method?.length) params.set("method", filters.method.join(","));
  if (filters.ingredients?.length) params.set("ingredients", filters.ingredients.join(","));
  const query = params.toString();
  return query ? `/cocktails?${query}` : "/cocktails";
}

export function BaseSpiritTabs({ filters, searchQuery }: BaseSpiritTabsProps) {
  const selected = filters.base ?? [];
  const tabs = [
    { label: "All", base: undefined, active: selected.length === 0 },
    ...BASE_SPIRIT_TABS.map((spirit) => ({
      label: spirit,
      base: spirit,
      active: selected.length === 1 && selected[0].toLowerCase() === spirit.toLowerCase(),
    })),
  ];

  return (
    <nav aria-label="Base spirit" className="no-scrollbar -mx-5 mt-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex gap-5 whitespace-nowrap text-[13px]">
        {tabs.map((tab) => (
          <li key={tab.label}>
            <Link
              href={buildHref(filters, searchQuery, tab.base)}
              scroll={false}
              aria-current={tab.active ? "page" : undefined}
              className={`inline-block border-b pt-3 pb-2 transition-colors ${
                tab.active ? "border-gold text-ivory" : "border-transparent text-dim hover:text-ivory"
              }`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
