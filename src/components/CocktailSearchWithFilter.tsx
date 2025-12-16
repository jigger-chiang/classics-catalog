"use client";

import { useState } from "react";
import { CocktailSearch } from "./CocktailSearch";
import FilterModal, { Filters } from "./FilterModal";
import { type Cocktail, type FilterOptions } from "@/lib/google-sheets";

type CocktailSearchWithFilterProps = {
  cocktails?: Cocktail[];
  filterOptions: FilterOptions;
  initialFilters: Filters;
};

export function CocktailSearchWithFilter({
  cocktails,
  filterOptions,
  initialFilters,
}: CocktailSearchWithFilterProps) {
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  return (
    <>
      <CocktailSearch cocktails={cocktails} onFilterClick={() => setFilterModalOpen(true)} />
      <FilterModal
        filterOptions={filterOptions}
        initial={initialFilters}
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
      />
    </>
  );
}

