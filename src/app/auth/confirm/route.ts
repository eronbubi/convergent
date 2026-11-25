import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Target of the links in confirmation and password-reset emails.
 * Supports both the token-hash template (works in any browser) and the PKCE code flow.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const tokenHash = sp.get("token_hash");
  const type = sp.get("type") as EmailOtpType | null;
  const code = sp.get("code");
  const rawNext = sp.get("next") ?? "/welcome";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/welcome";

  if (!isSupabaseConfigured) redirect("/verify?error=link");

  const supabase = await getServerSupabase();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
    if (ok && type === "recovery") redirect("/reset");
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  redirect(ok ? next : "/verify?error=link");
}
