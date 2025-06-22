import type { MetadataRoute } from 'next';
import { db } from '@/lib/firebase'; 
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { Photo } from '@/types';

const PRODUCTION_URL = 'https://pics.amritkumarchanchal.me';

// Cache the sitemap for 24 hours (86400 seconds)
export const revalidate = 86400;

// Set runtime to edge for better performance
export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('Generating sitemap...');
  
  // Static pages with proper priorities and change frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${PRODUCTION_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly', // Changed from daily to weekly
      priority: 1.0,
    },
    {
      url: `${PRODUCTION_URL}/categories`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly', // New photos are added weekly, not daily
      priority: 0.9,
    },
    {
      url: `${PRODUCTION_URL}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly', // Contact info rarely changes
      priority: 0.6,
    },
    {
      url: `${PRODUCTION_URL}/admin`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.3, // Lower priority for admin pages
    },
  ];
  
  // Dynamic photo pages - LIMIT to only 20 most recent photos
  let photoRoutes: MetadataRoute.Sitemap = [];
  try {
    const photosCollection = collection(db, "photos");
    // BANDWIDTH OPTIMIZATION: Only include 20 most recent photos in sitemap
    const photosQuery = query(
      photosCollection, 
      orderBy("createdAt", "desc"),
      limit(20) // Only include recent 20 photos in sitemap
    ); 
    const photosSnapshot = await getDocs(photosQuery);
    
    console.log(`Adding ${photosSnapshot.docs.length} photos to sitemap`);
    
    photoRoutes = photosSnapshot.docs.map((doc) => {
      const photoData = doc.data() as Photo;
      
      // Use createdAt for lastModified, with fallback
      let lastModified = new Date().toISOString();
      if (photoData.updatedAt) {
        try {
          // Handle Firestore Timestamp
          if (photoData.updatedAt.toDate && typeof photoData.updatedAt.toDate === 'function') {
            lastModified = photoData.updatedAt.toDate().toISOString();
          } else if (photoData.updatedAt.seconds) {
            lastModified = new Date(photoData.updatedAt.seconds * 1000).toISOString();
          }
        } catch (error) {
          console.error('Error parsing updatedAt:', error);
        }
      } else if (photoData.createdAt) {
        try {
          // Handle Firestore Timestamp
          if (photoData.createdAt.toDate && typeof photoData.createdAt.toDate === 'function') {
            lastModified = photoData.createdAt.toDate().toISOString();
          } else if (photoData.createdAt.seconds) {
            lastModified = new Date(photoData.createdAt.seconds * 1000).toISOString();
          }
        } catch (error) {
          console.error('Error parsing createdAt:', error);
        }
      }

      return {
        url: `${PRODUCTION_URL}/amrit-kumar-chanchal/photo/${doc.id}`,
        lastModified,
        changeFrequency: 'monthly' as const, // Photos don't change often once uploaded
        priority: 0.8, // High priority for photo pages
      };
    });
  } catch (error) {
    console.error("Error fetching photos for sitemap:", error);
    // Don't fail the entire sitemap generation if photos can't be fetched
    photoRoutes = [];
  }

  const allRoutes = [...staticRoutes, ...photoRoutes];
  console.log(`Generated sitemap with ${allRoutes.length} total URLs (${photoRoutes.length} photos)`);
  
  return allRoutes;
}