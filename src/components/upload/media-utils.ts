"use client";

import { MEDIA_BUCKET, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/config";

export const ACCEPT = "video/mp4,video/webm,video/quicktime";

export function extOf(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type === "video/quicktime" ? "mov" : (file.type.split("/")[1] ?? "mp4");
}

function loadVideo(url: string): Promise<HTMLVideoElement> {
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.src = url;
  return new Promise((resolve, reject) => {
    v.onloadeddata = () => resolve(v);
    v.onerror = () => reject(new Error("This video can’t be played in the browser. Try MP4 (H.264) or WebM."));
  });
}

function seek(v: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    v.onseeked = () => resolve();
    v.currentTime = Math.min(Math.max(time, 0), Math.max(v.duration - 0.05, 0));
  });
}

/** Pixel size and length of a clip. */
export async function readClip(url: string): Promise<{ width: number; height: number; duration: number }> {
  const v = await loadVideo(url);
  return { width: v.videoWidth, height: v.videoHeight, duration: v.duration };
}

/** Evenly spaced thumbnails along the clip, for the still picker. */
export async function filmstrip(url: string, count: number, height = 64): Promise<string[]> {
  const v = await loadVideo(url);
  const canvas = document.createElement("canvas");
  canvas.height = height;
  canvas.width = Math.round((v.videoWidth / v.videoHeight) * height);
  const ctx = canvas.getContext("2d");
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    await seek(v, ((i + 0.5) / count) * v.duration);
    ctx?.drawImage(v, 0, 0, canvas.width, canvas.height);
    out.push(canvas.toDataURL("image/jpeg", 0.7));
  }
  v.removeAttribute("src");
  v.load();
  return out;
}

/** The frame at `time` as a JPEG, at most 1600 px on the long edge. This becomes the post's photo. */
export async function captureStill(url: string, time: number): Promise<Blob> {
  const v = await loadVideo(url);
  await seek(v, time);
  const scale = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(v.videoWidth * scale);
  canvas.height = Math.round(v.videoHeight * scale);
  canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.88));
  v.removeAttribute("src");
  v.load();
  if (!blob) throw new Error("Couldn’t take the still from this clip.");
  return blob;
}

/** Uploads straight to Supabase Storage with real progress events. */
export function uploadWithProgress(
  path: string,
  body: Blob,
  contentType: string,
  accessToken: string,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const encoded = path.split("/").map(encodeURIComponent).join("/");
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${encoded}`);
    xhr.setRequestHeader("authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader("content-type", contentType);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        let msg = "Upload failed.";
        try {
          msg = JSON.parse(xhr.responseText).message ?? msg;
        } catch {
          /* not JSON */
        }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(body);
  });
}

export function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
}
