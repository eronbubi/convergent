import Link from "next/link";
import { Suspense } from "react";
import { Feed } from "@/components/feed/feed";
import { Hero } from "@/components/home/hero";
import { MostCopied } from "@/components/home/most-copied";
import { TagIndex } from "@/components/home/tag-index";
import { Reveal } from "@/components/motion";
import { PostCardSkeleton } from "@/components/post/post-card";
import { ArrowRightIcon } from "@/components/ui/icons";
import { FEED_PAGE_SIZE } from "@/lib/config";
import { getSiteStats, getTagCounts, getTopPosts, listPosts } from "@/lib/data";
import type { FeedMode } from "@/lib/types";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <Suspense fallback={<HeroFallback />}>
        <HeroSection />
      </Suspense>

      <section aria-labelledby="tags-title" className="mx-auto max-w-[1440px] px-4 pb-28 sm:px-6 lg:px-10 lg:pb-40">
        <Reveal className="mb-8 flex items-end justify-between gap-6 border-t border-line pt-6">
          <h2 id="tags-title" className="eyebrow">
            Browse by tag
          </h2>
          <Link href="/tags" className="group inline-flex items-center gap-1.5 text-[14px] text-ink-2 hover:text-ink">
            All tags
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
        <Suspense fallback={<div className="skeleton h-64 rounded-2xl" />}>
          <TagSection />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <MostCopiedSection />
      </Suspense>

      <section
        id="feed"
        aria-label="Feed"
        className="mx-auto max-w-[1440px] scroll-mt-[var(--header-h)] px-4 pt-20 sm:px-6 lg:px-10 lg:pt-28"
      >
        <Suspense fallback={<FeedFallback />}>
          <FeedSection searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function HeroSection() {
  const [top, stats] = await Promise.all([getTopPosts(3), getSiteStats()]);
  return <Hero featured={top[0] ?? null} stack={top.slice(1, 3)} stats={stats} />;
}

async function TagSection() {
  const [counts, top] = await Promise.all([getTagCounts(), getTopPosts(60)]);
  const items = counts.map((c) => {
    const p = top.find((x) => x.tags.includes(c.tag));
    return { tag: c.tag, count: c.count, preview: p ? p.posterUrl : null };
  });
  return <TagIndex items={items} />;
}

async function MostCopiedSection() {
  const posts = await getTopPosts(8);
  return <MostCopied posts={posts.filter((p) => p.copyCount > 0)} />;
}

/** Footer links can open a specific tab: /?tab=latest#feed */
async function FeedSection({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { tab } = await searchParams;
  const mode: FeedMode = tab === "latest" || tab === "top" ? tab : "for-you";
  const posts = await listPosts({ source: "feed", mode }, 0, FEED_PAGE_SIZE);
  return <Feed key={mode} initialPosts={posts} initialMode={mode} />;
}

function HeroFallback() {
  return <div className="mx-auto h-[86vh] max-w-[1440px]" aria-hidden />;
}

function FeedFallback() {
  return (
    <div className="grid grid-cols-1 gap-x-7 gap-y-14 pt-28 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
