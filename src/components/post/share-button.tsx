"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [done, setDone] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      /* no clipboard */
    }
  };

  return (
    <button type="button" onClick={share} className="btn btn-sm btn-outline">
      {done ? "Link copied" : "Share"}
    </button>
  );
}
