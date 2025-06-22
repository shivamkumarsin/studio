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
import { UploadCloud, FilesIcon, Edit3, MapPin, Calendar, Clock, Tag, Image as ImageIcon } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Helper function to generate suggested filename
function generateSuggestedFilename(originalName: string, title: string, location: string): string {
  const authorName = "amrit-kumar-chanchal";
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const cleanLocation = location.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const extension = originalName.split('.').pop() || 'jpg';
  
  return `${authorName}-${cleanLocation}-${cleanTitle}.${extension}`;
}

interface PhotoUploadFormProps {
  onUploadSuccess?: () => void;
}

export function PhotoUploadForm({ onUploadSuccess }: PhotoUploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "">(APP_CATEGORIES[0]);
  const [tags, setTags] = useState("");
  
  // Initialize with current date and time
  const now = new Date();
  const [postingDate, setPostingDate] = useState(now.toISOString().split('T')[0]);
  const [postingTime, setPostingTime] = useState(now.toTimeString().slice(0, 5));
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentTaskMessage, setCurrentTaskMessage] = useState<string | null>(null);
  const [suggestedFilename, setSuggestedFilename] = useState("");
  
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
        
        // Generate suggested filename when file is selected
        if (title && location) {
          setSuggestedFilename(generateSuggestedFilename(filesArray[0].name, title, location));
        }
      } else {
        setPreviewUrl(null);
        setSuggestedFilename("");
      }
    } else {
      setSelectedFiles([]);
      setPreviewUrl(null);
      setSuggestedFilename("");
    }
  };

  // Update suggested filename when title or location changes
  const updateSuggestedFilename = () => {
    if (selectedFiles.length === 1 && title && location) {
      setSuggestedFilename(generateSuggestedFilename(selectedFiles[0].name, title, location));
    }
  };

  const resetForm = (formElement?: HTMLFormElement) => {
    setSelectedFiles([]);
    setPreviewUrl(null);
    setTitle("");
    setAltText("");
    setCaption("");
    setLocation("");
    setDescription("");
    setSelectedCategory(APP_CATEGORIES[0]);
    setTags("");
    
    // Reset to current date and time
    const now = new Date();
    setPostingDate(now.toISOString().split('T')[0]);
    setPostingTime(now.toTimeString().slice(0, 5));
    
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentTaskMessage(null);
    setSuggestedFilename("");
    if (formElement) {
      formElement.reset();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validation
    if (selectedFiles.length === 0 || !selectedCategory || !title.trim() || !altText.trim()) {
      toast({
        title: "Missing Required Information",
        description: "Please fill in all required fields: photo file(s), title, alt text, and category.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    let successfulUploads = 0;
    const totalFiles = selectedFiles.length;
    const plainTextDescription = stripHtml(description);
    const photoTitleForDB = title.trim();

    // Create posting date from date and time inputs with proper validation
    let postingDateTime: Date;
    try {
      const dateTimeString = `${postingDate}T${postingTime}`;
      postingDateTime = new Date(dateTimeString);
      
      // Check if the date is valid
      if (isNaN(postingDateTime.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (error) {
      console.error("Invalid date/time provided, using current time:", error);
      postingDateTime = new Date(); // Fallback to current time
    }

    for (let i = 0; i < totalFiles; i++) {
      const file = selectedFiles[i];
      setCurrentTaskMessage(`Uploading ${file.name} (${i + 1} of ${totalFiles})...`);
      
      try {
        // Use suggested filename if available, otherwise generate one
        const filename = totalFiles === 1 && suggestedFilename 
          ? suggestedFilename 
          : generateSuggestedFilename(file.name, title, location || 'unknown');
        
        const storageRef = ref(storage, `photos/${filename}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(((i) / totalFiles) * 100 + (progress / totalFiles));
            },
            (error) => {
              console.error(`Firebase Storage Upload Error for ${file.name}:`, error);
              toast({
                title: `Upload Failed for ${file.name}`,
                description: "Could not upload the photo. Check console for Firebase Storage errors.",
                variant: "destructive",
              });
              reject(error); 
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Prepare photo data with proper field handling
                const photoData: any = {
                  src: downloadURL,
                  name: photoTitleForDB,
                  category: selectedCategory,
                  description: plainTextDescription,
                  altText: altText.trim(),
                  postingDate: postingDateTime,
                  createdAt: serverTimestamp(),
                };

                // Only add optional fields if they have values
                if (caption.trim()) {
                  photoData.caption = caption.trim();
                }
                
                if (location.trim()) {
                  photoData.location = location.trim();
                }
                
                if (tags.trim()) {
                  photoData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                }

                await addDoc(collection(db, "photos"), photoData);
                toast({
                  title: "Photo Uploaded Successfully!",
                  description: `"${photoTitleForDB}" has been added to ${selectedCategory}.`,
                  variant: "default",
                });
                successfulUploads++;
                resolve();
              } catch (firestoreError) {
                 console.error(`Firestore Error for ${file.name}:`, firestoreError);
                 toast({
                    title: `Error Saving Details for "${photoTitleForDB}"`,
                    description: "Photo uploaded, but failed to save details to database.",
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
        title: "Upload Complete",
        description: `${successfulUploads} of ${totalFiles} photos uploaded successfully.`,
      });
      
      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } else if (totalFiles > 0) {
       toast({
        title: "Upload Failed",
        description: `No photos were uploaded successfully. Check individual errors.`,
        variant: "destructive",
      });
    }
    
    resetForm(event.target as HTMLFormElement);
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <UploadCloud className="text-primary" /> Create New Post
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload photos with detailed information. Required fields are marked with *
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              1. Upload Image(s) *
            </h3>
            <div className="space-y-2">
              <Label htmlFor="photo-upload" className="font-body text-md">Photo File(s) *</Label>
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
              <p className="text-xs text-muted-foreground">
                Recommended dimensions: 1920x1080 or higher. Supported formats: JPG, PNG, WebP
              </p>
            </div>

            {isUploading && currentTaskMessage && (
              <p className="text-sm text-muted-foreground text-center">{currentTaskMessage}</p>
            )}
            {isUploading && (
              <div className="space-y-2 mt-4">
                <Label className="font-body text-md">Upload Progress</Label>
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
              </div>
            )}

            {suggestedFilename && (
              <div className="p-3 bg-primary/10 rounded-md">
                <p className="text-sm font-medium text-primary">Suggested filename:</p>
                <p className="text-sm text-muted-foreground font-mono">{suggestedFilename}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Image Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              2. Image Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="photo-title" className="font-body text-md">
                  Title * <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="photo-title"
                  type="text"
                  placeholder="e.g., Sunset at Marina Beach"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTimeout(updateSuggestedFilename, 100);
                  }}
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="font-body text-md">
                  Location <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Bhagalpur, Bihar"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setTimeout(updateSuggestedFilename, 100);
                    }}
                    required
                    disabled={isUploading}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt-text" className="font-body text-md">
                Alt Text * <span className="text-destructive">*</span>
              </Label>
              <Input
                id="alt-text"
                type="text"
                placeholder="Descriptive text for accessibility (e.g., Golden sunset over calm ocean waters)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                required
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Describe what's in the image for screen readers and accessibility
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption" className="font-body text-md">Caption</Label>
              <Input
                id="caption"
                type="text"
                placeholder="Brief description or context for the image"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={isUploading}
              />
            </div>
          </div>

          <Separator />

          {/* Date and Time Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              3. Date and Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="posting-date" className="font-body text-md">Posting Date</Label>
                <Input
                  id="posting-date"
                  type="date"
                  value={postingDate}
                  onChange={(e) => setPostingDate(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="posting-time" className="font-body text-md">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Posting Time
                </Label>
                <Input
                  id="posting-time"
                  type="time"
                  value={postingTime}
                  onChange={(e) => setPostingTime(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Time zone: Local (automatically detected)
            </p>
          </div>

          <Separator />

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              4. Additional Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="category-select" className="font-body text-md">
                Category * <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as Category)}
                required
                disabled={isUploading}
              >
                <SelectTrigger id="category-select" className="w-full font-body">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {APP_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category} className="font-body">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="font-body text-md">Tags</Label>
              <Input
                id="tags"
                type="text"
                placeholder="photography, sunset, nature, travel (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Add relevant keywords separated by commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-body text-md">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the photo, story behind it, technical details, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                disabled={isUploading}
              />
            </div>
          </div>

          <Separator />

          {/* Naming Convention Note */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">File Naming Convention</h4>
            <p className="text-sm text-muted-foreground mb-2">
              All images will be renamed using the format: <code className="bg-muted px-1 rounded">amrit-kumar-chanchal-[location]-[title].jpg</code>
            </p>
            <p className="text-xs text-muted-foreground">
              Example: amrit-kumar-chanchal-bhagalpur-sunset.jpg
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body text-lg py-3"
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? "Uploading..." : `Create Post with ${selectedFiles.length > 0 ? selectedFiles.length + ' Photo(s)' : 'Photo(s)'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}