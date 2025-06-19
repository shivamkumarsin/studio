
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category, SiteSettings } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Camera, Mail, Star, ChevronDown, UserCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { WeeklyHighlights } from "@/components/weekly-highlights";

const DEFAULT_HERO_IMAGE = "https://placehold.co/1920x1080.png";
const DEFAULT_PROFILE_IMAGE = "https://placehold.co/400x400.png";


export default function PublicHomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | typeof ALL_CATEGORIES_OPTION>(ALL_CATEGORIES_OPTION);
  const [highlightPhotos, setHighlightPhotos] = useState<Photo[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const { toast } = useToast();

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [isLoadingSiteSettings, setIsLoadingSiteSettings] = useState(true);


  useEffect(() => {
    // Fetch site settings
    const fetchSiteSettings = async () => {
      setIsLoadingSiteSettings(true);
      try {
        const settingsDocRef = doc(db, "settings", "siteAppearance");
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          setSiteSettings(docSnap.data() as SiteSettings);
        } else {
          console.log("No site settings document found, using defaults.");
          setSiteSettings({ heroBackdropUrl: DEFAULT_HERO_IMAGE, profilePhotoUrl: DEFAULT_PROFILE_IMAGE });
        }
      } catch (error: any) {
        console.error("Error fetching site settings:", error);
        toast({
          title: "Error loading site visuals",
          description: `Could not load some site visual elements. Defaulting to placeholders. Error: ${error.message}`,
          variant: "destructive"
        });
        setSiteSettings({ heroBackdropUrl: DEFAULT_HERO_IMAGE, profilePhotoUrl: DEFAULT_PROFILE_IMAGE });
      } finally {
        setIsLoadingSiteSettings(false);
      }
    };
    fetchSiteSettings();

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
      transition: { staggerChildren: 0.15, delayChildren: 0.1, duration: 0.5, ease: "easeOut" }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 90, damping: 15 }
    },
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentHeroImageUrl = siteSettings.heroBackdropUrl || DEFAULT_HERO_IMAGE;
  const currentProfileImageUrl = siteSettings.profilePhotoUrl || DEFAULT_PROFILE_IMAGE;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-card text-card-foreground py-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl md:text-3xl font-headline flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <Camera className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            Amrit's Photo Stack
          </Link>
          <nav className="flex items-center gap-1 md:gap-3">
            <Button variant="ghost" onClick={() => scrollToSection('weekly-highlights-section')} className="text-sm md:text-base hover:text-primary">
              Highlights
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection('about-me-section')} className="text-sm md:text-base hover:text-primary">
              About
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection('category-filter-section')} className="text-sm md:text-base hover:text-primary">
              Gallery
            </Button>
            <Link href="/contact" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm md:text-base hover:text-primary">
                <Mail className="mr-1.5 h-4 w-4" /> Contact
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
        className="relative py-24 md:py-40 text-center overflow-hidden bg-gradient-to-br from-background via-card to-secondary"
      >
        <div className="absolute inset-0 opacity-5 md:opacity-10 z-0">
          {isLoadingSiteSettings ? (
             <div className="w-full h-full bg-muted animate-pulse" />
          ) : (
            <Image
              src={currentHeroImageUrl}
              alt="Hero backdrop for Amrit's Photo Stack"
              fill
              sizes="100vw"
              priority
              className="pointer-events-none object-cover"
              data-ai-hint="abstract dark texture"
            />
          )}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-foreground mb-6"
          >
            Amrit Kumar Chanchal
          </motion.h1>
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-headline text-primary mb-8"
          >
            Photographer & Visual Storyteller
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Exploring the world through my lens. Welcome to my personal collection of aesthetic moments, captured and shared.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-10 py-3 shadow-lg transform transition-transform hover:scale-105 rounded-full"
              onClick={() => scrollToSection('category-filter-section')}
              aria-label="Explore photo gallery"
            >
              Explore Gallery <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <section id="weekly-highlights-section" className="py-16 md:py-24 bg-card scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            className="text-3xl md:text-4xl font-headline font-bold text-center text-primary mb-12 flex items-center justify-center gap-3"
          >
            <Star className="h-8 w-8" />
            Recent Captures
          </motion.h2>
          {isLoadingHighlights ? (
            <div className="text-center py-10">
              <p className="text-xl font-body text-muted-foreground">Loading highlights...</p>
            </div>
          ) : highlightPhotos.length > 0 ? (
            <WeeklyHighlights photos={highlightPhotos} />
          ) : (
            <p className="text-center text-muted-foreground">Fresh shots coming soon. Check back later!</p>
          )}
        </div>
      </section>

      <section id="about-me-section" className="py-16 md:py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            className="text-3xl md:text-4xl font-headline font-bold text-center text-primary mb-12 flex items-center justify-center gap-3"
          >
            <UserCircle className="h-8 w-8" />
            Behind the Lens
          </motion.h2>
          <motion.div 
            variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
          >
            <div className="md:w-1/3 flex-shrink-0">
              {isLoadingSiteSettings ? (
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-muted rounded-lg shadow-xl mx-auto animate-pulse" />
              ) : (
                <Image 
                  src={currentProfileImageUrl} 
                  alt="Portrait of Amrit Kumar Chanchal, photographer"
                  width={400}
                  height={400}
                  className="rounded-lg shadow-xl mx-auto object-cover aspect-square"
                  data-ai-hint="photographer portrait"
                />
              )}
            </div>
            <div className="md:w-2/3 text-center md:text-left">
              <h3 className="text-2xl font-headline text-foreground mb-4">Amrit Kumar Chanchal</h3>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Hello! I'm Amrit, a passionate photographer driven by the desire to capture the beauty and emotion in everyday moments. From vibrant landscapes to intimate portraits, my goal is to tell stories through my lens. 
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                This website is my personal canvas, a place where I share my aesthetic vision with the world. I believe every picture holds a unique narrative, and I'm thrilled to share mine with you. My focus is on creating images that resonate and are discoverable.
              </p>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('category-filter-section')}
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary-foreground"
              >
                View My Work
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <main id="gallery-main-section" className="flex-grow container mx-auto px-4 py-16 md:py-24">
        <div id="category-filter-section" className="scroll-mt-24">
           <motion.h2 
            variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            className="text-3xl md:text-4xl font-headline font-bold text-center text-primary mb-4"
          >
            Photo Gallery
          </motion.h2>
           <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
            Browse through my collection. Select a category to filter the moments. Click any photo to view it larger.
          </p>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
        <Separator className="my-10 md:my-12" />
        {isLoading ? (
           <div className="text-center py-10">
            <p className="text-xl font-body text-muted-foreground">Loading photos from Firebase...</p>
          </div>
        ) : (
           <PhotoGrid photos={filteredPhotos} />
        )}
      </main>

      <footer className="bg-secondary text-secondary-foreground py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center mb-4">
            <Link href="/" className="text-xl font-headline flex items-center gap-2 hover:opacity-80 transition-opacity mb-2">
              <Camera className="h-6 w-6 text-primary" />
              Amrit's Photo Stack
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Capturing life's aesthetic moments, one snapshot at a time. All photos by Amrit Kumar Chanchal.
            </p>
          </div>
          
          <nav className="flex justify-center items-center gap-x-4 sm:gap-x-5 mb-4 text-sm flex-wrap">
            <Button variant="link" className="text-secondary-foreground hover:text-primary p-0" onClick={() => scrollToSection('hero-section')}>Home</Button>
            <Button variant="link" className="text-secondary-foreground hover:text-primary p-0" onClick={() => scrollToSection('weekly-highlights-section')}>Highlights</Button>
            <Button variant="link" className="text-secondary-foreground hover:text-primary p-0" onClick={() => scrollToSection('about-me-section')}>About</Button>
            <Button variant="link" className="text-secondary-foreground hover:text-primary p-0" onClick={() => scrollToSection('gallery-main-section')}>Gallery</Button>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
          </nav>
          
          <p className="font-body text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Amrit Kumar Chanchal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
