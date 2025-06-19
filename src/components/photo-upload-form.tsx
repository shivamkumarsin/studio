
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { UploadCloud, FilesIcon, Edit3 } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "@/components/ui/progress";

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (typeof window === 'undefined') return html; // Should not happen client-side, but good practice
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function PhotoUploadForm() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "">(APP_CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentTaskMessage, setCurrentTaskMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);

      if (filesArray.length === 1) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(filesArray[0]);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setSelectedFiles([]);
      setPreviewUrl(null);
    }
  };

  const resetForm = (formElement?: HTMLFormElement) => {
    setSelectedFiles([]);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setSelectedCategory(APP_CATEGORIES[0]);
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentTaskMessage(null);
    if (formElement) {
      formElement.reset();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFiles.length === 0 || !selectedCategory || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select at least one photo, provide a title, and select a category.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    let successfulUploads = 0;
    const totalFiles = selectedFiles.length;
    const plainTextDescription = stripHtml(description);
    const photoTitleForDB = title.trim(); // Title as entered by the user

    for (let i = 0; i < totalFiles; i++) {
      const file = selectedFiles[i];
      setCurrentTaskMessage(`Uploading ${file.name} (${i + 1} of ${totalFiles})...`);
      
      try {
        // Generate a unique filename for storage
        const uniqueStorageFilename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const storageRef = ref(storage, `photos/${uniqueStorageFilename}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Batch-level progress bar updated after each file.
            },
            (error) => {
              console.error(`Firebase Storage Upload Error for ${file.name}:`, error);
              toast({
                title: `Upload Failed for ${file.name}`,
                description: "Could not upload the photo. Check console for Firebase Storage errors (permissions, CORS, bucket existence).",
                variant: "destructive",
              });
              reject(error); 
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                const photoData: Omit<Photo, "id" | "createdAt"> & { createdAt: any } = {
                  src: downloadURL,
                  name: photoTitleForDB, // Use the user-defined title directly
                  category: selectedCategory,
                  description: plainTextDescription,
                  createdAt: serverTimestamp(),
                };

                await addDoc(collection(db, "photos"), photoData);
                toast({
                  title: "Photo Uploaded!",
                  description: `"${photoTitleForDB}" added to ${selectedCategory}.`,
                  variant: "default",
                });
                successfulUploads++;
                resolve();
              } catch (firestoreError) {
                 console.error(`Firestore Error for ${file.name}:`, firestoreError);
                 toast({
                    title: `Error Saving Details for "${photoTitleForDB}"`,
                    description: "Photo uploaded, but failed to save details to database. Check Firestore rules/console.",
                    variant: "destructive",
                 });
                 reject(firestoreError);
              }
            }
          );
        });
        setUploadProgress(((i + 1) / totalFiles) * 100);
      } catch (error) {
        setCurrentTaskMessage(`Failed to upload ${file.name}. Continuing with next if any.`);
      }
    }

    setCurrentTaskMessage(null);
    if (successfulUploads > 0) {
      toast({
        title: "Batch Upload Complete",
        description: `${successfulUploads} of ${totalFiles} photos uploaded successfully.`,
      });
    } else if (totalFiles > 0) {
       toast({
        title: "Batch Upload Failed",
        description: `No photos were uploaded successfully. Check individual errors.`,
        variant: "destructive",
      });
    }
    
    resetForm(event.target as HTMLFormElement);
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <UploadCloud className="text-primary" /> Add New Photo(s)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="photo-upload" className="font-body text-md">Photo File(s)</Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:text-primary-foreground file:bg-primary hover:file:bg-primary/90"
              required={selectedFiles.length === 0}
              disabled={isUploading}
              multiple
            />
          </div>

          {isUploading && currentTaskMessage && (
            <p className="text-sm text-muted-foreground text-center">{currentTaskMessage}</p>
          )}
          {isUploading && (
            <div className="space-y-2 mt-4">
              <Label className="font-body text-md">Overall Upload Progress</Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          {!isUploading && selectedFiles.length === 1 && previewUrl && (
            <div className="mt-4">
              <img src={previewUrl} alt="Preview" className="max-h-48 w-auto rounded-md object-cover mx-auto shadow-md" />
            </div>
          )}
          {!isUploading && selectedFiles.length > 1 && (
            <div className="mt-4 p-3 border rounded-md text-center bg-muted/50">
              <FilesIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{selectedFiles.length} files selected.</p>
              <p className="text-xs text-muted-foreground">The title and description below will apply to all selected photos.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="photo-title" className="font-body text-md">
              Photo Title <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-muted-foreground" />
              <Input
                id="photo-title"
                type="text"
                placeholder="e.g., Sunset at Marina Beach"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isUploading}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-body text-md">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Share your experience or details. HTML will be converted to plain text."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
              disabled={isUploading}
            />
          </div>

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
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? "Uploading..." : `Upload ${selectedFiles.length > 0 ? selectedFiles.length + ' Photo(s)' : 'Photo(s)'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
