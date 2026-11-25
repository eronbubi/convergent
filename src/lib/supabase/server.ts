import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/config";

/** Supabase client bound to the visitor's session cookies. */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. The proxy refreshes the session.
        }
      },
    },
  });
}

/** Server-only client with the secret key. Bypasses RLS: use for narrow, audited operations only. */
export function getAdminSupabase() {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !secret) return null;
  return createClient(SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
