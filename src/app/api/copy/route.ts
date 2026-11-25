import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/config";
import { getAdminSupabase, getServerSupabase } from "@/lib/supabase/server";

const Body = z.object({ postId: z.string().uuid().or(z.string().regex(/^demo-[a-z0-9-]+$/)) });

const CLIENT_COOKIE = "aim_client";

/**
 * Counts a prompt copy once per person (signed in) or per browser (anonymous).
 * Returns the new count, or null when nothing is stored (demo mode).
 */
export async function POST(request: NextRequest) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { postId } = parsed.data;

  if (!isSupabaseConfigured || postId.startsWith("demo-")) {
    return NextResponse.json({ count: null });
  }

  const supabase = await getServerSupabase();
  const { data: claims } = await supabase.auth.getClaims();

  if (claims?.claims?.sub) {
    const { data, error } = await supabase.rpc("record_prompt_copy", { p_post_id: postId });
    if (error) return NextResponse.json({ count: null }, { status: 500 });
    return NextResponse.json({ count: data as number });
  }

  // Anonymous visitor: identify the browser with an httpOnly cookie and record via the secret key.
  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ count: null });

  const jar = await cookies();
  let clientId = jar.get(CLIENT_COOKIE)?.value;
  if (!clientId || !/^[A-Za-z0-9-]{16,64}$/.test(clientId)) {
    clientId = crypto.randomUUID();
    jar.set(CLIENT_COOKIE, clientId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const { data, error } = await admin.rpc("record_prompt_copy", { p_post_id: postId, p_client_key: clientId });
  if (error) return NextResponse.json({ count: null }, { status: 500 });
  return NextResponse.json({ count: data as number });
}
