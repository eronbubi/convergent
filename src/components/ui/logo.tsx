import Link from "next/link";

/** The mark: a motion path that loops once and lands on a clay dot. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M4.5 22.5c2.6-6.4 6.2-11.2 10.9-11.6 3.9-.3 5.6 3.5 3 5.6-2.7 2.2-6.4-.4-4.6-3.8 1.6-3 6.1-4.9 9.9-4.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26.6" cy="8.2" r="2.7" fill="var(--clay)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 text-ink ${className}`}
      aria-label="Claudemotion, home"
    >
      <LogoMark className="size-7 transition-transform duration-500 ease-out-expo group-hover:-rotate-12" />
      <span className="font-serif text-[22px] leading-none font-medium tracking-[-0.02em]">
        Claude<span className="italic">motion</span>
      </span>
    </Link>
  );
}
