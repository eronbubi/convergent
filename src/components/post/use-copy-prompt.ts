"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const storageKey = (id: string) => `aim:copied:${id}`;

function readCopied(id: string) {
  try {
    return localStorage.getItem(storageKey(id)) === "1";
  } catch {
    return false;
  }
}

function markCopied(id: string) {
  try {
    localStorage.setItem(storageKey(id), "1");
  } catch {
    /* private mode */
  }
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without async clipboard permission.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/** Copies a prompt, counts it once per person/device, and keeps the shown count in sync. */
export function useCopyPrompt(postId: string, prompt: string, initialCount: number) {
  // Null until this visitor copies; then the optimistic or server-confirmed count.
  const [override, setOverride] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const count = override ?? initialCount;

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    const ok = await writeClipboard(prompt);
    if (!ok) return false;

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);

    if (!readCopied(postId)) {
      markCopied(postId);
      setOverride((o) => (o ?? initialCount) + 1);
      try {
        const res = await fetch("/api/copy", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        const data = (await res.json()) as { count: number | null };
        if (typeof data.count === "number") setOverride(data.count);
      } catch {
        /* keep the optimistic count */
      }
    }
    return true;
  }, [postId, prompt, initialCount]);

  return { copy, copied, count };
}
