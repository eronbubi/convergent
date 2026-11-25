import Link from "next/link";
import { tagLabel, tagTone, type Tone } from "@/lib/tags";

const tones: Record<Tone, string> = {
  clay: "bg-clay-soft/70 text-clay-deep hover:bg-clay-soft",
  sky: "bg-sky-soft text-[#3f6688] hover:bg-sky-soft/70",
  olive: "bg-olive-soft text-[#56623a] hover:bg-olive-soft/70",
  fig: "bg-fig-soft text-[#86425c] hover:bg-fig-soft/70",
  kraft: "bg-kraft-soft text-[#8a6236] hover:bg-kraft-soft/70",
  ink: "bg-paper-3 text-ink hover:bg-line",
};

export function TagChip({ tag, size = "md" }: { tag: string; size?: "sm" | "md" }) {
  return (
    <Link
      href={`/tag/${tag}`}
      className={`inline-flex items-center rounded-full transition-colors duration-200 ${tones[tagTone(tag)]} ${
        size === "sm" ? "h-7 px-2.5 text-[12.5px]" : "h-8 px-3 text-[13.5px]"
      }`}
    >
      {tagLabel(tag)}
    </Link>
  );
}
