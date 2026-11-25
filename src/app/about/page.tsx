import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, SplitText } from "@/components/motion";
import { Underline } from "@/components/sketch/doodles";
import { PromptToImage } from "@/components/sketch/illustrations";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About us",
  description: "Claudemotion is made by Convergent.",
};

const CONVERGENT_URL = "https://convergent-web.vercel.app";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-16">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal y={10}>
            <p className="eyebrow">About us</p>
          </Reveal>
          <h1 className="mt-5 font-serif text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.045em] text-ink">
            <SplitText text="Made by" trigger="mount" className="block" />
            <span className="relative inline-block">
              <SplitText text="Convergent" trigger="mount" delay={0.15} wordClassName="italic font-light pr-[0.06em]" />
              <span className="absolute -bottom-[0.06em] left-0 w-full text-clay">
                <Underline trigger="mount" delay={0.8} strokeWidth={4} />
              </span>
            </span>
          </h1>

          <Reveal delay={0.3} className="mt-12 max-w-[36rem] space-y-5 text-[18px] leading-relaxed text-ink-2">
            <p>
              Claudemotion is a project by Convergent. It collects motion pieces made with code and keeps each one
              together with the prompt behind it, the model that wrote the code, and the person who wrote the prompt.
            </p>
            <p>
              Anyone can browse and copy prompts. With an account you can post your own clips, pick the frame that
              becomes their photo, and see how often people copy your prompts.
            </p>
          </Reveal>

          <Reveal delay={0.4} className="mt-10 flex flex-wrap items-center gap-3">
            <a href={CONVERGENT_URL} target="_blank" rel="noopener" className="btn btn-primary group">
              Visit Convergent
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <Link href="/#feed" className="btn btn-outline">
              Browse the feed
            </Link>
          </Reveal>
          <Reveal delay={0.45} className="mt-4">
            <a href={CONVERGENT_URL} target="_blank" rel="noopener" className="font-mono text-[12.5px] text-ink-3 hover:text-ink">
              convergent-web.vercel.app
            </a>
          </Reveal>
        </div>

        <div className="relative hidden min-h-[520px] overflow-hidden rounded-[28px] bg-paper-2 lg:col-span-5 lg:block">
          <div className="absolute inset-0 grid place-items-center p-12">
            <PromptToImage className="aspect-[420/400] w-full max-w-[420px]" />
          </div>
          <p className="absolute right-8 bottom-7 left-8 font-hand text-[24px] leading-tight text-ink-2">
            a Convergent project.
          </p>
        </div>
      </div>
    </div>
  );
}
