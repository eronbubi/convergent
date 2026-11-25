import { NextResponse } from "next/server";
import { getUsedModels } from "@/lib/data";

/** Model names people have typed on earlier posts, for autocomplete. */
export async function GET() {
  try {
    return NextResponse.json(await getUsedModels(60), { headers: { "cache-control": "private, max-age=60" } });
  } catch (e) {
    console.error("GET /api/models", e);
    return NextResponse.json([]);
  }
}
