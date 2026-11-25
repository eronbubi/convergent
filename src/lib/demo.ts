import type { Post, Profile } from "@/lib/types";

/**
 * Demo content shown until Supabase is connected. Media lives in public/demo.
 * Prompts and model names are illustrative examples.
 */
export const DEMO_PROFILES: Profile[] = [
  { id: "demo-u1", username: "mara.ito", displayName: "Mara Ito", bio: "Motion designer. Mostly loops, sometimes type.", createdAt: "2026-03-02T10:00:00Z" },
  { id: "demo-u2", username: "jonas.feld", displayName: "Jonas Feld", bio: "3D and product renders. Studio light nerd.", createdAt: "2026-04-11T10:00:00Z" },
  { id: "demo-u3", username: "noor.haddad", displayName: "Noor Haddad", bio: "Editor and colourist. Writes prompts like shot lists.", createdAt: "2026-05-20T10:00:00Z" },
  { id: "demo-u4", username: "theo.lind", displayName: "Theo Lindqvist", bio: "Architecture visualisation, concrete and shadows.", createdAt: "2026-06-08T10:00:00Z" },
  { id: "demo-u5", username: "ada.reyes", displayName: "Ada Reyes", bio: "Illustration and print textures.", createdAt: "2026-07-15T10:00:00Z" },
];

type Entry = {
  slug: string;
  file: string;
  /** Poster image for clips. */
  poster?: string;
  width: number;
  height: number;
  title: string;
  prompt: string;
  model: string;
  recommended: string[];
  /** Username of the prompt engineer. */
  engineer: string;
  author: string;
  tags: string[];
  copies: number;
  date: string;
};

const ENTRIES: Entry[] = [
  {
    slug: "chrome-ring",
    file: "chrome-ring.jpg",
    width: 1120,
    height: 1400,
    title: "Liquid chrome ring",
    prompt:
      "A molten liquid-chrome ring hovering above a seamless peach studio sweep, the surface still rippling as if just poured. Mirror reflections of a large softbox and a dark ceiling, two polished steel spheres and one matte peach sphere resting on the floor, soft contact shadows, 85mm product photography, f/8, subtle film grain --ar 4:5 --style raw --v 7",
    model: "Midjourney v7",
    recommended: ["FLUX.2 Pro", "Imagen 4", "Seedream 4.0"],
    engineer: "jonas.feld",
    author: "jonas.feld",
    tags: ["3d", "abstract", "product"],
    copies: 1204,
    date: "2026-11-21T15:20:00Z",
  },
  {
    slug: "glass-torus",
    file: "glass-torus.jpg",
    width: 1400,
    height: 1400,
    title: "Soap-film torus, terracotta column",
    prompt:
      "Still life on warm sand-coloured paper: a large transparent torus with thin-film iridescence like a soap bubble, refracting the background, next to a matte terracotta cylinder and a small white sphere. Low late-afternoon sun from the right casting long soft shadows with a caustic ring. Minimal, quiet, editorial set design, medium format, 1:1",
    model: "FLUX.2 Pro",
    recommended: ["Midjourney v7", "Nano Banana Pro"],
    engineer: "jonas.feld",
    author: "mara.ito",
    tags: ["3d", "abstract"],
    copies: 642,
    date: "2026-11-18T09:05:00Z",
  },
  {
    slug: "silk-flow",
    file: "silk-flow.jpg",
    width: 1050,
    height: 1400,
    title: "Teal silk, folded light",
    prompt:
      "Extreme close-up of heavy teal silk folding over itself, deep shadows pooling into rust-red undertones, soft top light skimming the ridges, no visible edges or background, macro lens, shallow depth of field, rich satin sheen, abstract texture study, 3:4",
    model: "Imagen 4",
    recommended: ["Midjourney v7", "Reve Image"],
    engineer: "mara.ito",
    author: "noor.haddad",
    tags: ["abstract", "motion-graphics"],
    copies: 388,
    date: "2026-11-23T19:40:00Z",
  },
  {
    slug: "elevation-study",
    file: "contour-poster.jpg",
    width: 1050,
    height: 1400,
    title: "Elevation Study No. 07",
    prompt:
      "Two-colour risograph poster titled \"Elevation Study\" in a bold orange serif at the top left, small caption \"No. 07\" and \"Contour interval 40 m\". The body is a topographic map of a mountain ridge drawn with fine blue hatching and orange contour lines, slight misregistration between the two inks, off-white uncoated paper with visible grain, scale bar and \"0 – 2,400 m\" in the footer",
    model: "Ideogram 3.0",
    recommended: ["GPT Image 1.5", "Recraft V3"],
    engineer: "ada.reyes",
    author: "ada.reyes",
    tags: ["typography", "illustration"],
    copies: 917,
    date: "2026-11-15T11:30:00Z",
  },
];

const byUsername = new Map(DEMO_PROFILES.map((p) => [p.username, p]));

export const DEMO_POSTS: Post[] = ENTRIES.map((e) => {
  const author = byUsername.get(e.author)!;
  const engineer = byUsername.get(e.engineer);
  return {
    id: `demo-${e.slug}`,
    title: e.title,
    prompt: e.prompt,
    mediaUrl: `/demo/${e.file}`,
    posterUrl: `/demo/${e.poster ?? e.file}`,
    width: e.width,
    height: e.height,
    modelUsed: e.model,
    recommendedModels: e.recommended,
    promptEngineer: engineer ? `@${engineer.username}` : e.engineer,
    engineerUsername: engineer?.username ?? null,
    tags: e.tags,
    copyCount: e.copies,
    createdAt: e.date,
    authorId: author.id,
    authorUsername: author.username,
    authorDisplayName: author.displayName,
  };
});
