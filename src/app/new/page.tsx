import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SplitText } from "@/components/motion";
import { sketchRect } from "@/components/sketch/rough";
import { UploadForm } from "@/components/upload/upload-form";
import { isSupabaseConfigured } from "@/lib/config";
import { getViewer } from "@/lib/data";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-10 lg:pt-14">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.92] tracking-[-0.04em]">
          <SplitText text="New post" trigger="mount" />
        </h1>
        <p className="max-w-sm text-[15px] text-ink-3">
          Upload the clip, pick the frame that becomes its photo, then add the prompt and models. Anyone can copy the
          prompt.
        </p>
      </header>
      <Suspense fallback={<div className="skeleton h-[70vh] rounded-[22px]" />}>
        <Gate />
      </Suspense>
    </div>
  );
}

async function Gate() {
  const viewer = await getViewer();
  if (isSupabaseConfigured && !viewer) redirect("/login?next=/new");
  // A hand-drawn frame around the drop zone.
  const sketch = sketchRect(4, 4, 392, 492, 17, { roughness: 1.6, bowing: 2 });
  return <UploadForm viewer={viewer ?? { id: "demo", username: "you" }} sketch={sketch} />;
}
