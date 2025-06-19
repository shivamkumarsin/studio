
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Photo } from "@/types";
import { motion } from "framer-motion";
import { CategoryIcon } from "./icons/category-icon";
// Dialog components won't be used here directly, but PhotoGrid will handle individual photo views.
// If you want highlights to also open in a modal, this component would need similar Dialog logic as PhotoGrid.

interface WeeklyHighlightsProps {
  photos: Photo[];
}

export function WeeklyHighlights({ photos }: WeeklyHighlightsProps) {
  if (!photos || photos.length === 0) {
    return <p className="text-center text-muted-foreground">No highlights to display this week.</p>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 10 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
    >
      {photos.map((photo) => (
        <motion.div key={photo.id} variants={itemVariants}>
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out h-full flex flex-col group transform hover:-translate-y-1 bg-card hover:border-primary">
            <CardHeader className="p-0 relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={photo.src}
                alt={`${photo.name} - Photo by Amrit Kumar Chanchal`}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 group-hover:scale-110"
                data-ai-hint="highlight event"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <CardTitle className="font-headline text-xl mb-2 truncate text-card-foreground group-hover:text-primary" title={photo.name}>
                  {photo.name}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CategoryIcon category={photo.category} className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-body">{photo.category}</span>
                </div>
              </div>
              {/* If these highlights should also be clickable to open a modal,
                  you'd wrap this Card in a DialogTrigger and add DialogContent,
                  similar to how it's done in PhotoGrid. For now, it remains a static display. */}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
