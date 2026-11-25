import { hashString, initials } from "@/lib/format";

const fills = [
  ["var(--clay-soft)", "var(--clay-deep)"],
  ["var(--sky-soft)", "#3f6688"],
  ["var(--olive-soft)", "#56623a"],
  ["var(--fig-soft)", "#86425c"],
  ["var(--kraft-soft)", "#8a6236"],
] as const;

/** Initials inside a slightly irregular, hand-drawn disc. Colour is stable per name. */
export function Avatar({ name, size = 36, className = "" }: { name: string; size?: number; className?: string }) {
  const h = hashString(name);
  const [bg, fg] = fills[h % fills.length];
  const r = (n: number) => ((h >> n) & 7) / 7; // 0..1 jitter per seed bit
  const path = `M20 ${2.5 + r(1)}C${30 + r(2) * 2} ${2 + r(3)} ${38 - r(4)} ${10 + r(5) * 2} ${37.5 + r(6)} 20C${38 - r(7)} ${30 + r(8) * 2} ${30 - r(9)} ${38 - r(10)} 20 ${37.5 - r(11)}C${10 - r(12)} ${38 - r(13)} ${2.5 + r(14)} ${30 - r(15)} ${2.5 - r(16)} 20C${2 + r(17)} ${10 - r(18)} ${10 + r(19)} ${2 + r(20)} 20 ${2.5 + r(1)}Z`;
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full">
        <path d={path} fill={bg} stroke={fg} strokeOpacity="0.35" strokeWidth="1" />
      </svg>
      <span
        className="relative font-serif font-medium"
        style={{ color: fg, fontSize: size * 0.4, letterSpacing: "-0.02em" }}
      >
        {initials(name)}
      </span>
    </span>
  );
}
