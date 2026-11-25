import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CountUp, Reveal, SplitText } from "@/components/motion";
import { ProfileTabs } from "@/components/profile-tabs";
import { Squiggle } from "@/components/sketch/doodles";
import { Avatar } from "@/components/ui/avatar";
import { FEED_PAGE_SIZE } from "@/lib/config";
import { getProfile, getViewer, listPosts } from "@/lib/data";
import { formatMonth } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfile(decodeURIComponent(username));
  if (!data) return { title: "Profile not found" };
  return { title: `${data.profile.displayName} (@${data.profile.username})`, description: data.profile.bio || undefined };
}

export default function ProfilePage({ params }: PageProps<"/u/[username]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[60vh] max-w-[1440px]" aria-hidden />}>
      <ProfileView params={params} />
    </Suspense>
  );
}

async function ProfileView({ params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw).toLowerCase();
  const [data, viewer] = await Promise.all([getProfile(username), getViewer()]);
  if (!data) notFound();
  const { profile, stats } = data;

  const [posts, credited] = await Promise.all([
    listPosts({ source: "author", username }, 0, FEED_PAGE_SIZE),
    listPosts({ source: "credited", username }, 0, FEED_PAGE_SIZE),
  ]);
  const isSelf = viewer?.id === profile.id;

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-16">
      <header className="grid gap-10 pb-16 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal y={16}>
            <Avatar name={profile.displayName} size={88} />
          </Reveal>
          <h1 className="mt-6 font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.04em] text-ink">
            <SplitText text={profile.displayName} trigger="mount" />
          </h1>
          <Reveal delay={0.2} className="mt-4">
            <p className="text-[15px] text-ink-3">
              @{profile.username} · Joined {formatMonth(profile.createdAt)}
            </p>
            {profile.bio && <p className="mt-4 max-w-xl text-[18px] leading-relaxed text-ink-2">{profile.bio}</p>}
            <Squiggle className="mt-6 w-32 text-clay" delay={0.4} />
          </Reveal>
        </div>
        <Reveal delay={0.25} className="lg:col-span-4">
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5">
            {[
              { label: "Posts", value: stats.posts },
              { label: "Copies", value: stats.copiesReceived },
              { label: "Credited", value: stats.credited },
            ].map((s) => (
              <div key={s.label}>
                <dt className="eyebrow">{s.label}</dt>
                <dd className="mt-2 font-serif text-[36px] leading-none tracking-[-0.02em]">
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
          {isSelf && (
            <Link href="/settings" className="btn btn-sm btn-outline mt-6">
              Edit profile
            </Link>
          )}
        </Reveal>
      </header>

      <ProfileTabs
        username={profile.username}
        isSelf={isSelf}
        posts={posts}
        credited={credited}
        counts={{ posts: stats.posts, credited: stats.credited }}
      />
    </div>
  );
}
