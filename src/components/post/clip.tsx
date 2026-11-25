"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/components/hooks";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import type { Post } from "@/lib/types";

type ClipPost = Pick<Post, "mediaUrl" | "posterUrl" | "width" | "height" | "title">;

type Props = {
  post: ClipPost;
  /** "cover" fills a fixed-ratio box; "natural" keeps the clip's own ratio. */
  fit?: "cover" | "natural";
  sizes: string;
  priority?: boolean;
  /**
   * preview: the still shows; the clip plays while hovered (mouse) or while mostly on screen (touch).
   * autoplay: plays while on screen.
   * player: plays while on screen and shows playback controls.
   */
  mode?: "preview" | "autoplay" | "player";
  /** Hover state from the surrounding card (preview mode, mouse). */
  hovered?: boolean;
  /** Explicit pause from a control outside this component. */
  paused?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  className?: string;
};

/** A still taken from the clip, with the clip itself layered on top while it plays. */
export function Clip({
  post,
  fit = "cover",
  sizes,
  priority,
  mode = "preview",
  hovered = false,
  paused = false,
  onPlayingChange,
  className = "",
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduce = usePrefersReducedMotion();
  const mouse = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  // null: play automatically; true/false: the viewer pressed play/pause.
  const [manual, setManual] = useState<boolean | null>(null);

  const watchesViewport = !reduce && (mode !== "preview" || !mouse);

  useEffect(() => {
    const el = box.current;
    if (!el || !watchesViewport) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.intersectionRatio >= 0.55;
        setInView(visible);
        if (visible) setActivated(true);
      },
      { threshold: [0, 0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [watchesViewport]);

  const auto = (mode === "preview" && mouse && hovered) || (watchesViewport && inView);
  const wantsPlay = !paused && (manual ?? auto);
  const mounted = activated || (mode === "preview" && mouse && hovered);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (wantsPlay) v.play().catch(() => {});
    else v.pause();
  }, [wantsPlay, mounted]);

  const report = (p: boolean) => {
    setPlaying(p);
    onPlayingChange?.(p);
  };

  const still = (
    <Image
      src={post.posterUrl}
      alt={post.title}
      {...(fit === "cover" ? { fill: true } : { width: post.width, height: post.height })}
      sizes={sizes}
      priority={priority}
      onLoad={() => setLoaded(true)}
      className={`${fit === "cover" ? "object-cover" : "h-auto w-full"} transition-[opacity,scale] duration-700 ease-out-expo ${
        loaded ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );

  return (
    <div ref={box} className={fit === "cover" ? "absolute inset-0" : "relative"}>
      {still}
      {mounted && (
        <video
          ref={video}
          src={post.mediaUrl}
          muted
          loop
          playsInline
          preload="auto"
          width={post.width}
          height={post.height}
          aria-hidden
          tabIndex={-1}
          onPlaying={() => report(true)}
          onPause={() => report(false)}
          className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-500 ${
            playing ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
      {mode === "player" && (
        <PlayerControls
          video={video}
          onSeek={(to) => {
            const v = video.current;
            if (v && v.duration) v.currentTime = Math.min(Math.max(to(v.currentTime, v.duration), 0), v.duration);
          }}
          playing={playing}
          onToggle={() => {
            setActivated(true);
            setManual(!playing);
          }}
        />
      )}
    </div>
  );
}

function PlayerControls({
  video,
  onSeek,
  playing,
  onToggle,
}: {
  video: React.RefObject<HTMLVideoElement | null>;
  /** Receives a function mapping (current time, duration) to the new time. */
  onSeek: (to: (current: number, duration: number) => number) => void;
  playing: boolean;
  onToggle: () => void;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState({ current: 0, duration: 0 });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = video.current;
      if (v && bar.current && v.duration) {
        bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
        setTime((t) =>
          Math.floor(t.current) === Math.floor(v.currentTime) && t.duration === v.duration
            ? t
            : { current: v.currentTime, duration: v.duration },
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [video]);

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    onSeek((_, duration) => f * duration);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-3 rounded-full bg-night/55 py-1.5 pr-4 pl-1.5 text-paper backdrop-blur-md">
      <button
        type="button"
        onClick={onToggle}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-paper/15 transition-colors hover:bg-paper/25"
        aria-label={playing ? "Pause clip" : "Play clip"}
      >
        {playing ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
      </button>
      <div
        className="relative h-6 flex-1 cursor-pointer"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          seek(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) seek(e);
        }}
        role="slider"
        aria-label="Clip position"
        aria-valuemin={0}
        aria-valuemax={Math.round(time.duration)}
        aria-valuenow={Math.round(time.current)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onSeek((t) => t + 1);
          if (e.key === "ArrowLeft") onSeek((t) => t - 1);
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-paper/25">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-paper" />
        </div>
      </div>
      <span className="font-mono text-[11px] text-paper/80 tnum">
        {fmt(time.current)} / {fmt(time.duration)}
      </span>
    </div>
  );
}
