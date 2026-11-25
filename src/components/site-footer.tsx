import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { Squiggle } from "@/components/sketch/doodles";
import { isSupabaseConfigured } from "@/lib/config";
import { TAGS } from "@/lib/tags";

const CONVERGENT_URL = "https://convergent-web.vercel.app";

type FooterLink = { href: string; label: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Browse",
    links: [
      { href: "/#feed", label: "For you" },
      { href: "/?tab=latest#feed", label: "Latest" },
      { href: "/?tab=top#feed", label: "Most copied" },
      { href: "/tags", label: "All tags" },
    ],
  },
  {
    title: "Tags",
    links: TAGS.slice(0, 5).map((t) => ({ href: `/tag/${t.slug}`, label: t.label })),
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Create account" },
      { href: "/login", label: "Log in" },
      { href: "/new", label: "New post" },
    ],
  },
  {
    title: "Claudemotion",
    links: [
      { href: "/about", label: "About us" },
      { href: CONVERGENT_URL, label: "Convergent", external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-32 overflow-hidden bg-night text-paper">
      <div className="mx-auto max-w-[1440px] px-4 pt-20 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <LogoMark className="size-10 text-paper" />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-paper/60">
              Motion pieces made with code, posted with a still, the prompt, the model that wrote the code and the
              person who wrote the prompt.
            </p>
            <Squiggle className="mt-8 w-40 text-clay" />
          </div>
          {columns.map((col) => (
            <nav key={col.title} className="md:col-span-2" aria-label={col.title}>
              <p className="eyebrow !text-paper/40">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener"
                        className="link-underline text-[15px] text-paper/80 hover:text-paper"
                      >
                        {l.label} ↗
                      </a>
                    ) : (
                      <Link href={l.href} className="link-underline text-[15px] text-paper/80 hover:text-paper">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="sd-drift pointer-events-none mt-16 select-none" style={{ "--drift": "40px" } as React.CSSProperties}>
        <p
          aria-hidden
          className="text-center font-serif leading-[0.78] font-medium tracking-[-0.05em] whitespace-nowrap text-paper/[0.07]"
          style={{ fontSize: "clamp(3.4rem, 15vw, 16rem)" }}
        >
          Claude<span className="italic">motion</span>
        </p>
      </div>

      <div className="relative border-t border-night-line">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 text-[13px] text-paper/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>
            © {2026} Claudemotion · A project by{" "}
            <a href={CONVERGENT_URL} target="_blank" rel="noopener" className="text-paper/70 underline-offset-4 hover:text-paper hover:underline">
              Convergent
            </a>
          </p>
          {!isSupabaseConfigured && <p>Showing demo posts. Accounts and uploads switch on once Supabase is connected.</p>}
        </div>
      </div>
    </footer>
  );
}
