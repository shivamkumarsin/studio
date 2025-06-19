
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";


export default function PublicHomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | typeof ALL_CATEGORIES_OPTION>(ALL_CATEGORIES_OPTION);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());

    setIsLoading(true);
    const photosCollection = collection(db, "photos");
    const q = query(photosCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const photosData: Photo[] = [];
      querySnapshot.forEach((doc) => {
        photosData.push({ id: doc.id, ...doc.data() } as Photo);
      });
      setPhotos(photosData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching photos from Firestore:", error);
      toast({
        title: "Error Fetching Photos",
        description: "Could not fetch photos. Check browser console for Firestore errors (e.g., missing index or permissions).",
        variant: "destructive",
      });
      setIsLoading(false);
    });
    
    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [toast]);

  const filteredPhotos =
    selectedCategory === ALL_CATEGORIES_OPTION
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-headline flex items-center gap-3">
            <Camera className="h-10 w-10" />
            Amrit's Photo Stack
          </h1>
        </div>
      </header>

      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative py-20 md:py-32 bg-gradient-to-br from-secondary via-background to-background text-center overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 md:opacity-10 z-0">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Abstract textured background"
            layout="fill"
            objectFit="cover"
            data-ai-hint="abstract texture"
            priority
            className="pointer-events-none"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-foreground mb-6"
          >
            Capture Life's Moments
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Welcome to Amrit's Photo Stack, a personal collection of cherished memories and beautiful snapshots. Explore by category and relive the moments that matter.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-10 py-3 shadow-lg transform transition-transform hover:scale-105"
              onClick={() => document.getElementById('category-filter-section')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Explore photos by scrolling to categories"
            >
              Explore Photos
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div id="category-filter-section" className="scroll-mt-24"> {/* scroll-mt for sticky header offset */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
        <Separator className="my-8 md:my-10" />
        {isLoading ? (
           <div className="text-center py-10">
            <p className="text-xl font-body text-muted-foreground">Loading photos from Firebase...</p>
          </div>
        ) : (
           <PhotoGrid photos={filteredPhotos} />
        )}
      </main>

      <footer className="bg-secondary text-secondary-foreground py-8 text-center mt-auto">
        <div className="container mx-auto px-4">
          <p className="font-body text-sm">
            &copy; {currentTime ? new Date().getFullYear() : '...'} Amrit's Photo Stack. All rights reserved.
            {currentTime && ` Current time: ${currentTime}`}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Discover moments, relive memories.
          </p>
        </div>
      </footer>
    </div>
  );
}
