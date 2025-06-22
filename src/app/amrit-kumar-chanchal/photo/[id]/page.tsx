import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Images, Home, Mail, Tag, Clock, Calendar, Hash, Share2, Copy, Check } from 'lucide-react';
import { CategoryIcon } from '@/components/icons/category-icon';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type Props = {
  params: { id: string };
};

async function getPhotoData(id: string): Promise<Photo | null> {
  try {
    const photoDocRef = doc(db, 'photos', id);
    const photoSnap = await getDoc(photoDocRef);

    if (!photoSnap.exists()) {
      return null;
    }
    return { id: photoSnap.id, ...photoSnap.data() } as Photo;
  } catch (error) {
    console.error("Error fetching photo data:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const photo = await getPhotoData(params.id);

  if (!photo) {
    return {
      title: 'Photo Not Found | Amrit\'s Album',
      description: 'The photo you are looking for could not be found.',
    };
  }

  const photoTitle = `${photo.name} - Photo by Amrit Kumar Chanchal`;
  const photoDescription = photo.description || `Beautiful photo titled "${photo.name}" captured by Amrit Kumar Chanchal. Category: ${photo.category}${photo.location ? ` | Location: ${photo.location}` : ''}`;
  
  // Get the current URL for sharing
  const currentUrl = `https://pics.amritkumarchanchal.me/amrit-kumar-chanchal/photo/${params.id}`;

  return {
    title: photoTitle,
    description: photoDescription,
    
    // Open Graph tags for social sharing
    openGraph: {
      title: photoTitle,
      description: photoDescription,
      url: currentUrl,
      siteName: "Amrit's Album - Photography Collection",
      images: [
        {
          url: photo.src,
          width: 1200,
          height: 630,
          alt: photo.altText || `${photo.name} - Photo by Amrit Kumar Chanchal`,
          type: 'image/jpeg',
        }
      ],
      type: 'article',
      locale: 'en_US',
    },
    
    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title: photoTitle,
      description: photoDescription,
      images: [photo.src],
      creator: '@AmritKumarChanchal',
      site: '@AmritKumarChanchal',
    },
    
    // Additional meta tags
    keywords: [
      'Amrit Kumar Chanchal',
      'Photography',
      photo.category,
      ...(photo.tags || []),
      ...(photo.location ? [photo.location] : []),
      'IIT Madras',
      'Visual Art',
      'Photo Collection'
    ],
    
    authors: [{ name: 'Amrit Kumar Chanchal' }],
    creator: 'Amrit Kumar Chanchal',
    publisher: 'Amrit Kumar Chanchal',
    
    // Robots and indexing
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Additional structured data
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
      'article:author': 'Amrit Kumar Chanchal',
      'article:published_time': photo.createdAt ? new Date(photo.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
      'article:modified_time': photo.updatedAt ? new Date(photo.updatedAt.seconds * 1000).toISOString() : undefined,
      'article:section': photo.category,
      'article:tag': photo.tags?.join(', ') || '',
    },
  };
}

// Client component for interactive features
function PhotoPageClient({ photo }: { photo: Photo }) {
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

export default async function PhotoPage({ params }: Props) {
  const photo = await getPhotoData(params.id);

  if (!photo) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-card text-card-foreground py-3 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-lg md:text-xl font-headline flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Images className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="font-bold">Album</span>
          </Link>
          <nav className="flex items-center gap-1 md:gap-3">
            <Link href="/" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm md:text-base hover:text-primary hidden sm:flex">
                <Home className="mr-1.5 h-4 w-4" /> Gallery
              </Button>
            </Link>
            <Link href="/" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm hover:text-primary sm:hidden">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm md:text-base hover:text-primary hidden md:flex">
                <Mail className="mr-1.5 h-4 w-4" /> Contact
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <Card className="w-full max-w-4xl mx-auto shadow-xl overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative w-full aspect-[16/10] bg-muted">
              <Image
                src={photo.src}
                alt={`${photo.name} - Photo by Amrit Kumar Chanchal`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1000px"
                className="object-contain"
                priority
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <CardTitle className="text-3xl md:text-4xl font-headline mb-4 text-foreground">
              {photo.name}
            </CardTitle>
            
            <PhotoPageClient photo={photo} />
          </CardContent>
          <CardFooter className="p-6 md:p-8 bg-secondary/30">
            <Link href="/" legacyBehavior passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Home className="mr-2 h-5 w-5" />
                Back to Gallery
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
            <Link href="/" className="text-xl font-headline flex items-center justify-center gap-2 hover:opacity-80 transition-opacity mb-2">
              <Images className="h-6 w-6 text-primary" />
              Amrit's Album
            </Link>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            A personal collection of aesthetic photos by Amrit Kumar Chanchal.
          </p>
          <p className="font-body text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Amrit Kumar Chanchal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}