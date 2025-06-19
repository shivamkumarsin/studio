"use client";

import Image from "next/image";
import Link from "next/link"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Photo } from "@/types";
import { motion } from "framer-motion";
import { CategoryIcon } from "./icons/category-icon";
import { Eye, Heart, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeeklyHighlightsProps {
  photos: Photo[];
}

export function WeeklyHighlights({ photos }: WeeklyHighlightsProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl"></div>
          <div className="relative glass p-8 rounded-full border border-accent/20">
            <Star className="w-16 h-16 text-accent mx-auto" />
          </div>
        </div>
        <p className="text-muted-foreground">No featured work to display at this time.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
    >
      {photos.map((photo, index) => (
        <motion.div 
          key={photo.id} 
          variants={itemVariants}
          whileHover={{ y: -12, scale: 1.03 }}
          className="group"
        >
          <Link href={`/amrit-kumar-chanchal/photo/${photo.id}`} passHref legacyBehavior>
            <a className="block h-full">
              <Card className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 h-full flex flex-col group glass border border-accent/20 hover:border-accent/40 relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                
                {/* Featured badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-1 px-3 py-1 bg-accent/90 text-accent-foreground rounded-full text-xs font-bold backdrop-blur-sm shadow-lg">
                    <Award className="h-3 w-3 animate-pulse" />
                    <span>Featured</span>
                  </div>
                </div>

                <CardHeader className="p-0 relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={`${photo.name} - Photo by Amrit Kumar Chanchal`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="transition-all duration-700 group-hover:scale-110 object-cover"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Hover actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex gap-3">
                      <Button size="lg" className="bg-accent/90 hover:bg-accent text-accent-foreground rounded-full shadow-xl backdrop-blur-sm transform hover:scale-110 transition-all duration-300">
                        <Eye className="h-5 w-5 mr-2" />
                        View
                      </Button>
                      <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full shadow-xl backdrop-blur-sm transform hover:scale-110 transition-all duration-300">
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <CategoryIcon category={photo.category} className="h-4 w-4 text-accent" />
                      <span className="text-accent text-sm font-medium">{photo.category}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 flex-grow flex flex-col justify-between relative">
                  <div>
                    <CardTitle className="text-xl font-bold mb-3 text-card-foreground group-hover:text-accent transition-colors duration-300 line-clamp-2" title={photo.name}>
                      {photo.name}
                    </CardTitle>
                    
                    {photo.description && (
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {photo.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={photo.category} className="h-4 w-4 text-accent" />
                        <span className="text-sm text-muted-foreground font-medium">{photo.category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">Featured</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}