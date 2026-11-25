import { Draw } from "./draw";
import { sketchArrow, sketchCurve, sketchEllipse, sketchLine } from "./rough";

type Common = {
  className?: string;
  delay?: number;
  trigger?: "view" | "mount";
  strokeWidth?: number;
  seed?: number;
};

/** A loose brush-pen underline, wider than tall. */
export function Underline({ className, delay = 0, trigger, strokeWidth = 3, seed = 3 }: Common) {
  const d = [
    ...sketchCurve(
      [
        [4, 13],
        [60, 7],
        [130, 6],
        [196, 10],
      ],
      seed,
      { roughness: 0.6, bowing: 0.8 },
    ),
    ...sketchCurve(
      [
        [30, 17],
        [100, 13],
        [170, 15],
      ],
      seed + 4,
      { roughness: 0.6, bowing: 0.6 },
    ),
  ];
  return (
    <Draw
      d={d}
      viewBox="0 0 200 22"
      className={className}
      delay={delay}
      trigger={trigger}
      strokeWidth={strokeWidth}
      duration={0.6}
      overlap={0.2}
      stretch
      style={{ width: "100%", height: "0.16em" }}
    />
  );
}

/** An oval drawn around a word, slightly overshooting where it closes. */
export function CircleMark({ className, delay = 0, trigger, strokeWidth = 2.2, seed = 5 }: Common) {
  const d = sketchEllipse(100, 30, 192, 52, seed, { roughness: 1.3, bowing: 2 });
  return (
    <Draw
      d={d}
      viewBox="0 0 200 60"
      className={className}
      delay={delay}
      trigger={trigger}
      strokeWidth={strokeWidth}
      duration={0.8}
    />
  );
}

/** Curved arrow inside a box of the given size. Coordinates are in that box. */
export function Arrow({
  from,
  to,
  bend = 24,
  width,
  height,
  className,
  delay = 0,
  trigger,
  strokeWidth = 1.8,
  seed = 9,
}: Common & {
  from: [number, number];
  to: [number, number];
  bend?: number;
  width: number;
  height: number;
}) {
  return (
    <Draw
      d={sketchArrow(from, to, bend, seed)}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      delay={delay}
      trigger={trigger}
      strokeWidth={strokeWidth}
      duration={0.55}
      overlap={0.1}
    />
  );
}

/** A small four-point spark. */
export function Spark({ className, delay = 0, trigger, strokeWidth = 2, seed = 2 }: Common) {
  const d = [
    ...sketchLine(20, 2, 20, 38, seed, { roughness: 0.7 }),
    ...sketchLine(2, 20, 38, 20, seed + 1, { roughness: 0.7 }),
    ...sketchLine(9, 9, 31, 31, seed + 2, { roughness: 0.6 }),
    ...sketchLine(31, 9, 9, 31, seed + 3, { roughness: 0.6 }),
  ];
  return (
    <Draw
      d={d}
      viewBox="0 0 40 40"
      className={className}
      delay={delay}
      trigger={trigger}
      strokeWidth={strokeWidth}
      duration={0.3}
      overlap={0.4}
    />
  );
}

/** A wandering line, used as a section divider. */
export function Squiggle({ className, delay = 0, trigger, strokeWidth = 2, seed = 11 }: Common) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    pts.push([i * 25, 12 + Math.sin(i * 1.3) * 7 + (i % 2 ? 2 : -2)]);
  }
  return (
    <Draw
      d={sketchCurve(pts, seed, { roughness: 0.7, bowing: 0.5 })}
      viewBox="0 0 300 24"
      className={className}
      delay={delay}
      trigger={trigger}
      strokeWidth={strokeWidth}
      duration={1.1}
    />
  );
}

/** A tick, for confirmations. */
export function Tick({ className, delay = 0, trigger = "mount", strokeWidth = 2.4, seed = 4 }: Common) {
  const d = sketchCurve(
    [
      [4, 15],
      [10, 21],
      [14, 24],
      [28, 6],
    ],
    seed,
    { roughness: 0.5, bowing: 0.3 },
  );
  return (
    <Draw
      d={d}
      viewBox="0 0 32 30"
      className={className}
      delay={delay}
      trigger={trigger}
      strokeWidth={strokeWidth}
      duration={0.35}
    />
  );
}
