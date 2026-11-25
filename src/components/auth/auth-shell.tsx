import type { ReactNode } from "react";
import { Reveal } from "@/components/motion";
import { isSupabaseConfigured } from "@/lib/config";

/** Two-column layout for account pages: the form on the left, a drawing on the right. */
export function AuthShell({
  title,
  intro,
  art,
  caption,
  children,
}: {
  title: string;
  intro?: ReactNode;
  art: ReactNode;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-8 pb-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:pt-14">
      <div className="flex flex-col justify-center lg:py-10">
        <div className="w-full max-w-[440px]">
          <Reveal y={16}>
            <h1 className="font-serif text-[clamp(2.6rem,4.6vw,4rem)] leading-[1] tracking-[-0.035em] text-ink text-balance">
              {title}
            </h1>
            {intro && <div className="mt-4 text-[16.5px] leading-relaxed text-ink-2">{intro}</div>}
          </Reveal>
          {!isSupabaseConfigured && (
            <Reveal delay={0.05} className="mt-6 rounded-xl border border-kraft/50 bg-kraft-soft/60 px-4 py-3 text-[14px] text-[#6d4b25]">
              Demo mode: accounts switch on once Supabase is connected. See SETUP.md in the repository.
            </Reveal>
          )}
          <Reveal delay={0.1} className="mt-8">
            {children}
          </Reveal>
        </div>
      </div>

      <div className="relative hidden min-h-[640px] overflow-hidden rounded-[28px] bg-paper-2 lg:block">
        <div className="absolute inset-0 grid place-items-center p-14">{art}</div>
        {caption && (
          <p className="absolute right-8 bottom-7 left-8 font-hand text-[24px] leading-tight text-ink-2">{caption}</p>
        )}
      </div>
    </div>
  );
}
