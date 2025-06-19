
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getCountFromServer } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";


export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | typeof ALL_CATEGORIES_OPTION>(ALL_CATEGORIES_OPTION);
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

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
        description: "Could not fetch photos. Check browser console for Firestore errors (e.g., missing index or permissions).",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [toast]);


  const handlePhotoDelete = async (photoId: string) => {
    const photoToDelete = photos.find(p => p.id === photoId);
    if (!photoToDelete) {
      toast({ title: "Error", description: "Photo not found.", variant: "destructive" });
      return;
    }

    try {
      await deleteDoc(doc(db, "photos", photoId));
      
      // Check if the photo src is a Firebase Storage URL before attempting to delete
      if (photoToDelete.src && photoToDelete.src.includes("firebasestorage.googleapis.com")) {
        const storage = getStorage();
        // Create a reference from the full URL
        const photoRef = ref(storage, photoToDelete.src);
        await deleteObject(photoRef);
      }
      
      toast({
        title: "Photo Deleted",
        description: `"${photoToDelete.name}" has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error Deleting Photo",
        description: "Could not remove the photo. Please try again. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleTestFirebaseConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Attempt a simple read operation (e.g., get document count)
      const photosCollection = collection(db, "photos");
      await getCountFromServer(photosCollection); 
      toast({
        title: "Firebase Connection OK",
        description: "Successfully connected to Firestore and accessed the photos collection.",
        variant: "default",
      });
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      toast({
        title: "Firebase Connection Error",
        description: "Could not connect to Firestore or access photos. Check browser console for specific error.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
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
        
        <div className="mb-4 p-4 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg font-semibold mb-2 text-card-foreground">Firebase Status</h3>
          <Button onClick={handleTestFirebaseConnection} disabled={isTestingConnection} variant="outline" className="w-full sm:w-auto">
            {isTestingConnection ? (
              <>
                <WifiOff className="mr-2 h-4 w-4 animate-pulse" />
                Testing Connection...
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                Test Firebase Connection
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Click this button to perform a quick check if the application can connect to your Firebase Firestore database.
          </p>
        </div>
        
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
