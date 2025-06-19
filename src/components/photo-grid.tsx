// @ts-nocheck
"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Photo } from "@/types";
import { CategoryIcon } from "./icons/category-icon";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhotoGridProps {
  photos: Photo[];
  onDelete?: (photoId: string) => void;
}

export function PhotoGrid({ photos, onDelete }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-10">
        <CategoryIcon category="ImageIcon" className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-xl font-body text-muted-foreground">No photos in this category yet.</p>
        <p className="font-body text-muted-foreground">Try uploading some or selecting a different category!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-0">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
            <CardHeader className="p-0">
              <div className="aspect-square relative w-full">
                <Image
                  src={photo.src}
                  alt={photo.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="photo album"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="font-headline text-lg mb-1 truncate" title={photo.name}>
                {photo.name}
              </CardTitle>
            </CardContent>
            <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex items-center justify-between">
              <div className="flex items-center">
                <CategoryIcon category={photo.category} className="mr-2 h-4 w-4" />
                <span className="font-body">{photo.category}</span>
              </div>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete photo</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the photo
                        "{photo.name}" from your local storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => onDelete(photo.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
