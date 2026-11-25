import Link from "next/link";
import { Draw } from "@/components/sketch/draw";
import { sketchCurve, sketchRect } from "@/components/sketch/rough";

export default function NotFound() {
  // An empty frame with a loose scribble where the picture should be.
  const d = [
    ...sketchRect(20, 20, 260, 200, 4, { roughness: 1.4 }),
    ...sketchCurve(
      [
        [70, 150],
        [110, 90],
        [150, 140],
        [190, 80],
        [230, 150],
      ],
      7,
      { roughness: 1 },
    ),
  ];

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col items-center px-4 pt-20 pb-10 text-center sm:px-6">
      <Draw d={d} viewBox="0 0 300 240" trigger="mount" className="w-56 text-clay" strokeWidth={2.2} />
      <p className="eyebrow mt-10">404</p>
      <h1 className="mt-3 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-tight tracking-[-0.03em]">
        This page doesn’t exist
      </h1>
      <p className="mt-3 max-w-md text-ink-2">The post may have been deleted, or the link has a typo.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to the feed
      </Link>
    </div>
  );
}
