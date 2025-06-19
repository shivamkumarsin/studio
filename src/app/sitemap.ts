
import type { MetadataRoute } from 'next';
import { db } from '@/lib/firebase'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Photo } from '@/types';

const PRODUCTION_URL = 'https://amritbitla.netlify.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes = ['', '/admin', '/contact'].map((route) => ({
    url: `${PRODUCTION_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

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
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error("Error fetching photos for sitemap:", error);
  }

  return [...staticRoutes, ...photoRoutes];
}
