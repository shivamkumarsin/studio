"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Photo } from "@/types";
import { CategoryIcon } from "./icons/category-icon";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Image as ImageIconPlaceholder, Eye, Heart, Zap } from "lucide-react";
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
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20"
      >
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
          <div className="relative glass p-8 rounded-full border border-primary/20">
            <ImageIconPlaceholder className="w-16 h-16 text-primary mx-auto" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">No Photos Found</h3>
        <p className="text-muted-foreground mb-4">No photos in this category yet.</p>
        <p className="text-sm text-muted-foreground">Try uploading some or selecting a different category!</p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 p-4 md:p-0"
    >
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          className="group h-full"
        >
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-full flex flex-col glass border border-primary/20 hover:border-primary/40 relative">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            
            <Link href={`/amrit-kumar-chanchal/photo/${photo.id}`} passHref legacyBehavior>
              <a className="block cursor-pointer relative">
                <CardHeader className="p-0 relative">
                  <div className="aspect-square relative w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={photo.src}
                      alt={`${photo.name} - Photo by Amrit Kumar Chanchal`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="transition-all duration-700 ease-out group-hover:scale-110 object-cover"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Hover actions */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full shadow-lg backdrop-blur-sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full shadow-lg backdrop-blur-sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary/90 text-primary-foreground rounded-full text-xs font-medium backdrop-blur-sm">
                        <CategoryIcon category={photo.category} className="h-3 w-3" />
                        <span>{photo.category}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </a>
            </Link>

            <CardContent className="p-4 flex-grow relative">
              <Link href={`/amrit-kumar-chanchal/photo/${photo.id}`} passHref legacyBehavior>
                <a className="block cursor-pointer">
                  <CardTitle className="font-bold text-lg mb-2 truncate text-card-foreground group-hover:text-primary transition-colors duration-300" title={photo.name}>
                    {photo.name}
                  </CardTitle>
                </a>
              </Link>
              
              {photo.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {photo.description}
                </p>
              )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <CategoryIcon category={photo.category} className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground font-medium">{photo.category}</span>
              </div>

              {onDelete ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete photo {photo.name}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass border border-primary/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete the photo
                        "{photo.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-primary/20 hover:bg-primary/10">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        onClick={() => onDelete(photo.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Link href={`/amrit-kumar-chanchal/photo/${photo.id}`} passHref legacyBehavior>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full" 
                    aria-label={`View photo ${photo.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}