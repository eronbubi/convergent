"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

type DrawProps = {
  /** Path data. Strokes are drawn in order. */
  d: string[];
  viewBox: string;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  /** Seconds before the first stroke starts. */
  delay?: number;
  /** Seconds per stroke. */
  duration?: number;
  /** Overlap between consecutive strokes, 0–1. */
  overlap?: number;
  /** "view": draw when scrolled into view (default). "mount": draw immediately. */
  trigger?: "view" | "mount";
  /** Shown to assistive tech; decorative drawings stay hidden when omitted. */
  label?: string;
  /** Stretch to the box instead of keeping the aspect ratio (for flat strokes like underlines). */
  stretch?: boolean;
};

/** Hand-drawn strokes that draw themselves, one after another. */
export function Draw({
  d,
  viewBox,
  className,
  style,
  strokeWidth = 2,
  delay = 0,
  duration = 0.7,
  overlap = 0.35,
  trigger = "view",
  label,
  stretch = false,
}: DrawProps) {
  const reduce = useReducedMotion();
  const step = duration * (1 - overlap);

  return (
    <motion.svg
      viewBox={viewBox}
      preserveAspectRatio={stretch ? "none" : undefined}
      fill="none"
      className={className}
      style={{ overflow: "visible", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      initial={reduce ? "shown" : "hidden"}
      whileInView={trigger === "view" ? "shown" : undefined}
      animate={trigger === "mount" ? "shown" : undefined}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {d.map((path, i) => (
        <motion.path
          key={i}
          d={path}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            shown: {
              pathLength: 1,
              opacity: 1,
              transition: {
                pathLength: { delay: delay + i * step, duration, ease: [0.65, 0, 0.35, 1] },
                opacity: { delay: delay + i * step, duration: 0.01 },
              },
            },
          }}
        />
      ))}
    </motion.svg>
  );
}
