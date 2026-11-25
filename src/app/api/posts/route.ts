import { NextResponse, type NextRequest } from "next/server";
import { FEED_PAGE_SIZE } from "@/lib/config";
import { listPosts, type PostQuery } from "@/lib/data";
import type { FeedMode } from "@/lib/types";

const MODES: FeedMode[] = ["for-you", "latest", "top"];

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const offset = Math.max(0, Number(sp.get("offset")) || 0);
  const limit = Math.min(48, Math.max(1, Number(sp.get("limit")) || FEED_PAGE_SIZE));
  const source = sp.get("source") ?? "feed";

  let query: PostQuery;
  if (source === "feed") {
    const mode = sp.get("mode") as FeedMode;
    query = { source: "feed", mode: MODES.includes(mode) ? mode : "for-you", tag: sp.get("tag") || null };
  } else if (source === "author" || source === "credited") {
    const username = (sp.get("username") ?? "").toLowerCase();
    if (!username) return NextResponse.json([]);
    query = { source, username };
  } else if (source === "search") {
    query = { source: "search", q: (sp.get("q") ?? "").slice(0, 120) };
  } else {
    return NextResponse.json({ error: "Unknown source" }, { status: 400 });
  }

  try {
    const posts = await listPosts(query, offset, limit);
    return NextResponse.json(posts, { headers: { "cache-control": "private, no-store" } });
  } catch (e) {
    console.error("GET /api/posts", e);
    return NextResponse.json({ error: "Could not load posts" }, { status: 500 });
  }
}
