"use client";

import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "p" | "span" | "header";
  amount?: number;
}) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * Splits text into words that rise out of a mask one after another.
 * The full string stays available to screen readers.
 */
export function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  trigger = "view",
  as = "span",
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  trigger?: "view" | "mount";
  as?: ElementType;
}) {
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        animate={trigger === "mount" ? "shown" : undefined}
        whileInView={trigger === "view" ? "shown" : undefined}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {words.map((w, i) => (
          <span
            key={i}
            className="-mx-[0.08em] -mt-[0.2em] -mb-[0.14em] inline-block overflow-hidden px-[0.08em] pt-[0.2em] pb-[0.14em] align-bottom"
          >
            <motion.span
              className={`inline-block will-change-transform ${wordClassName ?? ""}`}
              variants={{
                hidden: { y: "110%", rotate: 4 },
                shown: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE } },
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** Counts up from zero the first time it becomes visible. */
export function CountUp({ value, className, format }: { value: number; className?: string; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const fmt = format ?? ((n: number) => new Intl.NumberFormat("en").format(n));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  const display = reduce ? value : inView ? shown : 0;

  return (
    <span ref={ref} className={`tnum ${className ?? ""}`}>
      <span className="sr-only">{fmt(value)}</span>
      <span aria-hidden>{fmt(display)}</span>
    </span>
  );
}
