"use client";

import { useState, useEffect } from "react";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Camera } from "lucide-react";

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | typeof ALL_CATEGORIES_OPTION>(ALL_CATEGORIES_OPTION);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load photos from localStorage if they exist
    const storedPhotos = localStorage.getItem("userPhotos");
    if (storedPhotos) {
      try {
        setPhotos(JSON.parse(storedPhotos));
      } catch (error) {
        console.error("Error parsing photos from localStorage", error);
        localStorage.removeItem("userPhotos"); // Clear corrupted data
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      // Save photos to localStorage whenever they change
      localStorage.setItem("userPhotos", JSON.stringify(photos));
    }
  }, [photos, isClient]);


  const handlePhotoAdd = (newPhotoData: Omit<Photo, "id">) => {
    const newPhoto: Photo = {
      ...newPhotoData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // More unique ID
    };
    setPhotos((prevPhotos) => [newPhoto, ...prevPhotos]);
  };

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
            Photo Album Chronicles
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <section aria-labelledby="upload-section-title" className="md:col-span-1">
            <div className="sticky top-24"> {/* Make upload form sticky */}
              <h2 id="upload-section-title" className="sr-only">Upload Photos</h2>
              <PhotoUploadForm onPhotoAdd={handlePhotoAdd} />
            </div>
          </section>

          <section aria-labelledby="gallery-section-title" className="md:col-span-2">
            <h2 id="gallery-section-title" className="sr-only">Photo Gallery</h2>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <Separator className="my-6" />
            {isClient ? (
               <PhotoGrid photos={filteredPhotos} />
            ) : (
              <div className="text-center py-10">
                <p className="text-xl font-body text-muted-foreground">Loading photos...</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-4 text-center mt-auto">
        <p className="font-body text-sm">&copy; {new Date().getFullYear()} Photo Album Chronicles. All rights reserved.</p>
      </footer>
    </div>
  );
}
