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

interface PhotoUploadFormProps {
  onPhotoAdd: (photo: Omit<Photo, "id">) => void;
}

export function PhotoUploadForm({ onPhotoAdd }: PhotoUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | "">(APP_CATEGORIES[0]);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !selectedCategory) {
      toast({
        title: "Missing Information",
        description: "Please select a photo and a category.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onPhotoAdd({
          src: e.target.result as string,
          name: selectedFile.name,
          category: selectedCategory,
        });
        toast({
          title: "Photo Uploaded!",
          description: `${selectedFile.name} added to ${selectedCategory}.`,
        });
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        // Keep category or reset as desired, here keeping it.
        // setSelectedCategory(""); 
        (event.target as HTMLFormElement).reset(); // Resets file input
      }
    };
    reader.readAsDataURL(selectedFile);
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
            />
          </div>

          {previewUrl && (
            <div className="mt-4">
              <img src={previewUrl} alt="Preview" className="max-h-48 w-auto rounded-md object-cover mx-auto shadow-md" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category-select" className="font-body text-md">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as Category)}
              required
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

          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body text-lg py-3">
            Upload Photo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
