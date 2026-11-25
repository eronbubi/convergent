import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PostGrid } from "@/components/feed/feed";
import { Reveal } from "@/components/motion";
import { Avatar } from "@/components/ui/avatar";
import { SearchIcon } from "@/components/ui/icons";
import { TagChip } from "@/components/ui/tag-chip";
import { FEED_PAGE_SIZE } from "@/lib/config";
import { listPosts, searchPeople, searchTags } from "@/lib/data";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-16">
      <Suspense fallback={<div className="skeleton h-40 rounded-2xl" aria-hidden />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 120);

  const [people, tags, posts] = q
    ? await Promise.all([searchPeople(q, 12), searchTags(q, 10), listPosts({ source: "search", q }, 0, FEED_PAGE_SIZE)])
    : [[], [], []];

  return (
    <>
      <form action="/search" className="relative max-w-3xl">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-0 size-7 -translate-y-1/2 text-ink-3" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search posts, people, tags"
          aria-label="Search"
          className="h-20 w-full border-b border-line-strong bg-transparent pl-11 font-serif text-[clamp(1.8rem,4vw,3rem)] tracking-[-0.02em] text-ink outline-none placeholder:text-ink-3/60 focus:border-ink"
        />
      </form>

      {q && (
        <Reveal className="mt-6 text-[15px] text-ink-3" y={8}>
          Results for “<span className="text-ink">{q}</span>”
        </Reveal>
      )}

      {people.length > 0 && (
        <section className="mt-14" aria-labelledby="people-title">
          <h2 id="people-title" className="eyebrow mb-5">
            People
          </h2>
          <ul className="flex flex-wrap gap-3">
            {people.map((p, i) => (
              <Reveal as="li" key={p.username} delay={i * 0.04} y={12}>
                <Link
                  href={`/u/${p.username}`}
                  className="flex items-center gap-3 rounded-full border border-line bg-card py-1.5 pr-5 pl-1.5 transition-colors hover:border-ink"
                >
                  <Avatar name={p.displayName} size={38} />
                  <span>
                    <span className="block text-[15px] leading-tight font-medium text-ink">{p.displayName}</span>
                    <span className="block text-[12.5px] text-ink-3">
                      @{p.username} · {p.postCount} {plural(p.postCount, "post")}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {tags.length > 0 && (
        <section className="mt-12" aria-labelledby="tags-title">
          <h2 id="tags-title" className="eyebrow mb-5">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <TagChip key={t.tag} tag={t.tag} />
            ))}
          </div>
        </section>
      )}

      {q && (
        <section className="mt-16" aria-labelledby="posts-title">
          <h2 id="posts-title" className="eyebrow mb-8">
            Posts
          </h2>
          <PostGrid
            source={{ source: "search", q }}
            initialPosts={posts}
            empty={<p className="py-16 text-center text-ink-3">No posts match “{q}”.</p>}
          />
        </section>
      )}
    </>
  );
}
