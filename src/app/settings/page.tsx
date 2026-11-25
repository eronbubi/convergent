import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProfileForm } from "@/components/auth/small-forms";
import { Reveal } from "@/components/motion";
import { Avatar } from "@/components/ui/avatar";
import { getProfile, getViewer } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 pt-10 sm:px-6 lg:pt-16">
      <Suspense fallback={<div className="skeleton h-80 rounded-2xl" />}>
        <SettingsView />
      </Suspense>
    </div>
  );
}

async function SettingsView() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/settings");
  const data = await getProfile(viewer.username);
  if (!data) redirect("/");
  const { profile } = data;

  return (
    <>
      <Reveal y={14}>
        <p className="eyebrow">Settings</p>
        <div className="mt-4 flex items-center gap-5">
          <Avatar name={profile.displayName} size={64} />
          <div>
            <h1 className="font-serif text-[40px] leading-none tracking-[-0.03em]">{profile.displayName}</h1>
            <Link href={`/u/${profile.username}`} className="mt-1 inline-block text-[14px] text-ink-3 hover:text-ink">
              @{profile.username} · View profile
            </Link>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1} className="mt-12 rounded-[20px] border border-line bg-card p-6 sm:p-8">
        <ProfileForm displayName={profile.displayName} bio={profile.bio} />
      </Reveal>
      <Reveal delay={0.15} className="mt-8 flex items-center justify-between rounded-[20px] border border-line p-6 sm:p-8">
        <div>
          <p className="font-medium text-ink">Password</p>
          <p className="text-[14px] text-ink-3">We’ll email you a link to set a new one.</p>
        </div>
        <Link href="/forgot" className="btn btn-sm btn-outline">
          Reset
        </Link>
      </Reveal>
    </>
  );
}
