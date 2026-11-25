import { NextResponse, type NextRequest } from "next/server";
import { listPosts, searchPeople, searchTags } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 120);
  if (!q) return NextResponse.json({ people: [], tags: [], posts: [] });

  try {
    const [people, tags, posts] = await Promise.all([
      searchPeople(q, 4),
      searchTags(q, 4),
      listPosts({ source: "search", q }, 0, 5),
    ]);
    return NextResponse.json({ people, tags, posts }, { headers: { "cache-control": "private, no-store" } });
  } catch (e) {
    console.error("GET /api/search", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
