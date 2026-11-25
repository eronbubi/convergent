export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** True once the Supabase URL and publishable key are set. Without them the site runs on demo content. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const MEDIA_BUCKET = "media";

/** Upper bound for uploads; matches the bucket's file_size_limit in supabase/schema.sql. */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const FEED_PAGE_SIZE = 12;
