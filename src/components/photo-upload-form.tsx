
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Photo, Category } from "@/types";
import { APP_CATEGORIES } from "@/types";
import { UploadCloud } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "@/components/ui/progress";

interface PhotoUploadFormProps {
  onPhotoAdd?: (photoId: string) => void; // Optional: callback after successful upload
}

export function PhotoUploadForm({ onPhotoAdd }: PhotoUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | "">(APP_CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !selectedCategory) {
      toast({
        title: "Missing Information",
        description: "Please select a photo and a category.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `photos/${Date.now()}_${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          let progress = 0;
          if (snapshot.totalBytes > 0) {
            progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          } else if (snapshot.bytesTransferred > 0 && snapshot.totalBytes === 0) {
            progress = 100;
          }
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Firebase Storage Upload Error:", error);
          let description = "Could not upload the photo. Please try again.";
          if (error.code) {
            switch (error.code) {
              case 'storage/unauthorized':
                description = "Permission denied. Check Firebase Storage security rules and ensure your bucket is correctly configured and accessible. You might need to adjust rules in the Firebase console (Storage > Rules).";
                break;
              case 'storage/canceled':
                description = "Upload canceled.";
                break;
              case 'storage/unknown':
                description = "An unknown error occurred. This might be a CORS issue (check Firebase Storage CORS configuration) or an issue with the bucket configuration (verify 'storageBucket' in firebase.ts). Check console for details.";
                break;
              case 'storage/object-not-found':
                 description = "File/Bucket not found. This can indicate the 'storageBucket' name in your app's firebase.ts config is incorrect or the bucket doesn't exist. Verify bucket name, its CORS configuration, and Firebase Storage Rules. Check console.";
                 break;
              case 'storage/quota-exceeded':
                description = "Storage quota exceeded. You may need to upgrade your Firebase plan or free up space.";
                break;
              case 'storage/project-not-found':
                description = "Firebase project not found. Verify your Firebase configuration in firebase.ts.";
                break;
              case 'storage/bucket-not-found':
                description = "Storage bucket not found. Ensure the 'storageBucket' in firebase.ts is correct and the bucket exists in Google Cloud Console, and that Storage is enabled for your Firebase project. Check console.";
                break;
              default:
                description = `Upload error: ${error.message}. Common issues: Firebase Storage security rules, incorrect 'storageBucket' name in firebase.ts, CORS misconfiguration, or Storage not fully enabled for the project's region. Check browser console.`;
            }
          }
          toast({
            title: "Upload Failed",
            description: description,
            variant: "destructive",
          });
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const photoDisplayName = `Amrit Kumar Chanchal - ${selectedFile.name}`;

            const photoData: Omit<Photo, "id" | "createdAt"> & { createdAt: any } = {
              src: downloadURL,
              name: photoDisplayName,
              category: selectedCategory,
              createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, "photos"), photoData);
            toast({
              title: "Photo Uploaded!",
              description: `${photoDisplayName} added to ${selectedCategory}.`,
              variant: "default",
            });
            
            if (onPhotoAdd) {
              onPhotoAdd(docRef.id);
            }

            setSelectedFile(null);
            setPreviewUrl(null);
            if (event.target instanceof HTMLFormElement) {
              event.target.reset();
            }
            setSelectedCategory(APP_CATEGORIES[0]); // Reset category
            setIsUploading(false);
            setUploadProgress(0);
          } catch (firestoreError) {
             console.error("Firestore Document Creation Error:", firestoreError);
             toast({
                title: "Error Saving Photo Details",
                description: "Photo uploaded, but failed to save details to database. Check console.",
                variant: "destructive",
             });
             setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error("General Error in handleSubmit for photo upload:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during upload. Check console, Firebase Storage security rules, bucket name config (firebase.ts), and CORS settings.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <UploadCloud className="text-primary" /> Add New Photo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="photo-upload" className="font-body text-md">Photo</Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:text-primary-foreground file:bg-primary hover:file:bg-primary/90"
              required
              disabled={isUploading}
            />
          </div>

          {previewUrl && !isUploading && (
            <div className="mt-4">
              <img src={previewUrl} alt="Preview" className="max-h-48 w-auto rounded-md object-cover mx-auto shadow-md" />
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-2 mt-4">
              <Label className="font-body text-md">Upload Progress</Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
            </div>
          )}


          <div className="space-y-2">
            <Label htmlFor="category-select" className="font-body text-md">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as Category)}
              required
              disabled={isUploading}
            >
              <SelectTrigger id="category-select" className="w-full font-body">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {APP_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category} className="font-body">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body text-lg py-3"
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
