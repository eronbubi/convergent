import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Reveal, SplitText } from "@/components/motion";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getTagCounts, getTopPosts } from "@/lib/data";
import { plural } from "@/lib/format";
import { tagLabel } from "@/lib/tags";

export const metadata: Metadata = { title: "Tags" };

export default function TagsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-16">
      <h1 className="font-serif text-[clamp(3.4rem,9vw,8rem)] leading-[0.9] tracking-[-0.045em]">
        <SplitText text="All tags" trigger="mount" />
      </h1>
      <Suspense fallback={<div className="skeleton mt-16 h-[60vh] rounded-2xl" />}>
        <TagList />
      </Suspense>
    </div>
  );
}

async function TagList() {
  const [counts, top] = await Promise.all([getTagCounts(), getTopPosts(80)]);
  return (
    <ol className="mt-16 border-t border-line">
      {counts.map((c, i) => {
        const previews = top
          .filter((p) => p.tags.includes(c.tag))
          .slice(0, 3)
          .map((p) => ({ id: p.id, src: p.posterUrl }));
        return (
          <Reveal as="li" key={c.tag} y={20} amount={0.4}>
            <Link
              href={`/tag/${c.tag}`}
              className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-line py-5 transition-colors duration-300 hover:bg-paper-2/60 sm:grid-cols-[4rem_1fr_auto_auto] sm:py-6"
            >
              <span className="pl-2 font-mono text-[12px] text-ink-3 tnum">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-serif text-[clamp(1.8rem,3.6vw,3rem)] leading-none tracking-[-0.025em] text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                {tagLabel(c.tag)}
              </span>
              <span className="hidden items-center -space-x-6 sm:flex" aria-hidden>
                {previews.map((p, j) => (
                  <span
                    key={p.id}
                    className="relative block h-14 w-11 overflow-hidden rounded-md border-2 border-paper shadow-sm transition-transform duration-500 ease-out-expo group-hover:translate-x-[var(--dx)] group-hover:-rotate-[var(--r)]"
                    style={{ "--dx": `${(j - 1) * -10}px`, "--r": `${(j - 1) * 4}deg` } as React.CSSProperties}
                  >
                    <Image src={p.src} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                ))}
              </span>
              <span className="flex items-center gap-3 pr-2 text-[14px] text-ink-3">
                <span className="tnum">
                  {c.count} {plural(c.count, "post")}
                </span>
                <ArrowRightIcon className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ol>
  );
}
