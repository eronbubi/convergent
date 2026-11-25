export type TagDef = { slug: string; label: string; tone: Tone };

export type Tone = "clay" | "sky" | "olive" | "fig" | "kraft" | "ink";

/** Curated tags offered in the upload form and the tag index. Custom tags are allowed too. */
export const TAGS: TagDef[] = [
  { slug: "motion-graphics", label: "Motion Graphics", tone: "clay" },
  { slug: "editing", label: "Editing", tone: "sky" },
  { slug: "3d", label: "3D", tone: "olive" },
  { slug: "typography", label: "Typography", tone: "ink" },
  { slug: "vfx", label: "VFX", tone: "fig" },
  { slug: "animation", label: "Animation", tone: "kraft" },
  { slug: "abstract", label: "Abstract", tone: "clay" },
  { slug: "generative", label: "Generative", tone: "sky" },
  { slug: "shaders", label: "Shaders", tone: "olive" },
  { slug: "particles", label: "Particles", tone: "kraft" },
  { slug: "product", label: "Product", tone: "fig" },
  { slug: "architecture", label: "Architecture", tone: "ink" },
];

const bySlug = new Map(TAGS.map((t) => [t.slug, t]));

export function slugifyTag(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function tagLabel(slug: string): string {
  const known = bySlug.get(slug);
  if (known) return known.label;
  return slug
    .split("-")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

const tones: Tone[] = ["clay", "sky", "olive", "fig", "kraft"];

export function tagTone(slug: string): Tone {
  const known = bySlug.get(slug);
  if (known) return known.tone;
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return tones[Math.abs(h) % tones.length];
}

export const TAG_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
