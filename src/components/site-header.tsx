"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { SearchDialog } from "@/components/search-dialog";

/** Sticky top bar. The paper fill and hairline fade in with scroll (CSS), with a JS fallback. */
export function SiteHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (CSS.supports("(animation-timeline: scroll()) and (animation-range: 0% 100%)")) return;
    const el = ref.current;
    if (!el) return;
    const update = () => {
      el.dataset.scrolled = String(window.scrollY > 40);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      ref={ref}
      className="site-header sticky top-0 z-50 backdrop-blur-[10px]"
      style={{ height: "var(--header-h)" }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Logo />
        <div className="flex flex-1 justify-end md:justify-center">
          <SearchDialog />
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
