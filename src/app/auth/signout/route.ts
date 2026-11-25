import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (isSupabaseConfigured) {
    const supabase = await getServerSupabase();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
