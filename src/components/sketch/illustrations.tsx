import { Draw } from "./draw";
import { sketchArrow, sketchCurve, sketchEllipse, sketchLine, sketchRect } from "./rough";

function scribble(x: number, y: number, w: number, seed: number): [number, number][] {
  const pts: [number, number][] = [];
  const steps = Math.max(4, Math.round(w / 22));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([x + t * w, y + Math.sin(t * Math.PI * 4 + seed) * 3.5]);
  }
  return pts;
}

/** Lines of a prompt turning into a picture. */
export function PromptToImage({ className, delay = 0.2 }: { className?: string; delay?: number }) {
  const d = [
    ...sketchRect(150, 40, 220, 180, 3, { roughness: 1.2 }),
    ...sketchEllipse(318, 92, 44, 44, 4),
    ...sketchCurve(
      [
        [160, 200],
        [205, 140],
        [245, 175],
        [290, 125],
        [360, 205],
      ],
      5,
      { roughness: 0.9 },
    ),
    ...sketchCurve(scribble(40, 290, 190, 1), 6, { roughness: 0.6 }),
    ...sketchCurve(scribble(40, 322, 230, 2), 7, { roughness: 0.6 }),
    ...sketchCurve(scribble(40, 354, 140, 3), 8, { roughness: 0.6 }),
    ...sketchLine(194, 340, 194, 368, 9, { roughness: 0.4 }),
    ...sketchArrow([246, 292], [196, 234], 26, 10, 13),
  ];
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg viewBox="0 0 420 400" className="absolute inset-0 size-full" aria-hidden>
        <path
          d="M140 70c30-38 110-52 170-34s92 70 78 128-70 86-140 82-120-28-130-80 0-60 22-96Z"
          fill="var(--clay-soft)"
          opacity="0.85"
        />
        <circle cx="318" cy="92" r="20" fill="var(--clay)" opacity="0.9" />
      </svg>
      <Draw d={d} viewBox="0 0 420 400" trigger="mount" delay={delay} duration={0.55} overlap={0.45} strokeWidth={2.4} className="relative size-full text-ink" />
    </div>
  );
}

/** An envelope with a little flight trail. */
export function Envelope({ className, delay = 0.2, checked = false }: { className?: string; delay?: number; checked?: boolean }) {
  const d = [
    ...sketchRect(70, 100, 230, 150, 21, { roughness: 1.1 }),
    ...sketchCurve(
      [
        [72, 103],
        [185, 185],
        [298, 103],
      ],
      22,
      { roughness: 0.7 },
    ),
    ...sketchLine(74, 246, 160, 178, 23),
    ...sketchLine(296, 246, 212, 178, 24),
    ...sketchCurve(
      [
        [10, 70],
        [30, 40],
        [52, 64],
        [36, 86],
        [22, 60],
        [60, 30],
      ],
      25,
      { roughness: 0.6 },
    ),
    ...(checked
      ? [
          ...sketchEllipse(300, 100, 70, 70, 26, { roughness: 1.2 }),
          ...sketchCurve(
            [
              [284, 101],
              [296, 113],
              [318, 86],
            ],
            27,
            { roughness: 0.4, strokeWidth: 3 },
          ),
        ]
      : []),
  ];
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg viewBox="0 0 360 280" className="absolute inset-0 size-full" aria-hidden>
        <path d="M90 120h220v150H90z" fill="var(--kraft-soft)" transform="rotate(-2 200 195)" />
        {checked && <circle cx="300" cy="100" r="33" fill="var(--olive-soft)" />}
      </svg>
      <Draw d={d} viewBox="0 0 360 280" trigger="mount" delay={delay} duration={0.55} overlap={0.4} strokeWidth={2.4} className="relative size-full text-ink" />
    </div>
  );
}
