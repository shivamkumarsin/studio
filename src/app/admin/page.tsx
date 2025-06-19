
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";


export default function AdminPage() {
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
        title: "Error",
        description: "Could not fetch photos. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [toast]);


  const handlePhotoDelete = async (photoId: string) => {
    // Note: This is a placeholder. Actual deletion from Firebase will be added next.
    // For now, it removes from local state for UI feedback.
    // In a real Firebase scenario, onSnapshot would update the UI automatically.
     const photoToDelete = photos.find(p => p.id === photoId);
    if (!photoToDelete) {
      toast({ title: "Error", description: "Photo not found.", variant: "destructive" });
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "photos", photoId));
      
      // Delete from Firebase Storage if src is a Firebase Storage URL
      if (photoToDelete.src.includes("firebasestorage.googleapis.com")) {
        const storage = getStorage();
        const photoRef = ref(storage, photoToDelete.src);
        await deleteObject(photoRef);
      }
      
      toast({
        title: "Photo Deleted",
        description: "The photo has been removed.",
      });
      // No need to setPhotos here, onSnapshot will update the list
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error Deleting Photo",
        description: "Could not remove the photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredPhotos =
    selectedCategory === ALL_CATEGORIES_OPTION
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <section aria-labelledby="upload-section-title" className="md:col-span-1">
        <div className="sticky top-24"> 
          <h2 id="upload-section-title" className="sr-only">Upload Photos</h2>
          <PhotoUploadForm />
        </div>
      </section>

      <section aria-labelledby="gallery-section-title" className="md:col-span-2">
        <h2 id="gallery-section-title" className="sr-only">Photo Gallery Management</h2>
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
           <PhotoGrid photos={filteredPhotos} onDelete={handlePhotoDelete} />
        )}
      </section>
    </div>
  );
}
