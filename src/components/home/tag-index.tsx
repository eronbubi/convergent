"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CircleMark } from "@/components/sketch/doodles";
import { tagLabel } from "@/lib/tags";

type Item = { tag: string; count: number; preview: string | null };

const EASE = [0.22, 1, 0.36, 1] as const;

/** Tags set as one long line of type. Hovering a tag circles it and floats a preview next to the cursor. */
export function TagIndex({ items }: { items: Item[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const preview = items.find((i) => i.tag === hovered)?.preview ?? null;

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        x.set(e.clientX);
        y.set(e.clientY);
      }}
    >
      <motion.ul
        className="flex flex-wrap items-baseline gap-x-[0.32em] gap-y-1 font-serif leading-[1.08] tracking-[-0.03em]"
        style={{ fontSize: "clamp(2.1rem, 5.6vw, 5.4rem)" }}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.25 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {items.map((item, i) => (
          <motion.li
            key={item.tag}
            className="inline-flex items-baseline"
            variants={{
              hidden: { opacity: 0, y: 40 },
              shown: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            <Link
              href={`/tag/${item.tag}`}
              className={`relative inline-block transition-colors duration-300 ${
                hovered && hovered !== item.tag ? "text-ink-3/60" : "text-ink"
              } hover:text-clay-deep`}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setHovered(item.tag);
              }}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(item.tag)}
              onBlur={() => setHovered(null)}
            >
              {tagLabel(item.tag)}
              <sup className="ml-1 align-super font-mono text-[0.2em] tracking-normal text-ink-3 tnum">
                {item.count}
              </sup>
              {hovered === item.tag && (
                <span className="pointer-events-none absolute -inset-x-[6%] -inset-y-[18%] text-clay">
                  <CircleMark trigger="mount" className="size-full" strokeWidth={2} seed={i + 3} />
                </span>
              )}
            </Link>
            {i < items.length - 1 && <span className="ml-[0.32em] text-line-strong" aria-hidden>/</span>}
          </motion.li>
        ))}
      </motion.ul>

      <AnimatePresence>
        {preview && (
          <motion.div
            key={preview}
            className="pointer-events-none fixed top-0 left-0 z-40 hidden h-[220px] w-[176px] overflow-hidden rounded-[12px] shadow-[0_30px_60px_-24px_rgb(40_30_15/0.55)] md:block"
            style={{ x: sx, y: sy, translateX: "24px", translateY: "-50%" }}
            initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Image src={preview} alt="" fill sizes="176px" className="object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
