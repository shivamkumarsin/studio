"use client";

import { useState } from "react";
import { CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Clock, Calendar, Hash, Share2, Copy, Check } from "lucide-react";
import { CategoryIcon } from "@/components/icons/category-icon";
import type { Photo } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface PhotoPageClientProps {
  photo: Photo;
}

export function PhotoPageClient({ photo }: PhotoPageClientProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatDate = (date: Date | any) => {
    if (!date) return "Unknown";
    const photoDate = date.toDate ? date.toDate() : new Date(date);
    return photoDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | any) => {
    if (!date) return "Unknown";
    const photoDate = date.toDate ? date.toDate() : new Date(date);
    return photoDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const generateHashtags = (photo: Photo) => {
    const hashtags = [];
    
    // Add category as hashtag
    hashtags.push(`#${photo.category.replace(/\s+/g, '')}`);
    
    // Add location if available
    if (photo.location) {
      hashtags.push(`#${photo.location.replace(/\s+/g, '').replace(/,/g, '')}`);
    }
    
    // Add tags if available
    if (photo.tags && photo.tags.length > 0) {
      photo.tags.slice(0, 3).forEach(tag => {
        hashtags.push(`#${tag.replace(/\s+/g, '')}`);
      });
    }
    
    // Add some default photography hashtags
    hashtags.push('#Photography', '#AmritKumarChanchal', '#VisualStory');
    
    return hashtags.slice(0, 8); // Limit to 8 hashtags
  };

  const sharePhoto = async () => {
    const shareData = {
      title: `${photo.name} - Photo by Amrit Kumar Chanchal`,
      text: `Check out this amazing photo: "${photo.name}" by Amrit Kumar Chanchal`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Photo shared via native sharing",
        });
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Photo link copied to clipboard for sharing",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Photo link copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Could not share or copy link",
          variant: "destructive",
        });
      }
    }
  };

  const copyHashtags = async () => {
    const hashtags = generateHashtags(photo);
    const hashtagText = hashtags.join(' ');
    
    try {
      await navigator.clipboard.writeText(hashtagText);
      toast({
        title: "Hashtags copied!",
        description: "All hashtags copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy hashtags",
        variant: "destructive",
      });
    }
  };

  const hashtags = generateHashtags(photo);

  return (
    <>
      {/* Date and Time Information */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{formatDate(photo.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>{formatTime(photo.createdAt)}</span>
        </div>
        {photo.location && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span>{photo.location}</span>
          </div>
        )}
      </div>

      {photo.description && (
        <CardDescription className="text-lg text-muted-foreground mb-6 leading-relaxed whitespace-pre-wrap">
          {photo.description}
        </CardDescription>
      )}
      
      <div className="flex items-center text-md text-muted-foreground mb-6">
        <Tag className="mr-2 h-5 w-5 text-primary" />
        Category: <CategoryIcon category={photo.category} className="ml-2 mr-1 h-5 w-5 text-primary" /> {photo.category}
      </div>

      {/* Share Button */}
      <div className="border-t border-border/50 pt-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Share this photo</span>
          </div>
          <Button
            onClick={sharePhoto}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground opacity-70">
          Share this photo on WhatsApp, Facebook, Twitter, or any social platform with image preview
        </p>
      </div>

      {/* Hashtags Section */}
      <div className="border-t border-border/50 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Hashtags</span>
          </div>
          <Button
            onClick={copyHashtags}
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:text-primary/80"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {hashtags.map((hashtag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              onClick={() => navigator.clipboard.writeText(hashtag)}
            >
              {hashtag}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 opacity-70">
          Click any hashtag to copy individually, or use "Copy All" for social media posts
        </p>
      </div>

      {/* Additional Tags if available */}
      {photo.tags && photo.tags.length > 0 && (
        <div className="border-t border-border/50 pt-6 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {photo.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent/10 text-accent border border-accent/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}