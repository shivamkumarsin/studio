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
import { PhotoPageClient } from './photo-page-client';

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

function formatDateForMetadata(date: Date | any): string {
  if (!date) return new Date().toISOString();
  
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
      return new Date().toISOString();
    }

    // Check if date is valid
    if (isNaN(photoDate.getTime())) {
      return new Date().toISOString();
    }

    return photoDate.toISOString();
  } catch (error) {
    console.error('Error formatting date for metadata:', error);
    return new Date().toISOString();
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
      'article:published_time': formatDateForMetadata(photo.createdAt),
      'article:modified_time': photo.updatedAt ? formatDateForMetadata(photo.updatedAt) : undefined,
      'article:section': photo.category,
      'article:tag': photo.tags?.join(', ') || '',
    },
  };
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