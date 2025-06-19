export interface Photo {
  id: string;
  src: string;
  name: string;
  category: string;
}

export const APP_CATEGORIES = [
  "Birthday",
  "Holiday",
  "Work",
  "School",
  "Friends",
  "College Friends",
] as const;

export type Category = typeof APP_CATEGORIES[number];

export const ALL_CATEGORIES_OPTION = "All Categories";
