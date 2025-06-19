"use client";

import type { Category } from "@/types";
import { Cake, Plane, Briefcase, BookOpen, Users, GraduationCap, Image as ImageIcon } from "lucide-react";
import type { LucideProps } from "lucide-react";

interface CategoryIconProps extends LucideProps {
  category?: Category | string;
}

export function CategoryIcon({ category, ...props }: CategoryIconProps) {
  switch (category) {
    case "Birthday":
      return <Cake {...props} />;
    case "Holiday":
      return <Plane {...props} />;
    case "Work":
      return <Briefcase {...props} />;
    case "School":
      return <BookOpen {...props} />;
    case "Friends":
      return <Users {...props} />;
    case "College Friends":
      return <GraduationCap {...props} />;
    default:
      return <ImageIcon {...props} />;
  }
}
