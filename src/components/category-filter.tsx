"use client";

import { Button } from "@/components/ui/button";
import type { Category } from "@/types";
import { APP_CATEGORIES, ALL_CATEGORIES_OPTION } from "@/types";
import { CategoryIcon } from "./icons/category-icon";
import { motion } from "framer-motion";

interface CategoryFilterProps {
  selectedCategory: Category | typeof ALL_CATEGORIES_OPTION;
  onSelectCategory: (category: Category | typeof ALL_CATEGORIES_OPTION) => void;
}

const displayCategories = [ALL_CATEGORIES_OPTION, ...APP_CATEGORIES];

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 10 }
    }
  };

  return (
    <div className="py-6 px-2 md:px-0">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center gap-3"
      >
        {displayCategories.map((category) => (
          <motion.div key={category} variants={itemVariants}>
            <Button
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => onSelectCategory(category as Category | typeof ALL_CATEGORIES_OPTION)}
              className={`
                font-medium shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 
                rounded-full text-sm px-6 py-3 border-2 relative overflow-hidden group
                ${selectedCategory === category 
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground border-primary shadow-primary/25 animate-glow' 
                  : 'border-primary/30 text-primary hover:border-primary hover:bg-primary/10 hover:text-primary glass'
                }
              `}
              aria-pressed={selectedCategory === category}
            >
              {/* Shimmer effect for active button */}
              {selectedCategory === category && (
                <div className="absolute inset-0 shimmer"></div>
              )}
              
              <div className="relative flex items-center gap-2">
                <CategoryIcon 
                  category={category} 
                  className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                    selectedCategory === category ? 'animate-pulse' : ''
                  }`} 
                />
                <span className="font-semibold">{category}</span>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}