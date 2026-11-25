"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PostCard, PostCardSkeleton } from "@/components/post/post-card";
import { FEED_PAGE_SIZE } from "@/lib/config";
import { TAGS } from "@/lib/tags";
import type { FeedMode, Post } from "@/lib/types";

const TABS: { mode: FeedMode; label: string }[] = [
  { mode: "for-you", label: "For you" },
  { mode: "latest", label: "Latest" },
  { mode: "top", label: "Most copied" },
];

type Source =
  | { source: "feed"; mode: FeedMode; tag: string | null }
  | { source: "author" | "credited"; username: string }
  | { source: "search"; q: string };

function toQuery(s: Source, offset: number) {
  const p = new URLSearchParams({ source: s.source, offset: String(offset), limit: String(FEED_PAGE_SIZE) });
  if (s.source === "feed") {
    p.set("mode", s.mode);
    if (s.tag) p.set("tag", s.tag);
  } else if (s.source === "search") p.set("q", s.q);
  else p.set("username", s.username);
  return `/api/posts?${p}`;
}

/** Grid that keeps loading as you scroll. Used by every list of posts on the site. */
export function PostGrid({
  source,
  initialPosts,
  empty,
  priorityFirst = false,
}: {
  source: Source;
  initialPosts: Post[];
  empty?: React.ReactNode;
  priorityFirst?: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [done, setDone] = useState(initialPosts.length < FEED_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(source);
  const keyRef = useRef(key);

  // Reset when the source changes (tab or tag switch).
  useEffect(() => {
    if (keyRef.current === key) return;
    keyRef.current = key;
    setPosts(initialPosts);
    setDone(initialPosts.length < FEED_PAGE_SIZE);
  }, [key, initialPosts]);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(toQuery(source, posts.length));
      if (!res.ok) throw new Error(String(res.status));
      const next = (await res.json()) as Post[];
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...next.filter((p) => !seen.has(p.id))];
      });
      if (next.length < FEED_PAGE_SIZE) setDone(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, done, source, posts.length]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), { rootMargin: "900px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, done]);

  if (posts.length === 0 && done) return <>{empty}</>;

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <PostCard key={p.id} post={p} index={i} priority={priorityFirst && i < 3} />
        ))}
        {loading && Array.from({ length: 3 }, (_, i) => <PostCardSkeleton key={`s${i}`} />)}
      </div>
      <div ref={sentinel} className="h-px" aria-hidden />
      {error && (
        <div className="mt-10 text-center">
          <button type="button" onClick={loadMore} className="btn btn-outline">
            Couldn’t load more. Try again
          </button>
        </div>
      )}
      {done && posts.length > FEED_PAGE_SIZE && (
        <p className="eyebrow mt-20 text-center">That’s everything for now</p>
      )}
    </div>
  );
}

/** The home feed: tabs, tag filter and the grid. */
export function Feed({
  initialPosts,
  initialMode = "for-you",
  fixedTag,
}: {
  initialPosts: Post[];
  initialMode?: FeedMode;
  fixedTag?: string;
}) {
  const [mode, setMode] = useState<FeedMode>(initialMode);
  const [tag, setTag] = useState<string | null>(fixedTag ?? null);
  const [pages, setPages] = useState<Record<string, Post[]>>({ [`${initialMode}|${fixedTag ?? ""}`]: initialPosts });
  const [switching, setSwitching] = useState(false);
  const current = `${mode}|${tag ?? ""}`;

  const select = useCallback(
    async (nextMode: FeedMode, nextTag: string | null) => {
      const k = `${nextMode}|${nextTag ?? ""}`;
      if (!pages[k]) {
        setSwitching(true);
        try {
          const res = await fetch(toQuery({ source: "feed", mode: nextMode, tag: nextTag }, 0));
          const data = res.ok ? ((await res.json()) as Post[]) : [];
          setPages((p) => ({ ...p, [k]: data }));
        } finally {
          setSwitching(false);
        }
      }
      setMode(nextMode);
      setTag(nextTag);
    },
    [pages],
  );

  return (
    <div>
      <div className="sticky z-30 -mx-4 mb-10 bg-paper/92 px-4 backdrop-blur-[10px] sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10" style={{ top: "var(--header-h)" }}>
        <div className="flex flex-col gap-4 border-b border-line py-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Feed" className="flex items-center gap-1">
            {TABS.map((t) => {
              const on = t.mode === mode;
              return (
                <button
                  key={t.mode}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => select(t.mode, tag)}
                  className={`relative px-3 py-2 font-serif text-[22px] tracking-[-0.01em] transition-colors duration-300 sm:text-[26px] ${
                    on ? "text-ink" : "text-ink-3 hover:text-ink-2"
                  }`}
                >
                  {t.label}
                  {on && (
                    <motion.span
                      layoutId="feed-tab-mark"
                      className="absolute inset-x-2 -bottom-1 block h-[9px] text-clay"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    >
                      <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="size-full" aria-hidden>
                        <path
                          d="M2 6.5C22 3.2 48 2.6 70 3.8s38 2.6 48 1.6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>

          {!fixedTag && (
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" aria-label="Filter by tag">
              <Chip active={tag === null} onClick={() => select(mode, null)}>
                All
              </Chip>
              {TAGS.slice(0, 8).map((t) => (
                <Chip key={t.slug} active={tag === t.slug} onClick={() => select(mode, tag === t.slug ? null : t.slug)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${switching ? "opacity-40" : "opacity-100"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <PostGrid
              source={{ source: "feed", mode, tag }}
              initialPosts={pages[current] ?? []}
              priorityFirst={current === `${initialMode}|${fixedTag ?? ""}`}
              empty={<FeedEmpty tag={tag} />}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full border px-3.5 text-[14px] transition-colors duration-200 ${
        active ? "border-ink bg-ink text-paper" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function FeedEmpty({ tag }: { tag: string | null }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="font-serif text-[28px] tracking-[-0.01em] text-ink">Nothing here yet</p>
      <p className="mt-3 text-ink-3">
        {tag ? "No posts with this tag so far." : "The first posts will show up here."}
      </p>
      <a href="/new" className="btn btn-primary mt-8">
        Post something
      </a>
    </div>
  );
}
