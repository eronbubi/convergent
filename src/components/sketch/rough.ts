import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

/**
 * Deterministic hand-drawn strokes. Every helper returns plain SVG path strings
 * so they can be generated on the server and animated on the client.
 */
const gen = rough.generator();

const base: Options = {
  roughness: 1.1,
  bowing: 1.4,
  disableMultiStroke: true,
  preserveVertices: false,
  strokeWidth: 2,
  stroke: "currentColor",
};

function paths(drawable: ReturnType<typeof gen.line>): string[] {
  return gen
    .toPaths(drawable)
    .filter((p) => p.stroke && p.stroke !== "none")
    .map((p) => p.d);
}

export function sketchLine(x1: number, y1: number, x2: number, y2: number, seed = 1, opts: Options = {}) {
  return paths(gen.line(x1, y1, x2, y2, { ...base, seed, ...opts }));
}

export function sketchEllipse(cx: number, cy: number, w: number, h: number, seed = 1, opts: Options = {}) {
  return paths(gen.ellipse(cx, cy, w, h, { ...base, seed, curveStepCount: 14, ...opts }));
}

export function sketchCurve(points: [number, number][], seed = 1, opts: Options = {}) {
  return paths(gen.curve(points, { ...base, seed, ...opts }));
}

export function sketchRect(x: number, y: number, w: number, h: number, seed = 1, opts: Options = {}) {
  return paths(gen.rectangle(x, y, w, h, { ...base, seed, ...opts }));
}

/** A curved arrow from `from` to `to`, bending by `bend` (perpendicular offset, px). */
export function sketchArrow(
  from: [number, number],
  to: [number, number],
  bend = 30,
  seed = 1,
  head = 11,
): string[] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const c: [number, number] = [mx + nx * bend, my + ny * bend];

  const shaft = sketchCurve([from, c, to], seed, { roughness: 0.8 });

  // Arrow head follows the tangent at the end of the curve (from control point to tip).
  const tx = x2 - c[0];
  const ty = y2 - c[1];
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const spread = 0.5;
  const left: [number, number] = [
    x2 - head * (ux * Math.cos(spread) - uy * Math.sin(spread)),
    y2 - head * (uy * Math.cos(spread) + ux * Math.sin(spread)),
  ];
  const right: [number, number] = [
    x2 - head * (ux * Math.cos(-spread) - uy * Math.sin(-spread)),
    y2 - head * (uy * Math.cos(-spread) + ux * Math.sin(-spread)),
  ];
  return [
    ...shaft,
    ...sketchLine(left[0], left[1], x2, y2, seed + 7, { roughness: 0.5 }),
    ...sketchLine(right[0], right[1], x2, y2, seed + 13, { roughness: 0.5 }),
  ];
}
