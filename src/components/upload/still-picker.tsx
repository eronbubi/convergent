"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { filmstrip, formatTime } from "@/components/upload/media-utils";

export type PickedClip = { file: File; url: string; width: number; height: number; duration: number };

const FRAMES = 12;

/**
 * Shows the clip and a film strip underneath. Dragging along the strip picks the frame
 * that becomes the post's photo.
 */
export function StillPicker({
  clip,
  time,
  onTime,
  progress,
}: {
  clip: PickedClip;
  time: number;
  onTime: (t: number) => void;
  /** Upload progress 0–1, shown as a bar under the clip. */
  progress?: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    let live = true;
    filmstrip(clip.url, FRAMES)
      .then((t) => live && setThumbs(t))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [clip.url]);

  // Show the chosen frame whenever the selection moves.
  useEffect(() => {
    const v = video.current;
    if (v && v.paused) v.currentTime = time;
  }, [time]);

  const togglePreview = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = time;
    }
  };

  const pct = clip.duration ? (time / clip.duration) * 100 : 0;

  return (
    <div>
      <div className="relative overflow-hidden rounded-[22px] bg-night">
        <video
          ref={video}
          src={clip.url}
          muted
          playsInline
          loop
          preload="auto"
          width={clip.width}
          height={clip.height}
          onPlay={() => setPreviewing(true)}
          onPause={() => setPreviewing(false)}
          onLoadedData={(e) => (e.currentTarget.currentTime = time)}
          className="max-h-[62vh] w-full object-contain"
          aria-label="Clip preview"
        />
        <button
          type="button"
          onClick={togglePreview}
          className="absolute top-3 left-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-night/55 pr-3 pl-2.5 text-[12.5px] font-medium text-paper backdrop-blur-md hover:bg-night/75"
        >
          {previewing ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
          {previewing ? "Back to still" : "Play clip"}
        </button>
        {!previewing && (
          <span className="absolute top-3 right-3 rounded-full bg-card/90 px-3 py-1.5 font-mono text-[11.5px] text-ink backdrop-blur-md">
            Still at {formatTime(time)}
          </span>
        )}
        {progress !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-paper/20">
            <div className="h-full origin-left bg-clay transition-transform duration-200" style={{ transform: `scaleX(${progress})` }} />
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-2.5 flex items-baseline justify-between">
          <label htmlFor="still-time" className="label !mb-0">
            Photo
          </label>
          <span className="text-[13px] text-ink-3">Drag to pick the frame shown in the feed</span>
        </div>
        <div className="relative h-16 select-none">
          <div className="absolute inset-0 flex overflow-hidden rounded-xl bg-paper-3">
            {thumbs.length
              ? thumbs.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="h-full min-w-0 flex-1 object-cover opacity-80" draggable={false} />
                ))
              : Array.from({ length: FRAMES }, (_, i) => <span key={i} className="skeleton h-full flex-1" />)}
          </div>
          {/* Selected frame marker */}
          <div
            className="pointer-events-none absolute -top-1.5 -bottom-1.5 w-[3px] -translate-x-1/2 rounded-full bg-clay shadow-[0_0_0_3px_rgb(250_248_242/0.9)]"
            style={{ left: `${pct}%` }}
            aria-hidden
          />
          <input
            id="still-time"
            type="range"
            min={0}
            max={Math.max(clip.duration - 0.05, 0)}
            step={0.01}
            value={time}
            onChange={(e) => {
              video.current?.pause();
              onTime(Number(e.target.value));
            }}
            className="still-range absolute inset-0 size-full cursor-ew-resize"
            aria-valuetext={`Frame at ${formatTime(time)}`}
          />
        </div>
      </div>
    </div>
  );
}
