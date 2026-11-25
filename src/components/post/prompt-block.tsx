"use client";

import { AnimatePresence, motion } from "motion/react";
import { RollingNumber } from "@/components/post/rolling-number";
import { useCopyPrompt } from "@/components/post/use-copy-prompt";
import { Tick } from "@/components/sketch/doodles";
import { CopyIcon } from "@/components/ui/icons";

/** The prompt, with a copy button that also counts the copy. */
export function PromptBlock({ postId, prompt, copyCount }: { postId: string; prompt: string; copyCount: number }) {
  const { copy, copied, count } = useCopyPrompt(postId, prompt, copyCount);

  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="eyebrow">Prompt</span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-3">
          Copied <RollingNumber value={count} className="text-ink" /> {count === 1 ? "time" : "times"}
        </span>
      </div>
      <p className="px-5 py-5 font-mono text-[13.5px] leading-[1.8] whitespace-pre-wrap text-pretty text-ink selection:bg-clay-soft">
        {prompt}
      </p>
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={copy}
          className={`btn w-full ${copied ? "bg-olive-soft text-ink" : "btn-primary"}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="done"
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <Tick className="size-5 text-olive" strokeWidth={2.6} />
                Copied to clipboard
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <CopyIcon className="size-[18px]" />
                Copy prompt
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
