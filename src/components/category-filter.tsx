
"use client";

import { Button } from "@/components/ui/button";
import type { Category } from "@/types";
import { APP_CATEGORIES, ALL_CATEGORIES_OPTION } from "@/types";
import { CategoryIcon } from "./icons/category-icon";

interface CategoryFilterProps {
  selectedCategory: Category | typeof ALL_CATEGORIES_OPTION;
  onSelectCategory: (category: Category | typeof ALL_CATEGORIES_OPTION) => void;
}

const displayCategories = [ALL_CATEGORIES_OPTION, ...APP_CATEGORIES];

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="py-4 px-2 md:px-0">
      {/* Title moved to page.tsx for better semantic structure */}
      {/* <h2 className="text-xl font-headline mb-3 text-center md:text-left">Filter by Category</h2> */}
      <div className="flex flex-wrap justify-center gap-2">
        {displayCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => onSelectCategory(category as Category | typeof ALL_CATEGORIES_OPTION)}
            className={`font-body shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 rounded-full text-sm px-4 py-2 md:px-5 md:py-2.5 ${
              selectedCategory === category ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary text-primary hover:bg-primary/10 hover:text-primary-foreground'
            }`}
            aria-pressed={selectedCategory === category}
          >
            <CategoryIcon category={category} className="mr-2 h-4 w-4" />
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
