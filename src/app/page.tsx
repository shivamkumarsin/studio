
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Camera, Mail, Star, CalendarDays, Users, Briefcase } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { WeeklyHighlights } from "@/components/weekly-highlights"; // New component

export default function PublicHomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | typeof ALL_CATEGORIES_OPTION>(ALL_CATEGORIES_OPTION);
  const [highlightPhotos, setHighlightPhotos] = useState<Photo[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());

    // Fetch all photos for the main grid
    setIsLoading(true);
    const photosCollection = collection(db, "photos");
    const q = query(photosCollection, orderBy("createdAt", "desc"));

    const unsubscribePhotos = onSnapshot(q, (querySnapshot) => {
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
        description: "Could not fetch photos. Check browser console for Firestore errors.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    // Fetch highlight photos (e.g., latest 3)
    setIsLoadingHighlights(true);
    const highlightsQuery = query(photosCollection, orderBy("createdAt", "desc"), limit(3));
    const unsubscribeHighlights = onSnapshot(highlightsQuery, (querySnapshot) => {
      const highlightsData: Photo[] = [];
      querySnapshot.forEach((doc) => {
        highlightsData.push({ id: doc.id, ...doc.data() } as Photo);
      });
      setHighlightPhotos(highlightsData);
      setIsLoadingHighlights(false);
    }, (error) => {
      console.error("Error fetching highlight photos:", error);
      toast({
        title: "Error Fetching Highlights",
        description: "Could not fetch highlight photos.",
        variant: "destructive",
      });
      setIsLoadingHighlights(false);
    });
    
    return () => {
      unsubscribePhotos();
      unsubscribeHighlights();
    };
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

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-3xl md:text-4xl font-headline flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Camera className="h-8 w-8 md:h-10 md:w-10" />
            Amrit's Photo Stack
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <Button variant="ghost" onClick={() => scrollToSection('weekly-highlights-section')} className="text-sm md:text-base hover:bg-primary/20">
              Highlights
            </Button>
            <Link href="/contact" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm md:text-base hover:bg-primary/20">
                <Mail className="mr-2 h-4 w-4" /> Contact Us
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <motion.section
        id="hero-section"
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
              onClick={() => scrollToSection('category-filter-section')}
              aria-label="Explore photos by scrolling to categories"
            >
              Explore Photos
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <section id="weekly-highlights-section" className="py-12 md:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            className="text-3xl md:text-4xl font-headline font-bold text-center text-foreground mb-10 flex items-center justify-center gap-3"
          >
            <Star className="h-8 w-8 text-accent" />
            Highlights of the Week
          </motion.h2>
          {isLoadingHighlights ? (
            <div className="text-center py-10">
              <p className="text-xl font-body text-muted-foreground">Loading highlights...</p>
            </div>
          ) : highlightPhotos.length > 0 ? (
            <WeeklyHighlights photos={highlightPhotos} />
          ) : (
            <p className="text-center text-muted-foreground">No highlights to show this week. Check back soon!</p>
          )}
        </div>
      </section>
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div id="category-filter-section" className="scroll-mt-24">
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

      <footer className="bg-secondary text-secondary-foreground py-12 md:py-16 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-3 gap-8 mb-8 items-start">
            <div>
              <h3 className="text-xl font-headline font-semibold mb-3 flex items-center justify-center md:justify-start gap-2">
                <Camera className="h-6 w-6" /> Amrit's Photo Stack
              </h3>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                Reliving memories, one photo at a time. A personal collection of moments captured and cherished.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-headline font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="text-secondary-foreground hover:text-primary p-0" onClick={() => scrollToSection('hero-section')}>Home</Button></li>
                <li><Button variant="link" className="text-secondary-foreground hover:text-primary p-0" onClick={() => scrollToSection('weekly-highlights-section')}>Highlights</Button></li>
                <li><Button variant="link" className="text-secondary-foreground hover:text-primary p-0" onClick={() => scrollToSection('category-filter-section')}>Categories</Button></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-headline font-semibold mb-3">Connect (Example)</h3>
              <div className="flex justify-center md:justify-start space-x-4">
                <Link href="#" aria-label="Facebook" className="text-secondary-foreground hover:text-primary transition-colors">
                  <Users className="h-6 w-6" /> {/* Placeholder for Facebook icon */}
                </Link>
                <Link href="#" aria-label="Instagram" className="text-secondary-foreground hover:text-primary transition-colors">
                  <CalendarDays className="h-6 w-6" /> {/* Placeholder for Instagram icon */}
                </Link>
                <Link href="#" aria-label="Twitter" className="text-secondary-foreground hover:text-primary transition-colors">
                  <Briefcase className="h-6 w-6" /> {/* Placeholder for Twitter icon */}
                </Link>
              </div>
               <p className="text-xs text-muted-foreground mt-4 text-center md:text-left">
                Follow Amrit's journey through photos on social media (links are illustrative).
              </p>
            </div>
          </div>
          <Separator className="my-6 bg-border/50" />
          <p className="font-body text-sm">
            &copy; {currentTime ? new Date().getFullYear() : '...'} Amrit's Photo Stack. All rights reserved.
            {currentTime && ` Current time: ${currentTime}`}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Designed with care for capturing and sharing memories.
          </p>
        </div>
      </footer>
    </div>
  );
}
