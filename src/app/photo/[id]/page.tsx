
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Photo } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Home, Mail, Tag } from 'lucide-react';
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
      title: 'Photo Not Found | Amrit\'s Photo Stack',
      description: 'The photo you are looking for could not be found.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${photo.name} | Amrit's Photo Stack`,
    description: photo.description || `View the photo titled "${photo.name}" by Amrit Kumar Chanchal, in the ${photo.category} category.`,
    openGraph: {
      title: `${photo.name} | Amrit's Photo Stack`,
      description: photo.description || `A photo by Amrit Kumar Chanchal.`,
      images: [photo.src, ...previousImages],
      type: 'article', 
    },
    twitter: {
      card: 'summary_large_image',
      title: `${photo.name} | Amrit's Photo Stack`,
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-card text-card-foreground py-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl md:text-3xl font-headline flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <Camera className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            Amrit's Photo Stack
          </Link>
          <nav className="flex items-center gap-1 md:gap-3">
            <Link href="/" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm md:text-base hover:text-primary">
                <Home className="mr-1.5 h-4 w-4" /> Gallery
              </Button>
            </Link>
            <Link href="/contact" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm md:text-base hover:text-primary">
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
            {photo.description && (
              <CardDescription className="text-lg text-muted-foreground mb-6 leading-relaxed whitespace-pre-wrap">
                {photo.description}
              </CardDescription>
            )}
            <div className="flex items-center text-md text-muted-foreground">
              <Tag className="mr-2 h-5 w-5 text-primary" />
              Category: <CategoryIcon category={photo.category} className="ml-2 mr-1 h-5 w-5 text-primary" /> {photo.category}
            </div>
          </CardContent>
          <CardFooter className="p-6 md:p-8 bg-secondary/30">
            <Link href="/" legacyBehavior passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Home className="mr-2 h-5 w-5" />
                Back to Full Gallery
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
            <Link href="/" className="text-xl font-headline flex items-center justify-center gap-2 hover:opacity-80 transition-opacity mb-2">
              <Camera className="h-6 w-6 text-primary" />
              Amrit's Photo Stack
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
