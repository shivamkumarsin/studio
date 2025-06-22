import type { Timestamp } from 'firebase/firestore';

export interface Photo {
  id: string; // Firestore document ID
  src: string; // Firebase Storage URL
  name: string;
  category: string;
  description?: string; // Optional description for the photo
  createdAt?: Timestamp; // For ordering
  altText?: string; // Alt text for accessibility
  caption?: string; // Brief description/caption
  location?: string; // Where the photo was taken
  tags?: string[]; // Array of tags/keywords
  postingDate?: Date; // When the post should be published
  updatedAt?: Timestamp; // When the post was last updated
}

export const APP_CATEGORIES = [
  "Birthday",
  "Holiday",
  "Work",
  "School",
  "Friends",
  "College Friends",
  "Travel",
  "Nature",
  "Portrait",
  "Street Photography",
  "Architecture",
  "Food",
  "Events",
  "Wedding",
  "Family",
  "Sports",
  "Landscape",
  "Wildlife",
  "Fashion",
  "Art",
  "Technology",
  "Business",
  "Lifestyle",
  "Documentary",
  "Abstract",
  "Black & White",
  "Macro",
  "Night Photography",
  "Aerial",
  "Underwater"
] as const;

export type Category = typeof APP_CATEGORIES[number];

export const ALL_CATEGORIES_OPTION = "All Categories";

// SiteSettings interface is no longer needed as the functionality
// for managing these settings via admin panel has been removed.
// export interface SiteSettings {
//   profilePhotoUrl?: string;
//   heroBackdropUrl?: string;
//   updatedAt?: Timestamp;
// }