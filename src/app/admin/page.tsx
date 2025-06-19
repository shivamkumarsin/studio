"use client";

import { useState, useEffect } from "react";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
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
    <div className="grid md:grid-cols-3 gap-8">
      <section aria-labelledby="upload-section-title" className="md:col-span-1">
        <div className="sticky top-24"> {/* Make upload form sticky */}
          <h2 id="upload-section-title" className="sr-only">Upload Photos</h2>
          <PhotoUploadForm onPhotoAdd={handlePhotoAdd} />
        </div>
      </section>

      <section aria-labelledby="gallery-section-title" className="md:col-span-2">
        <h2 id="gallery-section-title" className="sr-only">Photo Gallery Management</h2>
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
  );
}
