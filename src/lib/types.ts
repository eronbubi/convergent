export type FeedMode = "for-you" | "latest" | "top";

/**
 * A post as the UI renders it: a clip made with code plus a still taken from it.
 * `mediaUrl` (the clip) and `posterUrl` (the still) are absolute or root-relative.
 */
export type Post = {
  id: string;
  title: string;
  prompt: string;
  mediaUrl: string;
  posterUrl: string;
  width: number;
  height: number;
  modelUsed: string;
  recommendedModels: string[];
  promptEngineer: string;
  /** Set when the prompt engineer field names a registered user. */
  engineerUsername: string | null;
  tags: string[];
  copyCount: number;
  createdAt: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
};

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  createdAt: string;
};

export type ProfileStats = {
  posts: number;
  copiesReceived: number;
  credited: number;
};

export type PersonResult = {
  username: string;
  displayName: string;
  postCount: number;
};

export type TagCount = { tag: string; count: number };

export type SiteStats = { posts: number; engineers: number; copies: number };

export type Viewer = {
  id: string;
  username: string;
  displayName: string;
} | null;
