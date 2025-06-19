
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
import { UploadCloud, Image as ImageIcon, User, RefreshCw } from "lucide-react";
import type { SiteSettings } from "@/types";
import { Progress } from "@/components/ui/progress";

const DEFAULT_PLACEHOLDER = "https://placehold.co/600x400.png";

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
        setProfilePhotoPreview(settings.profilePhotoUrl || null);
        setCurrentHeroBackdropUrl(settings.heroBackdropUrl || null);
        setHeroBackdropPreview(settings.heroBackdropUrl || null);
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      toast({ title: "Error loading current settings", variant: "destructive" });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setter(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setter(null);
      // Revert to current URL if file is deselected, or null if none
      if (setter === setProfilePhotoFile) previewSetter(currentProfilePhotoUrl);
      if (setter === setHeroBackdropFile) previewSetter(currentHeroBackdropUrl);
    }
  };

  const handleUpload = async (
    file: File | null,
    storagePath: string,
    fieldName: keyof SiteSettings,
    setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
    setProgress: React.Dispatch<React.SetStateAction<number>>,
    successMessage: string
  ) => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const fileRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(fileRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await setDoc(settingsDocRef, { [fieldName]: downloadURL, updatedAt: serverTimestamp() }, { merge: true });
            toast({ title: "Success!", description: successMessage });
            await fetchSiteSettings(); // Refresh current images
            resolve();
          }
        );
      });
    } catch (error) {
      // Error already handled by toast in promise reject
    } finally {
      setIsUploading(false);
      setProgress(0);
       // Clear the file input after upload
      if (fieldName === 'profilePhotoUrl') setProfilePhotoFile(null);
      if (fieldName === 'heroBackdropUrl') setHeroBackdropFile(null);
    }
  };
  
  const handleSubmitProfilePhoto = (e: FormEvent) => {
    e.preventDefault();
    handleUpload(profilePhotoFile, "site_assets/profile_photo", "profilePhotoUrl", setIsUploadingProfile, setProfileUploadProgress, "Profile photo updated.");
  };

  const handleSubmitHeroBackdrop = (e: FormEvent) => {
    e.preventDefault();
    handleUpload(heroBackdropFile, "site_assets/hero_backdrop", "heroBackdropUrl", setIsUploadingBackdrop, setBackdropUploadProgress, "Hero backdrop updated.");
  };


  if (isLoadingSettings) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
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
          <CardDescription>This photo appears in the "About Me" section on your homepage.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitProfilePhoto}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-photo-upload">New Profile Photo</Label>
              <Input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setProfilePhotoFile, setProfilePhotoPreview)}
                disabled={isUploadingProfile}
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
                  className="mt-2 rounded-md object-cover aspect-square border shadow-sm"
                  data-ai-hint="profile avatar"
                />
              </div>
            )}
            {isUploadingProfile && (
              <div className="space-y-1">
                <Progress value={profileUploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">{Math.round(profileUploadProgress)}%</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUploadingProfile || !profilePhotoFile}>
              {isUploadingProfile ? "Uploading..." : "Save Profile Photo"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <ImageIcon className="text-primary" /> Manage Hero Backdrop Image
          </CardTitle>
          <CardDescription>This is the large background image on your homepage hero section.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitHeroBackdrop}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero-backdrop-upload">New Hero Backdrop</Label>
              <Input
                id="hero-backdrop-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setHeroBackdropFile, setHeroBackdropPreview)}
                disabled={isUploadingBackdrop}
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
                  className="mt-2 rounded-md object-cover aspect-[2/1] border shadow-sm"
                  data-ai-hint="abstract background"
                />
              </div>
            )}
            {isUploadingBackdrop && (
              <div className="space-y-1">
                <Progress value={backdropUploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">{Math.round(backdropUploadProgress)}%</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUploadingBackdrop || !heroBackdropFile}>
              {isUploadingBackdrop ? "Uploading..." : "Save Hero Backdrop"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
