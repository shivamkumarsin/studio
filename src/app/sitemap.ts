
import type { MetadataRoute } from 'next';
import { db } from '@/lib/firebase'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Photo } from '@/types';

const PRODUCTION_URL = 'https://pics.amritkumarchanchal.me';

export const revalidate = 86400; // Revalidate a maximum of once per day (86400 seconds)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${PRODUCTION_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${PRODUCTION_URL}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${PRODUCTION_URL}/admin`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Add other static pages here if needed
  ];
  
  // Dynamic photo pages
  let photoRoutes: MetadataRoute.Sitemap = [];
  try {
    const photosCollection = collection(db, "photos");
    const photosQuery = query(photosCollection, orderBy("createdAt", "desc")); 
    const photosSnapshot = await getDocs(photosQuery);
    
    photoRoutes = photosSnapshot.docs.map((doc) => {
      const photoData = doc.data() as Photo;
      return {
        url: `${PRODUCTION_URL}/amrit-kumar-chanchal/photo/${doc.id}`, // Updated URL structure
        lastModified: photoData.createdAt?.toDate().toISOString() || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 1.0, // Set photo priority to 1.0
      };
    });
  } catch (error) {
    console.error("Error fetching photos for sitemap:", error);
  }

  return [...staticRoutes, ...photoRoutes];
}
