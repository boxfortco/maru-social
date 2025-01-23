// Common types used across components
export type ViewMode = "default" | "masonry" | "grid" | "columns";

export type Stage = {
  id: number;
  projectId: number;
  stageType: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  order: number;
};

export type Project = {
  id: number;
  title: string;
  category: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  stats: {
    likes: number;
    views: number;
    comments: number;
  };
  stages?: Stage[];
};

export type User = {
  id: number;
  username: string;
  createdAt: string;
};