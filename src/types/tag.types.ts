export interface Tag {
  id: string;
  name: string;
  count: number; // Number of notes using this tag
  createdAt: string;
}

export interface TagCloudItem {
  name: string;
  count: number;
  weight: number; // Normalized 1–5 for font size in cloud
}
