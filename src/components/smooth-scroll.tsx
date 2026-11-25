"use client";

import Lenis from "lenis";
import { useEffect } from "react";

let instance: Lenis | null = null;

/** Pause and resume page smoothing, e.g. while a modal is open. */
export function lockScroll(locked: boolean) {
  if (!instance) return;
  if (locked) instance.stop();
  else instance.start();
}

export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 0.95,
      autoRaf: true,
      anchors: { offset: -88 },
      prevent: (node) => Boolean(node.closest?.("dialog, [data-lenis-prevent]")),
    });
    instance = lenis;

    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        lenis.destroy();
        instance = null;
      }
    };
    reduce.addEventListener("change", onChange);

    return () => {
      reduce.removeEventListener("change", onChange);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
