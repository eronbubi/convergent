"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Draw } from "@/components/sketch/draw";
import { sketchArrow, sketchCurve } from "@/components/sketch/rough";
import { CountUp, SplitText } from "@/components/motion";
import { Clip } from "@/components/post/clip";
import { Avatar } from "@/components/ui/avatar";
import { ArrowRightIcon, CopyIcon } from "@/components/ui/icons";
import { formatCount } from "@/lib/format";
import type { Post, SiteStats } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ featured, stack, stats }: { featured: Post | null; stack: Post[]; stats: SiteStats }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const frontY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const backLX = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const backLY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const backLR = useTransform(scrollYProgress, [0, 1], [-7, reduce ? -7 : -13]);
  const backRX = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const backRY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -30]);
  const backRR = useTransform(scrollYProgress, [0, 1], [6, reduce ? 6 : 12]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);

  const underline = useMemo(
    () =>
      sketchCurve(
        [
          [6, 22],
          [120, 12],
          [260, 9],
          [420, 16],
          [574, 11],
        ],
        8,
        { roughness: 0.5, bowing: 0.6, strokeWidth: 5 },
      ),
    [],
  );

  return (
    <section ref={ref} className="relative mx-auto max-w-[1440px] px-4 pt-8 pb-24 sm:px-6 lg:px-10 lg:pt-14 lg:pb-36">
      <div className="grid items-start gap-y-16 lg:grid-cols-12 lg:gap-x-10">
        {/* Left: name, description, actions, numbers */}
        <motion.div className="lg:col-span-6 xl:col-span-6" style={{ y: titleY }}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            Motion made with code
          </motion.p>

          <h1
            className="mt-6 font-serif leading-[0.86] font-normal tracking-[-0.045em] text-ink"
            style={{ fontSize: "clamp(4.6rem, 12.5vw, 12.5rem)" }}
          >
            <SplitText text="Claude" trigger="mount" delay={0.15} className="block" />
            <span className="relative inline-block">
              <SplitText text="motion" trigger="mount" delay={0.28} wordClassName="italic font-light pr-[0.06em]" className="block" />
              <span className="absolute -bottom-[0.06em] left-[0.02em] w-[96%] text-clay">
                <Draw d={underline} viewBox="0 0 580 30" trigger="mount" delay={0.95} duration={0.9} strokeWidth={5} style={{ width: "100%", height: "auto" }} />
              </span>
            </span>
          </h1>

          <motion.p
            className="mt-10 max-w-[34rem] text-[18px] leading-relaxed text-ink-2 text-pretty sm:text-[19px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          >
            Motion pieces made with code. Every post carries the clip, a still from it, the prompt, the model that
            wrote the code, models worth trying it on, and the prompt engineer behind it.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.68 }}
          >
            <a href="#feed" className="btn btn-primary group">
              Browse the feed
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <Link href="/new" className="btn btn-outline">
              Post your work
            </Link>
          </motion.div>

          <motion.dl
            className="mt-14 grid max-w-[34rem] grid-cols-3 items-end gap-4 border-t border-line pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.85 }}
          >
            {[
              { label: "Posts", value: stats.posts },
              { label: "Prompt engineers", value: stats.engineers },
              { label: "Prompts copied", value: stats.copies },
            ].map((s) => (
              <div key={s.label}>
                <dt className="eyebrow">{s.label}</dt>
                <dd className="mt-2 font-serif text-[34px] leading-none tracking-[-0.02em] text-ink sm:text-[40px]">
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Right: an annotated post */}
        <div className="relative flex justify-center lg:col-span-6 lg:pt-6 min-[1320px]:justify-start min-[1320px]:pl-[80px]">
          <div className="relative w-full max-w-[380px]">
            {stack[0] && (
              <motion.div
                aria-hidden
                className="absolute top-[-30px] right-[64px] left-[-34px] h-[58%] overflow-hidden rounded-[18px] bg-paper-3 shadow-[0_30px_60px_-30px_rgb(40_30_15/0.45)]"
                style={{ x: backLX, y: backLY, rotate: backLR }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
              >
                <StackImage post={stack[0]} />
              </motion.div>
            )}
            {stack[1] && (
              <motion.div
                aria-hidden
                className="absolute top-[-12px] right-[-40px] left-[84px] h-[52%] overflow-hidden rounded-[18px] bg-paper-3 shadow-[0_30px_60px_-30px_rgb(40_30_15/0.45)]"
                style={{ x: backRX, y: backRY, rotate: backRR }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
              >
                <StackImage post={stack[1]} />
              </motion.div>
            )}

            <motion.div style={{ y: frontY }}>
              <motion.div
                initial={{ opacity: 0, y: 60, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.25 }}
              >
                <AnnotatedCard post={featured} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StackImage({ post }: { post: Post }) {
  return <Image src={post.posterUrl} alt="" fill sizes="380px" className="object-cover" />;
}

/* ──────────────────────────────────────────────────────────────
   The card with hand-drawn notes pointing at each part
   ────────────────────────────────────────────────────────────── */

const EXAMPLE: Post = {
  id: "example",
  title: "Your first post",
  prompt:
    "The prompt you gave the model that wrote the code for your clip, exactly as you typed it, so others can reuse it.",
  mediaUrl: "",
  posterUrl: "",
  width: 4,
  height: 5,
  modelUsed: "Model you used",
  recommendedModels: ["Another model", "One more"],
  promptEngineer: "you",
  engineerUsername: null,
  tags: ["motion-graphics"],
  copyCount: 0,
  createdAt: "2026-01-01T00:00:00Z",
  authorId: "",
  authorUsername: "you",
  authorDisplayName: "You",
};

function AnnotatedCard({ post }: { post: Post | null }) {
  const p = post ?? EXAMPLE;
  const isExample = !post;
  const [hovered, setHovered] = useState(false);

  const body = (
    <article className="relative rounded-[18px] border border-line bg-card p-3 shadow-[0_40px_80px_-40px_rgb(40_30_15/0.5),0_2px_0_rgb(255_255_255/0.7)_inset]">
      <div
        className="relative"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[6/5] overflow-hidden rounded-[12px] bg-paper-2">
          {isExample ? <ExampleArt /> : <Clip post={p} sizes="380px" priority hovered={hovered} />}
        </div>
        <Annotation side="left" text={isExample ? "a still from your clip" : "a still · hover to play"} delay={1.05} seed={13} />
      </div>

      <div className="px-2 pt-4 pb-2">
        <h2 className="font-serif text-[22px] leading-tight tracking-[-0.01em] text-ink">{p.title}</h2>

        <Row note={{ side: "left", text: "the exact prompt", delay: 1.25, seed: 21 }}>
          <p className="eyebrow">Prompt</p>
          <p className="mt-1.5 line-clamp-3 font-mono text-[12px] leading-relaxed text-ink-2">{p.prompt}</p>
        </Row>

        <Row note={{ side: "right", text: "made with", delay: 1.45, seed: 33 }}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">Model</p>
            <p className="truncate text-[14px] font-medium text-ink">{p.modelUsed}</p>
          </div>
        </Row>

        <Row note={{ side: "left", text: "also try it on", delay: 1.65, seed: 45 }}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">Recommended</p>
            <p className="truncate text-[14px] text-ink-2">{p.recommendedModels.slice(0, 2).join(", ")}</p>
          </div>
        </Row>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <Row note={{ side: "left", text: "who wrote it", delay: 1.85, seed: 57 }} bare>
            <span className="flex items-center gap-2.5">
              <Avatar name={p.authorDisplayName} size={30} />
              <span className="text-[14px] font-medium text-ink">{p.promptEngineer}</span>
            </span>
          </Row>
          <Row
            note={{
              side: "right",
              text: isExample ? "copies get counted" : `copied ${formatCount(p.copyCount)}×`,
              delay: 2.05,
              seed: 69,
            }}
            bare
          >
            <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-3">
              <CopyIcon className="size-[15px]" />
              <span className="tnum">{formatCount(p.copyCount)}</span>
            </span>
          </Row>
        </div>
      </div>
    </article>
  );

  if (isExample) return body;
  return (
    <Link href={`/p/${p.id}`} className="block rounded-[18px] transition-transform duration-500 ease-out-expo hover:-translate-y-1">
      {body}
    </Link>
  );
}

type Note = { side: "left" | "right"; text: string; delay: number; seed: number };

function Row({ note, children, bare }: { note: Note; children: React.ReactNode; bare?: boolean }) {
  return (
    <div className={`relative ${bare ? "" : "mt-4"}`}>
      {children}
      <Annotation {...note} />
    </div>
  );
}

function Annotation({ side, text, delay, seed }: Note) {
  const left = side === "left";
  // Arrow box: 70×36, pointing at the card edge.
  const d = useMemo(
    () => (left ? sketchArrow([4, 10], [64, 24], -14, seed, 9) : sketchArrow([66, 10], [6, 24], 14, seed, 9)),
    [left, seed],
  );
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 items-center gap-1 min-[1320px]:flex ${
        left ? "right-[calc(100%+24px)] flex-row" : "left-[calc(100%+24px)] flex-row-reverse"
      }`}
    >
      <motion.span
        className="font-hand text-[23px] leading-none whitespace-nowrap text-ink-2"
        initial={{ opacity: 0, x: left ? -10 : 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: delay + 0.25 }}
      >
        {text}
      </motion.span>
      <Draw
        d={d}
        viewBox="0 0 70 36"
        className="w-[52px] text-clay"
        trigger="mount"
        delay={delay}
        duration={0.45}
        overlap={0.1}
        strokeWidth={1.8}
      />
    </div>
  );
}

/** Placeholder art for an empty site: a sketched frame with a sun and hills. */
function ExampleArt() {
  const d = useMemo(
    () => [
      ...sketchCurve([[30, 210], [110, 140], [170, 180], [250, 110], [350, 200]], 3, { roughness: 0.8 }),
      ...sketchCurve([[20, 250], [140, 205], [260, 235], [360, 215]], 5, { roughness: 0.8 }),
    ],
    [],
  );
  return (
    <div className="absolute inset-0 grid place-items-center bg-kraft-soft text-clay-deep">
      <svg viewBox="0 0 380 300" className="absolute inset-0 size-full" aria-hidden>
        <circle cx="270" cy="80" r="34" fill="var(--clay-soft)" />
      </svg>
      <Draw d={d} viewBox="0 0 380 300" className="absolute inset-0 size-full" trigger="mount" delay={0.8} strokeWidth={2.2} />
    </div>
  );
}
