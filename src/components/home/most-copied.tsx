"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/components/hooks";
import { Clip } from "@/components/post/clip";
import { CopyIcon } from "@/components/ui/icons";
import { formatCount } from "@/lib/format";
import type { Post } from "@/lib/types";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The most copied posts. On wide screens the section pins and vertical scrolling
 * moves the row sideways; on small screens and with reduced motion it is a plain swipe row.
 */
export function MostCopied({ posts }: { posts: Post[] }) {
  const wide = useMediaQuery("(min-width: 900px)");
  const reduce = useReducedMotion();
  const pinned = wide && !reduce;

  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [distance, setDistance] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  useIsoLayoutEffect(() => {
    if (!pinned) return;
    const el = track.current;
    if (!el) return;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned, posts.length]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  if (posts.length === 0) return null;

  return (
    <section
      ref={section}
      aria-labelledby="most-copied-title"
      className="relative bg-night text-paper"
      style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-20"}>
        <div className="mx-auto flex w-full max-w-[1440px] items-end justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <div>
            <p className="eyebrow !text-paper/45">Ranked by prompt copies</p>
            <h2 id="most-copied-title" className="mt-3 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-none tracking-[-0.03em]">
              Most copied
            </h2>
          </div>
          <p className="hidden max-w-[22rem] pb-2 text-[15px] leading-relaxed text-paper/55 md:block">
            Each time someone copies a prompt it counts once per person. These are the prompts people reuse most.
          </p>
        </div>

        <motion.ol
          ref={track}
          style={pinned ? { x } : undefined}
          className={`mt-10 flex gap-6 px-4 sm:px-6 lg:gap-10 lg:px-10 ${
            pinned
              ? "w-max will-change-transform"
              : "scrollbar-none snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          }`}
        >
          {posts.map((p, i) => (
            <li key={p.id} className="flex shrink-0 snap-start items-end gap-4 lg:gap-6">
              <span
                aria-hidden
                className="font-serif leading-[0.8] tracking-[-0.06em] text-transparent tnum"
                style={{ fontSize: "clamp(5rem, 11vw, 11rem)", WebkitTextStroke: "1.2px rgb(243 239 230 / 0.35)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <Link
                href={`/p/${p.id}`}
                className="group block w-[min(68vw,300px)] lg:w-[min(30vw,340px)]"
                onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(p.id)}
                onPointerLeave={() => setHovered(null)}
              >
                <div
                  className="relative overflow-hidden rounded-[14px] bg-night-2"
                  style={{ height: pinned ? "min(52vh, 440px)" : "min(85vw, 380px)" }}
                >
                  <Clip post={p} sizes="340px" hovered={hovered === p.id} className="group-hover:scale-[1.04]" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-[20px] leading-tight">{p.title}</p>
                    <p className="mt-1 truncate text-[13px] text-paper/50">
                      {p.promptEngineer} · {p.modelUsed}
                    </p>
                  </div>
                  <p className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-night-line px-2.5 py-1 text-[13px] text-paper/80">
                    <CopyIcon className="size-3.5" />
                    <span className="tnum">{formatCount(p.copyCount)}</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
          <li className="w-[4vw] shrink-0" aria-hidden />
        </motion.ol>

        {pinned && (
          <div className="mx-auto mt-10 w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="h-px w-full bg-night-line">
              <motion.div className="h-px origin-left bg-clay" style={{ scaleX: progress }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
