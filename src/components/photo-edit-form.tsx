"use client";

import { useState, useEffect, type FormEvent } from "react";
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
import { Edit3, MapPin, Calendar, Clock, Tag, Save, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";

interface PhotoEditFormProps {
  photo: Photo;
  onSave: (updatedPhoto: Photo) => void;
  onCancel: () => void;
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Helper function to safely format date for input
function formatDateForInput(date: Date | any): string {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    let photoDate: Date;
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      photoDate = date.toDate();
    }
    // Handle Firestore Timestamp with seconds property
    else if (date.seconds && typeof date.seconds === 'number') {
      photoDate = new Date(date.seconds * 1000);
    }
    // Handle regular Date object
    else if (date instanceof Date) {
      photoDate = date;
    }
    // Handle date string
    else if (typeof date === 'string') {
      photoDate = new Date(date);
    }
    // Handle timestamp number
    else if (typeof date === 'number') {
      photoDate = new Date(date);
    }
    else {
      return new Date().toISOString().split('T')[0];
    }

    // Check if date is valid
    if (isNaN(photoDate.getTime())) {
      return new Date().toISOString().split('T')[0];
    }

    return photoDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return new Date().toISOString().split('T')[0];
  }
}

// Helper function to safely format time for input
function formatTimeForInput(date: Date | any): string {
  if (!date) {
    return new Date().toTimeString().slice(0, 5);
  }
  
  try {
    let photoDate: Date;
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      photoDate = date.toDate();
    }
    // Handle Firestore Timestamp with seconds property
    else if (date.seconds && typeof date.seconds === 'number') {
      photoDate = new Date(date.seconds * 1000);
    }
    // Handle regular Date object
    else if (date instanceof Date) {
      photoDate = date;
    }
    // Handle date string
    else if (typeof date === 'string') {
      photoDate = new Date(date);
    }
    // Handle timestamp number
    else if (typeof date === 'number') {
      photoDate = new Date(date);
    }
    else {
      return new Date().toTimeString().slice(0, 5);
    }

    // Check if date is valid
    if (isNaN(photoDate.getTime())) {
      return new Date().toTimeString().slice(0, 5);
    }

    return photoDate.toTimeString().slice(0, 5);
  } catch (error) {
    console.error('Error formatting time for input:', error);
    return new Date().toTimeString().slice(0, 5);
  }
}

export function PhotoEditForm({ photo, onSave, onCancel }: PhotoEditFormProps) {
  // Form fields initialized with existing photo data
  const [title, setTitle] = useState(photo.name || "");
  const [altText, setAltText] = useState(photo.altText || "");
  const [caption, setCaption] = useState(photo.caption || "");
  const [location, setLocation] = useState(photo.location || "");
  const [description, setDescription] = useState(photo.description || "");
  const [selectedCategory, setSelectedCategory] = useState<Category>(photo.category as Category);
  const [tags, setTags] = useState(photo.tags ? photo.tags.join(", ") : "");
  const [postingDate, setPostingDate] = useState(() => {
    return formatDateForInput(photo.postingDate);
  });
  const [postingTime, setPostingTime] = useState(() => {
    return formatTimeForInput(photo.postingDate);
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validation
    if (!title.trim() || !altText.trim()) {
      toast({
        title: "Missing Required Information",
        description: "Please fill in all required fields: title and alt text.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const plainTextDescription = stripHtml(description);
      
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

      // Prepare update data with proper field handling
      const updatedData: any = {
        name: title.trim(),
        category: selectedCategory,
        description: plainTextDescription,
        altText: altText.trim(),
        postingDate: postingDateTime,
        updatedAt: serverTimestamp(),
      };

      // Only add optional fields if they have values
      if (caption.trim()) {
        updatedData.caption = caption.trim();
      } else {
        updatedData.caption = null; // Explicitly set to null to remove field
      }
      
      if (location.trim()) {
        updatedData.location = location.trim();
      } else {
        updatedData.location = null; // Explicitly set to null to remove field
      }
      
      if (tags.trim()) {
        updatedData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else {
        updatedData.tags = null; // Explicitly set to null to remove field
      }

      await updateDoc(doc(db, "photos", photo.id), updatedData);

      const updatedPhoto: Photo = {
        ...photo,
        ...updatedData,
        updatedAt: new Date() as any, // For immediate UI update
      };

      toast({
        title: "Post Updated Successfully!",
        description: `"${title}" has been updated.`,
        variant: "default",
      });

      onSave(updatedPhoto);
    } catch (error) {
      console.error("Error updating photo:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the post. Please try again. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Edit3 className="text-primary" /> Edit Post
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your post information. Required fields are marked with *
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Image Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Image</h3>
            <div className="relative">
              <img 
                src={photo.src} 
                alt={photo.altText || photo.name} 
                className="max-h-48 w-auto rounded-md object-cover mx-auto shadow-md" 
              />
            </div>
          </div>

          <Separator />

          {/* Image Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Image Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="photo-title" className="font-body text-md">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="photo-title"
                  type="text"
                  placeholder="e.g., Sunset at Marina Beach"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="font-body text-md">Location</Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Bhagalpur, Bihar"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isUpdating}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt-text" className="font-body text-md">
                Alt Text <span className="text-destructive">*</span>
              </Label>
              <Input
                id="alt-text"
                type="text"
                placeholder="Descriptive text for accessibility"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                required
                disabled={isUpdating}
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
                disabled={isUpdating}
              />
            </div>
          </div>

          <Separator />

          {/* Date and Time Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Date and Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="posting-date" className="font-body text-md">Posting Date</Label>
                <Input
                  id="posting-date"
                  type="date"
                  value={postingDate}
                  onChange={(e) => setPostingDate(e.target.value)}
                  disabled={isUpdating}
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
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Additional Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="category-select" className="font-body text-md">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as Category)}
                required
                disabled={isUpdating}
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
                disabled={isUpdating}
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
                disabled={isUpdating}
              />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body text-lg py-3"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              className="flex-1 font-body text-lg py-3"
              disabled={isUpdating}
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}