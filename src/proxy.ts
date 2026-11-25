import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip static files, images and the demo media.
    "/((?!_next/static|_next/image|demo/|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|webm)$).*)",
  ],
};
