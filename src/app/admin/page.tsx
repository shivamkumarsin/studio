"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { PhotoEditForm } from "@/components/photo-edit-form";
import { CategoryFilter } from "@/components/category-filter";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo, Category } from "@/types";
import { ALL_CATEGORIES_OPTION } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, ShieldAlert, Plus, Edit, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getCountFromServer } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { useAuth } from "@/contexts/auth-context";

type AdminView = 'overview' | 'upload' | 'edit';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | typeof ALL_CATEGORIES_OPTION>(ALL_CATEGORIES_OPTION);
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

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
      // FIXED: Ensure photos are ordered by latest first (descending order)
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
      setIsLoadingPhotos(false);
    }
  }, [user, toast, ADMIN_EMAIL]);

  const handlePhotoDelete = async (photoId: string) => {
    // Check authorization first
    if (user?.email !== ADMIN_EMAIL) {
      toast({ 
        title: "Unauthorized", 
        description: "You cannot delete photos.", 
        variant: "destructive" 
      });
      return;
    }

    // Prevent multiple simultaneous deletions
    if (deletingPhotoId) {
      toast({
        title: "Please wait",
        description: "Another photo is currently being deleted.",
        variant: "destructive",
      });
      return;
    }

    const photoToDelete = photos.find(p => p.id === photoId);
    if (!photoToDelete) {
      toast({ 
        title: "Error", 
        description: "Photo not found.", 
        variant: "destructive" 
      });
      return;
    }

    setDeletingPhotoId(photoId);

    try {
      console.log(`Starting deletion process for photo: ${photoId}`);
      console.log(`Photo details:`, photoToDelete);
      
      // Show loading toast
      toast({
        title: "Deleting Photo",
        description: `Removing "${photoToDelete.name}"...`,
      });

      // Step 1: Delete from Firestore first
      console.log(`Deleting from Firestore: ${photoId}`);
      await deleteDoc(doc(db, "photos", photoId));
      console.log(`Successfully deleted photo from Firestore: ${photoId}`);
      
      // Step 2: Delete from Firebase Storage if it's a Firebase Storage URL
      if (photoToDelete.src && photoToDelete.src.includes("firebasestorage.googleapis.com")) {
        try {
          console.log(`Attempting to delete file from storage: ${photoToDelete.src}`);
          
          const storage = getStorage();
          
          // Method 1: Try to extract file path from URL
          let filePath = null;
          
          try {
            const url = new URL(photoToDelete.src);
            const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
            
            if (pathMatch) {
              filePath = decodeURIComponent(pathMatch[1]);
              console.log(`Extracted file path: ${filePath}`);
            }
          } catch (urlError) {
            console.error("Error parsing URL:", urlError);
          }
          
          // Method 2: If path extraction failed, try common patterns
          if (!filePath) {
            // Try to extract filename from URL
            const urlParts = photoToDelete.src.split('/');
            const filenamePart = urlParts[urlParts.length - 1];
            if (filenamePart && filenamePart.includes('?')) {
              const filename = filenamePart.split('?')[0];
              filePath = `photos/${filename}`;
              console.log(`Using fallback file path: ${filePath}`);
            }
          }
          
          // Method 3: Try direct reference if we have a path
          if (filePath) {
            const photoRef = ref(storage, filePath);
            await deleteObject(photoRef);
            console.log(`Successfully deleted file from storage: ${filePath}`);
          } else {
            console.warn("Could not determine file path for storage deletion");
            // Don't fail the entire operation if we can't delete from storage
          }
          
        } catch (storageError) {
          console.error("Error deleting from storage (but Firestore deletion succeeded):", storageError);
          
          // Show warning but don't fail the operation
          toast({
            title: "Partial Success",
            description: "Photo removed from database, but file may still exist in storage.",
            variant: "default",
          });
        }
      } else {
        console.log("Photo is not stored in Firebase Storage, skipping storage deletion");
      }
      
      // Step 3: Update local state immediately for better UX
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
      
      // Step 4: Show success message
      toast({
        title: "Photo Deleted Successfully",
        description: `"${photoToDelete.name}" has been removed from your collection.`,
      });

      console.log(`Deletion process completed for photo: ${photoId}`);
      
    } catch (error) {
      console.error("Error deleting photo:", error);
      
      // Provide more specific error messages
      let errorMessage = "Could not delete the photo. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("permission")) {
          errorMessage = "Permission denied. Check your admin privileges.";
        } else if (error.message.includes("not-found")) {
          errorMessage = "Photo not found in database.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Check your internet connection.";
        } else if (error.message.includes("offline")) {
          errorMessage = "You appear to be offline. Please check your connection.";
        }
      }
      
      toast({
        title: "Error Deleting Photo",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If Firestore deletion failed, we don't need to update local state
      // The real-time listener will handle any actual changes
      
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handlePhotoEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setCurrentView('edit');
  };

  const handleEditSave = (updatedPhoto: Photo) => {
    setPhotos(prevPhotos => 
      prevPhotos.map(photo => 
        photo.id === updatedPhoto.id ? updatedPhoto : photo
      )
    );
    setCurrentView('overview');
    setEditingPhoto(null);
    toast({
      title: "Photo Updated",
      description: `"${updatedPhoto.name}" has been updated successfully.`,
    });
  };

  const handleEditCancel = () => {
    setCurrentView('overview');
    setEditingPhoto(null);
  };

  const handleUploadSuccess = () => {
    setCurrentView('overview');
    toast({
      title: "Upload Successful",
      description: "Your photo has been uploaded successfully.",
    });
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

  // Render different views based on currentView state
  if (currentView === 'upload') {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('overview')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>
        <div className="flex justify-center">
          <PhotoUploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    );
  }

  if (currentView === 'edit' && editingPhoto) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleEditCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
          <h1 className="text-2xl font-bold">Edit Post: {editingPhoto.name}</h1>
        </div>
        <div className="flex justify-center">
          <PhotoEditForm 
            photo={editingPhoto}
            onSave={handleEditSave}
            onCancel={handleEditCancel}
          />
        </div>
      </div>
    );
  }

  // Default overview view
  return (
    <div className="space-y-12">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your photo collection and posts</p>
        </div>
        <Button 
          onClick={() => setCurrentView('upload')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create New Post
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar with controls */}
        <section className="md:col-span-1 space-y-6">
          <div className="sticky top-24">
            {/* Firebase Status */}
            <div className="p-4 border rounded-lg shadow-sm bg-card mb-6">
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">System Status</h3>
              <Button 
                onClick={handleTestFirebaseConnection} 
                disabled={isTestingConnection} 
                variant="outline" 
                className="w-full"
              >
                {isTestingConnection ? (
                  <>
                    <WifiOff className="mr-2 h-4 w-4 animate-pulse" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Wifi className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Verify Firebase connectivity and permissions.
              </p>
            </div>

            {/* Statistics */}
            <div className="p-4 border rounded-lg shadow-sm bg-card mb-6">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Photos:</span>
                  <span className="font-semibold">{photos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Filtered:</span>
                  <span className="font-semibold">{filteredPhotos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated Today:</span>
                  <span className="font-semibold">
                    {photos.filter(photo => {
                      if (!photo.updatedAt) return false;
                      const today = new Date();
                      const photoDate = photo.updatedAt.toDate ? photo.updatedAt.toDate() : new Date(photo.updatedAt);
                      return photoDate.toDateString() === today.toDateString();
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="p-4 border rounded-lg shadow-sm bg-card">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Filter by Category</h3>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>
        </section>

        {/* Main content area */}
        <section className="md:col-span-3">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedCategory === ALL_CATEGORIES_OPTION 
                  ? `All Photos (${filteredPhotos.length}) - Latest First` 
                  : `${selectedCategory} (${filteredPhotos.length}) - Latest First`
                }
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentView('upload')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Photo
                </Button>
              </div>
            </div>
            <Separator />
          </div>
          
          {isLoadingPhotos ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl text-muted-foreground">Loading photos from Firebase...</p>
              </div>
            </div>
          ) : (
            <PhotoGrid 
              photos={filteredPhotos} 
              onDelete={handlePhotoDelete}
              onEdit={handlePhotoEdit}
            />
          )}
        </section>
      </div>
    </div>
  );
}