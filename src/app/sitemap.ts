import type { MetadataRoute } from 'next';

// IMPORTANT: Replace this with your actual production URL
const PRODUCTION_URL = 'https://amritbitla.netlify.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // For a dynamic sitemap that includes individual photo pages,
  // you would first need to create those pages (e.g., /photo/[id]).
  // Then, you would fetch photo IDs from Firestore here:
  // const photosCollection = collection(db, "photos");
  // const photosSnapshot = await getDocs(query(photosCollection, select("id"))); // Firestore v9+
  // const photoRoutes = photosSnapshot.docs.map((doc) => ({
  //   url: `${PRODUCTION_URL}/photo/${doc.id}`,
  //   lastModified: new Date().toISOString(), // Or use photo.createdAt if available
  // }));

  // Static pages
  const staticRoutes = ['', '/admin', '/contact'].map((route) => ({
    url: `${PRODUCTION_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly', // Homepage more frequent
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Combine static routes with dynamic photo routes if you implement them
  // return [...staticRoutes, ...photoRoutes];
  return [...staticRoutes];
}
