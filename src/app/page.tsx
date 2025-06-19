
"use client";

import { useState, useEffect } from "react";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
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
        title: "Error",
        description: "Could not fetch photos. Please try again later.",
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-headline flex items-center gap-3">
            <Camera className="h-10 w-10" />
            Amrit's Photo Stack
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <Separator className="my-6" />
        {isLoading ? (
           <div className="text-center py-10">
            <p className="text-xl font-body text-muted-foreground">Loading photos from Firebase...</p>
          </div>
        ) : (
           <PhotoGrid photos={filteredPhotos} />
        )}
      </main>

      <footer className="bg-secondary text-secondary-foreground py-4 text-center mt-auto">
        <p className="font-body text-sm">
          &copy; {currentTime ? new Date().getFullYear() : '...'} Amrit's Photo Stack. All rights reserved.
          {currentTime && ` Current time: ${currentTime}`}
        </p>
      </footer>
    </div>
  );
}
