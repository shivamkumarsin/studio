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
import { 
  Images, 
  Mail, 
  Camera,
  Home,
  ArrowLeft
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | typeof ALL_CATEGORIES_OPTION>(ALL_CATEGORIES_OPTION);
  const { toast } = useToast();

  useEffect(() => {
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
        description: "Could not fetch photos. Check browser console for Firestore errors.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const filteredPhotos =
    selectedCategory === ALL_CATEGORIES_OPTION
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass sticky top-0 z-50 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-primary p-2 rounded-full blue-glow">
                  <Camera className="h-6 w-6 text-black" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  PhotoStack Pro
                </h1>
                <p className="text-xs text-muted-foreground">Professional Photography</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 smooth-hover">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 smooth-hover">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 blue-glow-hover btn-modern"
                >
                  Admin
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-12"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 blue-glow">
              <Images className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Complete Portfolio</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 clean-headline">
              Photography Categories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore my complete collection of photography work organized by category. 
              Each section represents different aspects of my professional practice and creative vision.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div variants={itemVariants} className="mb-8">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </motion.div>

          <Separator className="my-8 bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {/* Results Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                {selectedCategory === ALL_CATEGORIES_OPTION 
                  ? `All Photos (${filteredPhotos.length})` 
                  : `${selectedCategory} (${filteredPhotos.length})`
                }
              </h2>
            </div>
          </motion.div>

          {/* Photo Grid */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xl text-muted-foreground">Loading portfolio...</p>
                </div>
              </div>
            ) : (
              <PhotoGrid photos={filteredPhotos} />
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative py-16 border-t border-border/50 mt-auto">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-primary p-2 rounded-full blue-glow">
                  <Camera className="h-6 w-6 text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">
                  PhotoStack Pro
                </h3>
                <p className="text-xs text-muted-foreground">Professional Photography</p>
              </div>
            </Link>
            
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Professional photography services specializing in visual storytelling and creative excellence. 
              Bringing your vision to life through the art of photography.
            </p>
          </div>
          
          <nav className="flex justify-center items-center gap-6 mb-8 flex-wrap">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Home
            </Link>
            <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Categories
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Contact
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Admin
            </Link>
          </nav>
          
          <div className="text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6"></div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Amrit Kumar Chanchal. All rights reserved. Professional Photography Services.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}