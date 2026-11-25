"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { PostGrid } from "@/components/feed/feed";
import type { Post } from "@/lib/types";

export function ProfileTabs({
  username,
  isSelf,
  posts,
  credited,
  counts,
}: {
  username: string;
  isSelf: boolean;
  posts: Post[];
  credited: Post[];
  counts: { posts: number; credited: number };
}) {
  const [tab, setTab] = useState<"author" | "credited">("author");
  const tabs = [
    { id: "author" as const, label: "Posts", count: counts.posts },
    { id: "credited" as const, label: "Credited prompts", count: counts.credited },
  ];

  return (
    <div>
      <div role="tablist" className="mb-10 flex gap-6 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative -mb-px pb-4 text-[15px] transition-colors ${tab === t.id ? "text-ink" : "text-ink-3 hover:text-ink-2"}`}
          >
            {t.label} <span className="tnum text-ink-3">{t.count}</span>
            {tab === t.id && (
              <motion.span layoutId="profile-tab" className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-clay" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <PostGrid
            source={{ source: tab, username }}
            initialPosts={tab === "author" ? posts : credited}
            empty={
              <div className="py-20 text-center">
                <p className="font-serif text-[26px] text-ink">
                  {tab === "author" ? "No posts yet" : "Not credited on any prompt yet"}
                </p>
                {isSelf && tab === "author" && (
                  <Link href="/new" className="btn btn-primary mt-6">
                    Post your first piece
                  </Link>
                )}
              </div>
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
