"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPost } from "@/app/actions/posts";
import { Draw } from "@/components/sketch/draw";
import { Tick } from "@/components/sketch/doodles";
import { CloseIcon, PlusIcon, UploadIcon } from "@/components/ui/icons";
import { ACCEPT, captureStill, extOf, formatBytes, readClip, uploadWithProgress } from "@/components/upload/media-utils";
import { StillPicker, type PickedClip } from "@/components/upload/still-picker";
import { SuggestInput } from "@/components/upload/suggest-input";
import { isSupabaseConfigured, MAX_UPLOAD_BYTES, MEDIA_BUCKET } from "@/lib/config";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { slugifyTag, tagLabel, TAGS } from "@/lib/tags";

type Errors = Partial<Record<"media" | "title" | "prompt" | "model" | "engineer" | "tags", string>>;

type Phase = { step: "idle" } | { step: "uploading"; progress: number } | { step: "saving" } | { step: "done" };

const MAX_TAGS = 6;
const MAX_SECONDS = 180;

export function UploadForm({ viewer, sketch }: { viewer: { id: string; username: string }; sketch: string[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [clip, setClip] = useState<PickedClip | null>(null);
  const [stillTime, setStillTime] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("");
  const [recommended, setRecommended] = useState<string[]>([]);
  const [engineer, setEngineer] = useState(`@${viewer.username}`);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [knownModels, setKnownModels] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ step: "idle" });

  // Suggestions come only from models people have already typed on the site.
  useEffect(() => {
    fetch("/api/models")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: string[]) => setKnownModels(list))
      .catch(() => {});
  }, []);

  useEffect(
    () => () => {
      if (clip) URL.revokeObjectURL(clip.url);
    },
    [clip],
  );

  const choose = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setErrors((e) => ({ ...e, media: "Use an MP4, WebM or MOV clip." }));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrors((e) => ({ ...e, media: `That clip is ${formatBytes(file.size)}. The limit is 50 MB.` }));
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const info = await readClip(url);
      if (info.duration > MAX_SECONDS) throw new Error("Clips can be up to 3 minutes long.");
      setClip({ file, url, ...info });
      setStillTime(Math.min(info.duration * 0.35, Math.max(info.duration - 0.1, 0)));
      setErrors((e) => ({ ...e, media: undefined }));
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 80));
    } catch (err) {
      URL.revokeObjectURL(url);
      setErrors((e) => ({ ...e, media: err instanceof Error ? err.message : "Couldn’t read that clip." }));
    }
  };

  const toggleTag = (slug: string) => {
    setTags((t) => (t.includes(slug) ? t.filter((x) => x !== slug) : t.length < MAX_TAGS ? [...t, slug] : t));
    setErrors((e) => ({ ...e, tags: undefined }));
  };

  const addCustomTag = () => {
    const slug = slugifyTag(customTag);
    if (slug.length >= 2 && !tags.includes(slug) && tags.length < MAX_TAGS) setTags((t) => [...t, slug]);
    setCustomTag("");
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!clip) e.media = "Add the clip.";
    if (!title.trim()) e.title = "Give it a title.";
    if (!prompt.trim()) e.prompt = "Paste the prompt you used.";
    if (!model.trim()) e.model = "Which model wrote the code?";
    if (!engineer.trim()) e.engineer = "Who wrote the prompt?";
    if (tags.length === 0) e.tags = "Pick at least one tag.";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const e = validate();
    setErrors(e);
    if (Object.values(e).some(Boolean) || !clip) {
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    if (!isSupabaseConfigured) {
      setFormError("Posting is switched off in demo mode. Connect Supabase to publish.");
      return;
    }

    const supabase = getBrowserSupabase();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setFormError("Your session ended. Log in again to post.");
      return;
    }

    const id = crypto.randomUUID();
    const mediaPath = `${viewer.id}/${id}.${extOf(clip.file)}`;
    const posterPath = `${viewer.id}/${id}-still.jpg`;
    const uploaded: string[] = [];

    try {
      setPhase({ step: "uploading", progress: 0 });
      const still = await captureStill(clip.url, stillTime);
      await uploadWithProgress(posterPath, still, "image/jpeg", token, () => {});
      uploaded.push(posterPath);
      await uploadWithProgress(mediaPath, clip.file, clip.file.type, token, (f) =>
        setPhase({ step: "uploading", progress: f }),
      );
      uploaded.push(mediaPath);

      setPhase({ step: "saving" });
      const res = await createPost({
        title,
        prompt,
        mediaPath,
        posterPath,
        durationSeconds: clip.duration || null,
        width: clip.width,
        height: clip.height,
        modelUsed: model,
        recommendedModels: recommended,
        promptEngineer: engineer,
        tags,
      });
      if (!res.ok) throw new Error(res.error);

      setPhase({ step: "done" });
      setTimeout(() => router.push(`/p/${res.id}`), 700);
    } catch (err) {
      if (uploaded.length) await supabase.storage.from(MEDIA_BUCKET).remove(uploaded);
      setPhase({ step: "idle" });
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  const busy = phase.step !== "idle";

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Clip and still */}
      <div className="lg:col-span-6">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              choose(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <AnimatePresence mode="wait" initial={false}>
            {!clip ? (
              <motion.button
                key="drop"
                type="button"
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  choose(e.dataTransfer.files?.[0]);
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: dragging ? 1.015 : 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                aria-invalid={Boolean(errors.media) || undefined}
                aria-describedby="media-hint"
                className={`relative grid aspect-[4/5] w-full place-items-center rounded-[22px] transition-colors duration-300 ${
                  dragging ? "bg-clay-soft/50 text-clay-deep" : "bg-paper-2 text-ink-2 hover:bg-paper-3/70"
                }`}
              >
                <Draw
                  d={sketch}
                  viewBox="0 0 400 500"
                  trigger="mount"
                  className={`pointer-events-none absolute inset-3 size-[calc(100%-24px)] ${errors.media ? "text-clay" : "text-line-strong"}`}
                  strokeWidth={1.6}
                  duration={1.2}
                />
                <span className="relative flex flex-col items-center px-8 text-center">
                  <span className="grid size-16 place-items-center rounded-full bg-card shadow-sm">
                    <UploadIcon className="size-7" />
                  </span>
                  <span className="mt-6 font-serif text-[28px] leading-tight tracking-[-0.02em] text-ink">Drop your clip</span>
                  <span className="mt-2 text-[15px] text-ink-3">
                    or <span className="text-ink underline underline-offset-4">choose a file</span>
                  </span>
                  <span className="mt-5 max-w-[17rem] text-[14px] leading-relaxed text-ink-3">
                    You’ll pick a frame from it next. That frame is the photo people see in the feed.
                  </span>
                  <span id="media-hint" className="mt-6 font-mono text-[11.5px] tracking-wide text-ink-3 uppercase">
                    MP4 · WebM · MOV — up to 50 MB, 3 min
                  </span>
                </span>
              </motion.button>
            ) : (
              <motion.div
                key={clip.url}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <StillPicker
                  clip={clip}
                  time={stillTime}
                  onTime={setStillTime}
                  progress={phase.step === "uploading" ? phase.progress : undefined}
                />
                <div className="mt-4 flex items-center justify-between gap-4 text-[14px] text-ink-3">
                  <span className="truncate">
                    {clip.width}×{clip.height} · {clip.duration.toFixed(1)} s · {formatBytes(clip.file.size)}
                  </span>
                  {!busy && (
                    <span className="flex shrink-0 gap-2">
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => fileInput.current?.click()}>
                        Replace
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm text-ink-3 hover:text-ink"
                        onClick={() => setClip(null)}
                        aria-label="Remove clip"
                      >
                        <CloseIcon className="size-4" />
                      </button>
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <FieldError id="media-error" text={errors.media} />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-8 lg:col-span-6">
        <Field label="Title" htmlFor="title" error={errors.title}>
          <input
            id="title"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
            aria-invalid={Boolean(errors.title) || undefined}
            placeholder="Liquid chrome ring"
          />
        </Field>

        <Field label="Prompt" htmlFor="prompt" error={errors.prompt} hint={<span className="tnum">{prompt.length} / 4000</span>}>
          <textarea
            id="prompt"
            value={prompt}
            maxLength={4000}
            rows={7}
            onChange={(e) => setPrompt(e.target.value)}
            className="field font-mono !text-[14px]"
            aria-invalid={Boolean(errors.prompt) || undefined}
            placeholder="The prompt that produced the code for this clip, exactly as you wrote it."
          />
        </Field>

        <Field label="Model used" htmlFor="model" error={errors.model}>
          <SuggestInput
            id="model"
            mode="single"
            value={model}
            onChange={setModel}
            suggestions={knownModels}
            placeholder="The model that wrote the code"
            invalid={Boolean(errors.model)}
          />
        </Field>

        <Field label="Recommended models" htmlFor="recommended" hint="Other models this prompt works well with. Press Enter after each.">
          <SuggestInput
            id="recommended"
            mode="multi"
            values={recommended}
            onValuesChange={setRecommended}
            suggestions={knownModels.filter((m) => m !== model)}
            placeholder="Add a model"
          />
        </Field>

        <Field
          label="Prompt engineer"
          htmlFor="engineer"
          error={errors.engineer}
          hint="Defaults to you. To credit someone else, type their @username or name."
        >
          <input
            id="engineer"
            value={engineer}
            maxLength={60}
            onChange={(e) => setEngineer(e.target.value)}
            className="field"
            aria-invalid={Boolean(errors.engineer) || undefined}
          />
        </Field>

        <fieldset aria-invalid={Boolean(errors.tags) || undefined}>
          <legend className="label">
            Tags <span className="font-normal text-ink-3">· up to {MAX_TAGS}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const on = tags.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(t.slug)}
                  className={`h-9 rounded-full border px-3.5 text-[14px] transition-colors duration-200 ${
                    on ? "border-ink bg-ink text-paper" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
            {tags
              .filter((t) => !TAGS.some((x) => x.slug === t))
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed
                  onClick={() => toggleTag(t)}
                  className="h-9 rounded-full border border-ink bg-ink px-3.5 text-[14px] text-paper"
                >
                  {tagLabel(t)} ×
                </button>
              ))}
          </div>
          <div className="mt-3 flex max-w-xs gap-2">
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              placeholder="Your own tag"
              aria-label="Add your own tag"
              className="field !h-10 !text-[14.5px]"
              disabled={tags.length >= MAX_TAGS}
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="btn btn-sm btn-outline !h-10"
              disabled={!customTag.trim() || tags.length >= MAX_TAGS}
              aria-label="Add tag"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
          <FieldError text={errors.tags} />
        </fieldset>

        <div className="border-t border-line pt-8">
          <AnimatePresence>
            {formError && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden text-[14.5px] text-clay-deep"
              >
                <span className="block pb-4">{formError}</span>
              </motion.p>
            )}
          </AnimatePresence>
          <button type="submit" disabled={busy} className="btn btn-clay h-12 w-full text-[16px] sm:w-auto sm:px-8">
            {phase.step === "idle" && "Publish post"}
            {phase.step === "uploading" && (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                Uploading {Math.round(phase.progress * 100)}%
              </>
            )}
            {phase.step === "saving" && "Saving…"}
            {phase.step === "done" && (
              <>
                <Tick className="size-5" /> Published
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="label">
          {label}
        </label>
        {hint && typeof hint !== "string" && <span className="text-[12.5px] text-ink-3">{hint}</span>}
      </div>
      {children}
      {typeof hint === "string" && !error && <p className="hint">{hint}</p>}
      <FieldError text={error} />
    </div>
  );
}

function FieldError({ text, id }: { text?: string; id?: string }) {
  return (
    <AnimatePresence initial={false}>
      {text && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden text-[13.5px] text-clay-deep"
        >
          <span className="block pt-1.5">{text}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}
