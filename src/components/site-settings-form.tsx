
"use client";

import { useState, type FormEvent, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { User, ImageIcon as ImageIconLucide, RefreshCw } from "lucide-react"; // Renamed ImageIcon to avoid conflict
import type { SiteSettings } from "@/types";
import { Progress } from "@/components/ui/progress";

const DEFAULT_PLACEHOLDER = "https://placehold.co/600x400.png";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function SiteSettingsForm() {
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [currentProfilePhotoUrl, setCurrentProfilePhotoUrl] = useState<string | null>(null);

  const [heroBackdropFile, setHeroBackdropFile] = useState<File | null>(null);
  const [heroBackdropPreview, setHeroBackdropPreview] = useState<string | null>(null);
  const [currentHeroBackdropUrl, setCurrentHeroBackdropUrl] = useState<string | null>(null);
  
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profileUploadProgress, setProfileUploadProgress] = useState(0);
  const [isUploadingBackdrop, setIsUploadingBackdrop] = useState(false);
  const [backdropUploadProgress, setBackdropUploadProgress] = useState(0);

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const { toast } = useToast();

  const settingsDocRef = doc(db, "settings", "siteAppearance");

  const fetchSiteSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const settings = docSnap.data() as SiteSettings;
        setCurrentProfilePhotoUrl(settings.profilePhotoUrl || null);
        // Only set preview from current URL if no file is selected for preview
        if (!profilePhotoFile) setProfilePhotoPreview(settings.profilePhotoUrl || null);
        
        setCurrentHeroBackdropUrl(settings.heroBackdropUrl || null);
        if (!heroBackdropFile) setHeroBackdropPreview(settings.heroBackdropUrl || null);

      } else {
        // If no settings, ensure previews are also cleared or default
        if (!profilePhotoFile) setProfilePhotoPreview(null);
        if (!heroBackdropFile) setHeroBackdropPreview(null);
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      toast({ title: "Error loading current settings", description: "Could not fetch existing site appearance settings.", variant: "destructive" });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // profilePhotoFile and heroBackdropFile are intentionally omitted to prevent re-fetch on file selection

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileSetter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
    currentUrlForReset: string | null
  ) => {
    const inputEl = event.target;
    if (inputEl.files && inputEl.files[0]) {
      const file = inputEl.files[0];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: "File Too Large",
          description: `Maximum file size is ${MAX_FILE_SIZE_MB}MB. "${file.name}" was not selected.`,
          variant: "destructive",
        });
        inputEl.value = ""; // Clear the input
        fileSetter(null);
        previewSetter(currentUrlForReset); // Revert preview to current one
        return;
      }
      fileSetter(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      fileSetter(null);
      previewSetter(currentUrlForReset); // Revert to current URL if file is deselected
    }
  };

  const handleUpload = async (
    file: File | null,
    storagePath: string,
    fieldName: keyof SiteSettings,
    setIsUploadingState: React.Dispatch<React.SetStateAction<boolean>>,
    setProgressState: React.Dispatch<React.SetStateAction<number>>,
    successMessage: string,
    inputId: string,
    fileStateSetter: React.Dispatch<React.SetStateAction<File | null>>,
    previewStateSetter: React.Dispatch<React.SetStateAction<string | null>>,
    currentUrlForReset: string | null
  ) => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    // Redundant size check, handleFileChange should catch it, but good for safety.
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({ title: "File Too Large", description: `File exceeds ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
      const inputElement = document.getElementById(inputId) as HTMLInputElement;
      if (inputElement) inputElement.value = "";
      fileStateSetter(null);
      previewStateSetter(currentUrlForReset);
      return;
    }

    setIsUploadingState(true);
    setProgressState(0);

    try {
      const fileRef = ref(storage, storagePath); // Fixed path means overwrite
      const uploadTask = uploadBytesResumable(fileRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgressState(Math.round(progress));
          },
          (error) => {
            console.error("Firebase Storage Upload Error:", error);
            let description = "Could not upload the file. Please try again.";
            if (error.code === 'storage/unauthorized') {
              description = "Upload failed: Permission denied. Check Firebase Storage rules.";
            } else if (error.code === 'storage/canceled') {
              description = "Upload was canceled.";
            } else if (error.code === 'storage/quota-exceeded') {
              description = `Upload failed: Storage quota exceeded. Max file size is ${MAX_FILE_SIZE_MB}MB.`;
            } else if (error.message.includes('max file size')) { // Catch from rules potentially
               description = `Upload failed: File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`;
            }
            toast({ title: "Upload Failed", description, variant: "destructive" });
            reject(error);
          },
          async () => { // Upload complete
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              await setDoc(settingsDocRef, { [fieldName]: downloadURL, updatedAt: serverTimestamp() }, { merge: true });
              
              toast({ title: "Success!", description: successMessage });
              fileStateSetter(null); // Clear the selected file state first

              await fetchSiteSettings(); // Refresh all settings (this will update previews)
              resolve();
            } catch (firestoreOrFetchError) {
                console.error("Error saving settings or refreshing post-upload:", firestoreOrFetchError);
                toast({ title: "Processing Error", description: "Photo uploaded, but failed to finalize settings. Please check the console.", variant: "destructive" });
                reject(firestoreOrFetchError); // Propagate to outer catch
            }
          }
        );
      });
    } catch (uploadError) {
      // Errors from the promise (upload or post-upload processing) are caught here.
      // Toasts are generally handled by reject handlers within the promise.
      // This primarily catches errors if the promise itself couldn't be constructed or an unexpected error.
      console.error("Overall error in handleUpload:", uploadError);
    } finally {
      setIsUploadingState(false);
      setProgressState(0);
      const inputElement = document.getElementById(inputId) as HTMLInputElement;
      if (inputElement) inputElement.value = ""; // Ensure input is cleared

      // If the file state is still set (e.g., upload failed before clearing), clear it now
      // and revert preview to the last known good URL.
      if (fileStateSetter === setProfilePhotoFile && profilePhotoFile) {
         setProfilePhotoFile(null);
         setProfilePhotoPreview(currentProfilePhotoUrl);
      }
      if (fileStateSetter === setHeroBackdropFile && heroBackdropFile) {
         setHeroBackdropFile(null);
         setHeroBackdropPreview(currentHeroBackdropUrl);
      }
    }
  };
  
  const handleSubmitProfilePhoto = (e: FormEvent) => {
    e.preventDefault();
    handleUpload(
      profilePhotoFile, 
      "site_assets/profile_photo", // Fixed name implies overwrite
      "profilePhotoUrl", 
      setIsUploadingProfile, 
      setProfileUploadProgress, 
      "Profile photo updated successfully.",
      "profile-photo-upload",
      setProfilePhotoFile,
      setProfilePhotoPreview,
      currentProfilePhotoUrl
    );
  };

  const handleSubmitHeroBackdrop = (e: FormEvent) => {
    e.preventDefault();
    handleUpload(
      heroBackdropFile, 
      "site_assets/hero_backdrop", // Fixed name implies overwrite
      "heroBackdropUrl", 
      setIsUploadingBackdrop, 
      setBackdropUploadProgress, 
      "Hero backdrop updated successfully.",
      "hero-backdrop-upload",
      setHeroBackdropFile,
      setHeroBackdropPreview,
      currentHeroBackdropUrl
    );
  };


  if (isLoadingSettings) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <RefreshCw className="animate-spin text-primary" /> Loading Site Settings...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 bg-muted rounded animate-pulse w-full"></div>
          <div className="h-20 bg-muted rounded animate-pulse w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <User className="text-primary" /> Manage Profile Photo
          </CardTitle>
          <CardDescription>This photo appears in the "About Me" section. Max file size: {MAX_FILE_SIZE_MB}MB.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitProfilePhoto}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-photo-upload">New Profile Photo</Label>
              <Input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setProfilePhotoFile, setProfilePhotoPreview, currentProfilePhotoUrl)}
                disabled={isUploadingProfile}
                className="file:text-primary-foreground file:bg-primary hover:file:bg-primary/90"
              />
            </div>
            {(profilePhotoPreview || currentProfilePhotoUrl) && (
              <div>
                <Label>Preview / Current:</Label>
                <Image
                  src={profilePhotoPreview || DEFAULT_PLACEHOLDER}
                  alt="Profile photo preview"
                  width={200}
                  height={200}
                  className="mt-2 rounded-lg object-cover aspect-square border shadow-md"
                  data-ai-hint="profile avatar"
                  key={profilePhotoPreview || currentProfilePhotoUrl || 'profile_fallback'} // Key for re-render on src change
                />
              </div>
            )}
            {isUploadingProfile && (
              <div className="space-y-1">
                <Progress value={profileUploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">{profileUploadProgress}%</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUploadingProfile || !profilePhotoFile} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isUploadingProfile ? "Uploading Profile Photo..." : "Save Profile Photo"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <ImageIconLucide className="text-primary" /> Manage Hero Backdrop Image
          </CardTitle>
          <CardDescription>Large background image for the homepage hero. Max file size: {MAX_FILE_SIZE_MB}MB.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitHeroBackdrop}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero-backdrop-upload">New Hero Backdrop</Label>
              <Input
                id="hero-backdrop-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setHeroBackdropFile, setHeroBackdropPreview, currentHeroBackdropUrl)}
                disabled={isUploadingBackdrop}
                className="file:text-primary-foreground file:bg-primary hover:file:bg-primary/90"
              />
            </div>
            {(heroBackdropPreview || currentHeroBackdropUrl) && (
              <div>
                <Label>Preview / Current:</Label>
                <Image
                  src={heroBackdropPreview || DEFAULT_PLACEHOLDER}
                  alt="Hero backdrop preview"
                  width={300}
                  height={150}
                  className="mt-2 rounded-lg object-cover aspect-[2/1] border shadow-md"
                  data-ai-hint="abstract background"
                  key={heroBackdropPreview || currentHeroBackdropUrl || 'hero_fallback'} // Key for re-render
                />
              </div>
            )}
            {isUploadingBackdrop && (
              <div className="space-y-1">
                <Progress value={backdropUploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">{backdropUploadProgress}%</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUploadingBackdrop || !heroBackdropFile} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isUploadingBackdrop ? "Uploading Backdrop..." : "Save Hero Backdrop"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    