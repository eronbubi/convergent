"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/config";
import { getViewer } from "@/lib/data";
import { getServerSupabase } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string; fields?: Record<string, string> } | null;

const DEMO_ERROR = "Accounts are switched off in demo mode. Connect Supabase to enable them.";

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Only allow redirects back into this site. */
function safeNext(value: FormDataEntryValue | null, fallback = "/") {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

const Username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_.]{3,24}$/, "3–24 characters: letters, numbers, dot or underscore");

const SignUp = z.object({
  username: Username,
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const fields = {
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  if (!isSupabaseConfigured) return { error: DEMO_ERROR, fields };

  const parsed = SignUp.safeParse({ ...fields, password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };
  const { username, email, password } = parsed.data;

  const supabase = await getServerSupabase();
  const { data: available } = await supabase.rpc("username_available", { p_username: username });
  if (available === false) return { error: `@${username} is taken. Try another username.`, fields };

  const origin = await siteOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/welcome`,
      data: { username, display_name: username },
    },
  });
  if (error) return { error: error.message, fields };

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const fields = { email: String(formData.get("email") ?? "") };
  if (!isSupabaseConfigured) return { error: DEMO_ERROR, fields };

  const email = fields.email.trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", fields };

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      redirect(`/verify?email=${encodeURIComponent(email)}&unconfirmed=1`);
    }
    return { error: "That email and password don’t match.", fields };
  }
  redirect(safeNext(formData.get("next")));
}

export async function resendVerification(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: DEMO_ERROR };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Enter the address you signed up with." };

  const supabase = await getServerSupabase();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/welcome` },
  });
  if (error) {
    return {
      error: error.status === 429 ? "Please wait a minute before asking for another email." : error.message,
    };
  }
  return { message: "Sent. Check your inbox and the spam folder." };
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const fields = { email: String(formData.get("email") ?? "") };
  if (!isSupabaseConfigured) return { error: DEMO_ERROR, fields };
  const email = fields.email.trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Enter a valid email address.", fields };

  const supabase = await getServerSupabase();
  const origin = await siteOrigin();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm?next=/reset` });
  // Same answer whether or not the address has an account.
  return { message: "If that address has an account, a reset link is on its way.", fields };
}

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: DEMO_ERROR };
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/");
}

const ProfileInput = z.object({
  displayName: z.string().trim().min(1, "Add a display name").max(48),
  bio: z.string().trim().max(280, "Keep the bio under 280 characters"),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const fields = { displayName: String(formData.get("displayName") ?? ""), bio: String(formData.get("bio") ?? "") };
  if (!isSupabaseConfigured) return { error: DEMO_ERROR, fields };
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/settings");

  const parsed = ProfileInput.safeParse(fields);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };

  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName, bio: parsed.data.bio })
    .eq("id", viewer.id);
  if (error) return { error: "Saving failed. Try again.", fields };
  return { message: "Saved.", fields };
}

export async function checkUsername(name: string): Promise<"ok" | "taken" | "invalid"> {
  const parsed = Username.safeParse(name);
  if (!parsed.success) return "invalid";
  if (!isSupabaseConfigured) return "ok";
  const supabase = await getServerSupabase();
  const { data } = await supabase.rpc("username_available", { p_username: parsed.data });
  return data ? "ok" : "taken";
}
