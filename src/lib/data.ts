import "server-only";
import { cache } from "react";
import { isSupabaseConfigured, MEDIA_BUCKET, SUPABASE_URL } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase/server";
import { DEMO_POSTS, DEMO_PROFILES } from "@/lib/demo";
import { TAGS, slugifyTag, tagLabel } from "@/lib/tags";
import type {
  FeedMode,
  PersonResult,
  Post,
  Profile,
  ProfileStats,
  SiteStats,
  TagCount,
  Viewer,
} from "@/lib/types";

/* ──────────────────────────────────────────────────────────────
   Row mapping
   ────────────────────────────────────────────────────────────── */

type PostRow = {
  id: string;
  title: string;
  prompt: string;
  media_path: string;
  poster_path: string;
  width: number;
  height: number;
  model_used: string;
  recommended_models: string[] | null;
  prompt_engineer: string;
  engineer_username: string | null;
  tags: string[];
  copy_count: number;
  created_at: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
};

export function publicMediaUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function mapRow(r: PostRow): Post {
  return {
    id: r.id,
    title: r.title,
    prompt: r.prompt,
    mediaUrl: publicMediaUrl(r.media_path),
    posterUrl: publicMediaUrl(r.poster_path),
    width: r.width,
    height: r.height,
    modelUsed: r.model_used,
    recommendedModels: r.recommended_models ?? [],
    promptEngineer: r.prompt_engineer,
    engineerUsername: r.engineer_username,
    tags: r.tags,
    copyCount: r.copy_count,
    createdAt: r.created_at,
    authorId: r.author_id,
    authorUsername: r.author_username,
    authorDisplayName: r.author_display_name || r.author_username,
  };
}

/* ──────────────────────────────────────────────────────────────
   Demo-mode helpers (used when Supabase isn't configured)
   ────────────────────────────────────────────────────────────── */

const DEMO_NOW = Math.max(...DEMO_POSTS.map((p) => Date.parse(p.createdAt)));

function demoScore(p: Post): number {
  const ageHours = (DEMO_NOW - Date.parse(p.createdAt)) / 36e5;
  return Math.log1p(p.copyCount) * 1.2 + 4 * Math.exp(-ageHours / 72);
}

function demoSort(posts: Post[], mode: FeedMode): Post[] {
  const list = [...posts];
  if (mode === "latest") return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (mode === "top") return list.sort((a, b) => b.copyCount - a.copyCount);
  return list.sort((a, b) => demoScore(b) - demoScore(a));
}

function includesCI(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/* ──────────────────────────────────────────────────────────────
   Viewer
   ────────────────────────────────────────────────────────────── */

export const getViewer = cache(async (): Promise<Viewer> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (!sub) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", sub)
    .maybeSingle();
  if (!profile) return null;
  return { id: sub, username: profile.username, displayName: profile.display_name || profile.username };
});

/* ──────────────────────────────────────────────────────────────
   Posts
   ────────────────────────────────────────────────────────────── */

export type PostQuery =
  | { source: "feed"; mode: FeedMode; tag?: string | null }
  | { source: "author"; username: string }
  | { source: "credited"; username: string }
  | { source: "search"; q: string };

export async function listPosts(query: PostQuery, offset: number, limit: number): Promise<Post[]> {
  if (!isSupabaseConfigured) {
    let list: Post[];
    switch (query.source) {
      case "feed":
        list = demoSort(
          query.tag ? DEMO_POSTS.filter((p) => p.tags.includes(query.tag!)) : DEMO_POSTS,
          query.mode,
        );
        break;
      case "author":
        list = demoSort(DEMO_POSTS.filter((p) => p.authorUsername === query.username), "latest");
        break;
      case "credited":
        list = demoSort(DEMO_POSTS.filter((p) => p.engineerUsername === query.username), "latest");
        break;
      case "search": {
        const q = query.q.trim();
        const tagQ = slugifyTag(q);
        list = q
          ? demoSort(
              DEMO_POSTS.filter(
                (p) =>
                  includesCI(p.title, q) ||
                  includesCI(p.prompt, q) ||
                  includesCI(p.authorUsername, q) ||
                  includesCI(p.promptEngineer, q) ||
                  includesCI(p.modelUsed, q) ||
                  (tagQ && p.tags.some((t) => t.includes(tagQ))),
              ),
              "top",
            ).sort((a, b) => Number(includesCI(b.title, q)) - Number(includesCI(a.title, q)))
          : [];
        break;
      }
    }
    return list.slice(offset, offset + limit);
  }

  const supabase = await getServerSupabase();
  let rows: PostRow[] | null = null;

  switch (query.source) {
    case "feed": {
      const { data, error } = await supabase.rpc("feed_posts", {
        p_mode: query.mode,
        p_tag: query.tag ?? null,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) throw error;
      rows = data as PostRow[];
      break;
    }
    case "author": {
      const { data, error } = await supabase
        .from("post_cards")
        .select("*")
        .eq("author_username", query.username)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      rows = data as PostRow[];
      break;
    }
    case "credited": {
      const { data, error } = await supabase
        .from("post_cards")
        .select("*")
        .eq("engineer_username", query.username)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      rows = data as PostRow[];
      break;
    }
    case "search": {
      if (!query.q.trim()) return [];
      const { data, error } = await supabase.rpc("search_posts", {
        q: query.q,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) throw error;
      rows = data as PostRow[];
      break;
    }
  }

  return (rows ?? []).map(mapRow);
}

export const getPost = cache(async (id: string): Promise<Post | null> => {
  if (!isSupabaseConfigured) return DEMO_POSTS.find((p) => p.id === id) ?? null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.from("post_cards").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as PostRow) : null;
});

/** Posts sharing the first tag, then filled up with other popular posts. */
export async function getRelated(post: Post, limit = 6): Promise<Post[]> {
  const primary = post.tags[0];
  const sameTag = await listPosts({ source: "feed", mode: "top", tag: primary }, 0, limit + 1);
  const picked = sameTag.filter((p) => p.id !== post.id).slice(0, limit);
  if (picked.length < limit) {
    const more = await listPosts({ source: "feed", mode: "top" }, 0, limit * 2);
    for (const p of more) {
      if (picked.length >= limit) break;
      if (p.id !== post.id && !picked.some((x) => x.id === p.id)) picked.push(p);
    }
  }
  return picked;
}

export async function getTopPosts(limit: number): Promise<Post[]> {
  return listPosts({ source: "feed", mode: "top" }, 0, limit);
}

/* ──────────────────────────────────────────────────────────────
   Profiles
   ────────────────────────────────────────────────────────────── */

export const getProfile = cache(
  async (username: string): Promise<{ profile: Profile; stats: ProfileStats } | null> => {
    const name = username.toLowerCase();
    if (!isSupabaseConfigured) {
      const p = DEMO_PROFILES.find((x) => x.username === name);
      if (!p) return null;
      const own = DEMO_POSTS.filter((x) => x.authorUsername === name);
      return {
        profile: p,
        stats: {
          posts: own.length,
          copiesReceived: own.reduce((s, x) => s + x.copyCount, 0),
          credited: DEMO_POSTS.filter((x) => x.engineerUsername === name).length,
        },
      };
    }

    const supabase = await getServerSupabase();
    const { data: p } = await supabase
      .from("profiles")
      .select("id, username, display_name, bio, created_at")
      .eq("username", name)
      .maybeSingle();
    if (!p) return null;

    const [{ data: own }, { count: credited }] = await Promise.all([
      supabase.from("posts").select("copy_count").eq("author_id", p.id),
      supabase
        .from("post_cards")
        .select("id", { count: "exact", head: true })
        .eq("engineer_username", name),
    ]);

    return {
      profile: {
        id: p.id,
        username: p.username,
        displayName: p.display_name || p.username,
        bio: p.bio,
        createdAt: p.created_at,
      },
      stats: {
        posts: own?.length ?? 0,
        copiesReceived: (own ?? []).reduce((s: number, x: { copy_count: number }) => s + x.copy_count, 0),
        credited: credited ?? 0,
      },
    };
  },
);

/* ──────────────────────────────────────────────────────────────
   Search, tags, stats
   ────────────────────────────────────────────────────────────── */

export async function searchPeople(q: string, limit = 8): Promise<PersonResult[]> {
  const term = q.trim();
  if (!term) return [];
  if (!isSupabaseConfigured) {
    return DEMO_PROFILES.filter((p) => includesCI(p.username, term) || includesCI(p.displayName, term))
      .map((p) => ({
        username: p.username,
        displayName: p.displayName,
        postCount: DEMO_POSTS.filter((x) => x.authorUsername === p.username).length,
      }))
      .slice(0, limit);
  }
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc("search_profiles", { q: term, p_limit: limit });
  if (error) throw error;
  return (data as { username: string; display_name: string; post_count: number }[]).map((r) => ({
    username: r.username,
    displayName: r.display_name || r.username,
    postCount: Number(r.post_count),
  }));
}

export async function getTagCounts(): Promise<TagCount[]> {
  let counts: TagCount[];
  if (!isSupabaseConfigured) {
    const m = new Map<string, number>();
    for (const p of DEMO_POSTS) for (const t of p.tags) m.set(t, (m.get(t) ?? 0) + 1);
    counts = [...m].map(([tag, count]) => ({ tag, count }));
  } else {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase.rpc("tag_counts");
    if (error) throw error;
    counts = (data as { tag: string; post_count: number }[]).map((r) => ({
      tag: r.tag,
      count: Number(r.post_count),
    }));
  }
  // Curated tags always appear, in their curated order, followed by popular custom tags.
  const m = new Map(counts.map((c) => [c.tag, c.count]));
  const curated = TAGS.map((t) => ({ tag: t.slug, count: m.get(t.slug) ?? 0 }));
  const custom = counts
    .filter((c) => !TAGS.some((t) => t.slug === c.tag))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  return [...curated, ...custom];
}

export async function searchTags(q: string, limit = 6): Promise<TagCount[]> {
  const term = slugifyTag(q);
  if (!term) return [];
  const all = await getTagCounts();
  return all
    .filter((t) => t.tag.includes(term) || tagLabel(t.tag).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => Number(b.tag.startsWith(term)) - Number(a.tag.startsWith(term)) || b.count - a.count)
    .slice(0, limit);
}

/** Model names already used on the site, most used first. */
export async function getUsedModels(limit = 40): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const m = new Map<string, number>();
    for (const p of DEMO_POSTS) for (const name of [p.modelUsed, ...p.recommendedModels]) m.set(name, (m.get(name) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([name]) => name);
  }
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc("used_models", { p_limit: limit });
  if (error) throw error;
  return (data as { model: string }[]).map((r) => r.model);
}

export async function getSiteStats(): Promise<SiteStats> {
  if (!isSupabaseConfigured) {
    return {
      posts: DEMO_POSTS.length,
      engineers: new Set(DEMO_POSTS.map((p) => p.authorUsername)).size,
      copies: DEMO_POSTS.reduce((s, p) => s + p.copyCount, 0),
    };
  }
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc("site_stats");
  if (error) throw error;
  const row = (data as { posts: number; engineers: number; copies: number }[])[0];
  return {
    posts: Number(row?.posts ?? 0),
    engineers: Number(row?.engineers ?? 0),
    copies: Number(row?.copies ?? 0),
  };
}
