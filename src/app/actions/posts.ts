"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured, MEDIA_BUCKET } from "@/lib/config";
import { getViewer } from "@/lib/data";
import { getServerSupabase } from "@/lib/supabase/server";
import { TAG_SLUG_RE } from "@/lib/tags";

const PostInput = z.object({
  title: z.string().trim().min(1, "Give it a title").max(120),
  prompt: z.string().trim().min(1, "Paste the prompt").max(4000),
  mediaPath: z.string().min(1).max(300),
  posterPath: z.string().min(1).max(300),
  durationSeconds: z.number().positive().max(36000).nullable(),
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
  modelUsed: z.string().trim().min(1, "Which model made it?").max(80),
  recommendedModels: z.array(z.string().trim().min(1).max(80)).max(8),
  promptEngineer: z.string().trim().min(1, "Who wrote the prompt?").max(60),
  tags: z.array(z.string().max(32).regex(TAG_SLUG_RE)).min(1, "Pick at least one tag").max(6),
});

export type CreatePostInput = z.infer<typeof PostInput>;
export type CreatePostResult = { ok: true; id: string } | { ok: false; error: string };

export async function createPost(input: CreatePostInput): Promise<CreatePostResult> {
  if (!isSupabaseConfigured) return { ok: false, error: "Posting is switched off in demo mode." };

  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Your session ended. Log in again to post." };

  const parsed = PostInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  const v = parsed.data;

  // Files must live in the uploader's own folder.
  const folder = `${viewer.id}/`;
  if (!v.mediaPath.startsWith(folder) || !v.posterPath.startsWith(folder)) {
    return { ok: false, error: "Upload not found." };
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: viewer.id,
      title: v.title,
      prompt: v.prompt,
      media_path: v.mediaPath,
      poster_path: v.posterPath,
      duration_seconds: v.durationSeconds ? Math.round(v.durationSeconds * 100) / 100 : null,
      width: v.width,
      height: v.height,
      model_used: v.modelUsed,
      recommended_models: [...new Set(v.recommendedModels)].filter((m) => m !== v.modelUsed),
      prompt_engineer: v.promptEngineer,
      tags: [...new Set(v.tags)],
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createPost", error);
    return { ok: false, error: "Saving the post failed. Try again in a moment." };
  }
  return { ok: true, id: data.id as string };
}

export async function deletePost(postId: string) {
  if (!isSupabaseConfigured) return;
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const supabase = await getServerSupabase();
  const { data: row } = await supabase
    .from("posts")
    .select("author_id, media_path, poster_path")
    .eq("id", postId)
    .maybeSingle();
  if (!row || row.author_id !== viewer.id) return;

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw new Error("Could not delete the post.");

  await supabase.storage.from(MEDIA_BUCKET).remove([row.media_path, row.poster_path]);

  redirect(`/u/${viewer.username}`);
}
