"use client";

import { AnimatePresence, motion } from "motion/react";
import { formatCount } from "@/lib/format";

/** A number that rolls upward when it changes. */
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden tnum ${className ?? ""}`} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {formatCount(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
