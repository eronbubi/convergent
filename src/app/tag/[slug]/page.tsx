import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Feed } from "@/components/feed/feed";
import { Reveal, SplitText } from "@/components/motion";
import { Underline } from "@/components/sketch/doodles";
import { FEED_PAGE_SIZE } from "@/lib/config";
import { getTagCounts, listPosts } from "@/lib/data";
import { plural } from "@/lib/format";
import { slugifyTag, tagLabel, TAGS } from "@/lib/tags";

export async function generateMetadata({ params }: PageProps<"/tag/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const label = tagLabel(slugifyTag(decodeURIComponent(slug)));
  return { title: label, description: `${label} images and clips with their prompts and models.` };
}

export default function TagPage({ params }: PageProps<"/tag/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[60vh] max-w-[1440px]" aria-hidden />}>
      <TagView params={params} />
    </Suspense>
  );
}

async function TagView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = slugifyTag(decodeURIComponent(raw));
  const [posts, counts] = await Promise.all([
    listPosts({ source: "feed", mode: "for-you", tag: slug }, 0, FEED_PAGE_SIZE),
    getTagCounts(),
  ]);
  const count = counts.find((c) => c.tag === slug)?.count ?? 0;
  const others = TAGS.filter((t) => t.slug !== slug).slice(0, 6);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-16">
      <header className="pb-14">
        <Reveal y={10}>
          <Link href="/tags" className="eyebrow hover:text-ink">
            Tag
          </Link>
        </Reveal>
        <h1 className="mt-4 font-serif text-[clamp(3.4rem,10vw,9.5rem)] leading-[0.9] tracking-[-0.045em] text-ink">
          <span className="relative inline-block">
            <SplitText text={tagLabel(slug)} trigger="mount" />
            <span className="absolute -bottom-[0.08em] left-0 w-full text-clay">
              <Underline trigger="mount" delay={0.7} strokeWidth={4} />
            </span>
          </span>
        </h1>
        <Reveal delay={0.3} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="text-[16px] text-ink-2">
            <span className="tnum">{count}</span> {plural(count, "post")}
          </p>
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-ink-3">
            {others.map((t) => (
              <Link key={t.slug} href={`/tag/${t.slug}`} className="link-underline hover:text-ink">
                {t.label}
              </Link>
            ))}
          </p>
        </Reveal>
      </header>

      <Feed initialPosts={posts} fixedTag={slug} />
    </div>
  );
}
