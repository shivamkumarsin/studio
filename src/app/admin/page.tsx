
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getCountFromServer } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { useAuth } from "@/contexts/auth-context";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | typeof ALL_CATEGORIES_OPTION>(ALL_CATEGORIES_OPTION);
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const ADMIN_EMAIL = 'amritkumarchanchal@gmail.com';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      setIsLoadingPhotos(true);
      const photosCollection = collection(db, "photos");
      const q = query(photosCollection, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const photosData: Photo[] = [];
        querySnapshot.forEach((doc) => {
          photosData.push({ id: doc.id, ...doc.data() } as Photo);
        });
        setPhotos(photosData);
        setIsLoadingPhotos(false);
      }, (error) => {
        console.error("Error fetching photos from Firestore:", error);
        toast({
          title: "Error Fetching Photos",
          description: "Could not fetch photos. Check browser console for Firestore errors (e.g., missing index or permissions).",
          variant: "destructive",
        });
        setIsLoadingPhotos(false);
      });
      return () => unsubscribe();
    } else if (user && user.email !== ADMIN_EMAIL) {
      setIsLoadingPhotos(false); // Stop loading if not authorized
    }
  }, [user, toast, ADMIN_EMAIL]);


  const handlePhotoDelete = async (photoId: string) => {
    if (user?.email !== ADMIN_EMAIL) {
      toast({ title: "Unauthorized", description: "You cannot delete photos.", variant: "destructive" });
      return;
    }
    const photoToDelete = photos.find(p => p.id === photoId);
    if (!photoToDelete) {
      toast({ title: "Error", description: "Photo not found.", variant: "destructive" });
      return;
    }

    try {
      await deleteDoc(doc(db, "photos", photoId));
      
      if (photoToDelete.src && photoToDelete.src.includes("firebasestorage.googleapis.com")) {
        const storage = getStorage();
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

  if (loading) {
    return <div className="text-center py-10"><p className="text-xl font-body text-muted-foreground">Verifying access...</p></div>;
  }

  if (!user) {
    return <div className="text-center py-10"><p className="text-xl font-body text-muted-foreground">Redirecting to login...</p></div>;
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  const filteredPhotos =
    selectedCategory === ALL_CATEGORIES_OPTION
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  return (
    <div className="space-y-12">
      {/* Site Appearance Settings section removed */}
      {/* <Separator /> // This separator can also be removed if it was only for the settings section */}

      <div className="grid md:grid-cols-3 gap-8">
        <section aria-labelledby="upload-section-title" className="md:col-span-1">
          <div className="sticky top-24"> 
            <h2 id="upload-section-title" className="sr-only">Upload Photos</h2>
            <PhotoUploadForm />
          </div>
        </section>

        <section aria-labelledby="gallery-section-title" className="md:col-span-2">
          <h2 id="gallery-section-title" className="sr-only">Photo Gallery Management</h2>
          
          <div className="mb-6 p-4 border rounded-lg shadow-sm bg-card">
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
          {isLoadingPhotos ? (
            <div className="text-center py-10">
              <p className="text-xl font-body text-muted-foreground">Loading photos from Firebase...</p>
            </div>
          ) : (
             <PhotoGrid photos={filteredPhotos} onDelete={handlePhotoDelete} />
          )}
        </section>
      </div>
    </div>
  );
}
