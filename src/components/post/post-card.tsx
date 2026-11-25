"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Clip } from "@/components/post/clip";
import { RollingNumber } from "@/components/post/rolling-number";
import { useCopyPrompt } from "@/components/post/use-copy-prompt";
import { CheckIcon, CopyIcon, PauseIcon, PlayIcon } from "@/components/ui/icons";
import type { Post } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function PostCard({ post, index = 0, priority }: { post: Post; index?: number; priority?: boolean }) {
  const { copy, copied, count } = useCopyPrompt(post.id, post.prompt, post.copyCount);
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const col = index % 3;

  return (
    <motion.article
      className="group relative"
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1, ease: EASE, delay: col * 0.09 }}
    >
      <div
        className="relative"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <Link href={`/p/${post.id}`} className="block rounded-[14px]" aria-label={post.title}>
          <motion.div
            className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-paper-2"
            initial={{ clipPath: "inset(14% 0% 0% 0% round 14px)" }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0% round 14px)" }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1.2, ease: EASE, delay: col * 0.09 }}
          >
            <span className="skeleton absolute inset-0" aria-hidden />
            <Clip
              post={post}
              sizes="(min-width: 1280px) 440px, (min-width: 768px) 45vw, 92vw"
              priority={priority}
              hovered={hovered}
              paused={paused}
              onPlayingChange={setPlaying}
              className="group-hover:scale-[1.035]"
            />
          </motion.div>
        </Link>

        <button
          type="button"
          onClick={copy}
          className="absolute top-3 right-3 z-10 inline-flex h-9 items-center gap-1.5 rounded-full bg-card/90 px-3 text-[13px] font-medium text-ink shadow-[0_6px_20px_-8px_rgb(40_30_15/0.45)] backdrop-blur-md transition-[opacity,translate,background-color] duration-300 hover:bg-card focus-visible:opacity-100 sm:translate-y-[-4px] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          aria-label={copied ? "Prompt copied" : `Copy prompt for ${post.title}`}
        >
          {copied ? <CheckIcon className="size-4 text-olive" /> : <CopyIcon className="size-4" />}
          {copied ? "Copied" : "Copy prompt"}
        </button>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="absolute bottom-3 left-3 z-10 grid size-8 place-items-center rounded-full bg-night/50 text-paper backdrop-blur-md transition-opacity duration-300 hover:bg-night/70 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          aria-label={playing ? "Pause clip" : "Play clip"}
        >
          {playing ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-[21px] leading-[1.15] tracking-[-0.01em] text-ink text-balance">
            <Link href={`/p/${post.id}`} className="link-underline">
              {post.title}
            </Link>
          </h3>
          <p className="mt-1.5 truncate text-[13.5px] text-ink-3">
            {post.engineerUsername ? (
              <Link href={`/u/${post.engineerUsername}`} className="text-ink-2 hover:text-ink">
                {post.promptEngineer}
              </Link>
            ) : (
              <span className="text-ink-2">{post.promptEngineer}</span>
            )}
            <span className="mx-1.5 text-line-strong">/</span>
            {post.modelUsed}
          </p>
        </div>
        <p className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-[13px] text-ink-3" title="People who copied this prompt">
          <CopyIcon className="size-[15px]" />
          <RollingNumber value={count} />
        </p>
      </div>
    </motion.article>
  );
}

export function PostCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-[4/5] rounded-[14px]" />
      <div className="skeleton mt-4 h-5 w-3/4 rounded" />
      <div className="skeleton mt-2.5 h-3.5 w-1/2 rounded" />
    </div>
  );
}
