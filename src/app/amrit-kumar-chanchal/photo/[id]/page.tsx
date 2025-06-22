import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Images, Home, Mail, Tag, Clock, Calendar, Hash } from 'lucide-react';
import { CategoryIcon } from '@/components/icons/category-icon';

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

  const previousImages = (await parent).openGraph?.images || [];
  const photoTitle = `${photo.name} - Photo by Amrit Kumar Chanchal`;

  return {
    title: photoTitle,
    description: photo.description || `View the photo titled "${photo.name}" by Amrit Kumar Chanchal, in the ${photo.category} category.`,
    openGraph: {
      title: photoTitle,
      description: photo.description || `A photo by Amrit Kumar Chanchal.`,
      images: [photo.src, ...previousImages],
      type: 'article', 
    },
    twitter: {
      card: 'summary_large_image',
      title: photoTitle,
      description: photo.description || `A photo by Amrit Kumar Chanchal.`,
      images: [photo.src],
    },
  };
}

export default async function PhotoPage({ params }: Props) {
  const photo = await getPhotoData(params.id);

  if (!photo) {
    notFound();
  }

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

  const hashtags = generateHashtags(photo);

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

            {/* Hashtags Section */}
            <div className="border-t border-border/50 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Hashtags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {hashtag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 opacity-70">
                Click any hashtag to copy to clipboard
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