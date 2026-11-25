import type { Post, Profile } from "@/lib/types";

/**
 * Demo content shown until Supabase is connected. Clips and stills live in public/demo
 * and were rendered from code (WebGL / canvas), like the posts the site is made for.
 */
export const DEMO_PROFILES: Profile[] = [
  { id: "demo-u1", username: "mara.ito", displayName: "Mara Ito", bio: "Motion designer. Loops, grids and type, all in code.", createdAt: "2026-03-02T10:00:00Z" },
  { id: "demo-u2", username: "jonas.feld", displayName: "Jonas Feld", bio: "Raymarched product shots. Studio light nerd.", createdAt: "2026-04-11T10:00:00Z" },
  { id: "demo-u3", username: "noor.haddad", displayName: "Noor Haddad", bio: "Editor and colourist. Writes prompts like shot lists.", createdAt: "2026-05-20T10:00:00Z" },
  { id: "demo-u4", username: "theo.lind", displayName: "Theo Lindqvist", bio: "Architecture in shaders: concrete, light, shadow.", createdAt: "2026-06-08T10:00:00Z" },
  { id: "demo-u5", username: "ada.reyes", displayName: "Ada Reyes", bio: "Generative print textures and maps.", createdAt: "2026-07-15T10:00:00Z" },
];

type Entry = {
  slug: string;
  /** Base file name in public/demo: `<name>.mp4` (clip) and `<name>.jpg` (still). */
  name: string;
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
    slug: "everything-flows",
    name: "kinetic-type",
    width: 800,
    height: 800,
    title: "Everything flows",
    prompt:
      "Build a 4-second seamless loop in a single HTML file with canvas: rows of heavy condensed sans-serif type on a cobalt background (#2235b8), alternating the words \"EVERYTHING\" and \"FLOWS\" with small orange dots between them. Each row scrolls sideways at its own speed, odd rows left, even rows right, and the row heights breathe so lines stretch tall and squash flat in a wave travelling down the frame. Off-white letters (#f3ecdf), no gaps between rows, square format, 30 fps, export-ready.",
    model: "Claude Opus 5.5",
    recommended: ["Claude Sonnet 5.5"],
    engineer: "mara.ito",
    author: "mara.ito",
    tags: ["typography", "motion-graphics", "animation"],
    copies: 2048,
    date: "2026-11-22T17:10:00Z",
  },
  {
    slug: "liquid-chrome-ring",
    name: "chrome-ring",
    width: 640,
    height: 800,
    title: "Liquid chrome ring",
    prompt:
      "Write a WebGL2 fragment shader that raymarches a liquid-chrome torus floating above a seamless peach studio sweep. Deform the ring with layered sine noise so it wobbles like freshly poured metal and slowly turns, and make the motion loop perfectly every 4 seconds. Light it like a product shot: one large softbox from the upper left, a dark ceiling for contrast in the reflections, soft contact shadows. Add two polished steel spheres and one matte peach sphere on the floor, a touch of film grain, 4:5 frame.",
    model: "Claude Opus 5.5",
    recommended: ["Claude Sonnet 5.5", "Claude Fable 5.2"],
    engineer: "jonas.feld",
    author: "jonas.feld",
    tags: ["3d", "shaders", "product"],
    copies: 1204,
    date: "2026-11-21T15:20:00Z",
  },
  {
    slug: "bauhaus-tiles",
    name: "bauhaus-grid",
    width: 640,
    height: 800,
    title: "Bauhaus tiles",
    prompt:
      "Make a looping motion-graphics piece in SVG + JavaScript: a 4×5 grid of square tiles in a Bauhaus palette (mustard, vermilion, teal, navy, blush, cream). Each tile holds one simple shape: quarter circles, a diamond, dots, stripes, a smile arc. Every half second a few tiles rotate 90° or swap their shape with an eased snap (cubic-bezier 0.65, 0, 0.35, 1), staggered so the grid never moves all at once. Flat colours, slight paper grain, 4 seconds, seamless loop.",
    model: "Claude Sonnet 5.5",
    recommended: ["Claude Opus 5.5", "Claude Haiku 5.5"],
    engineer: "mara.ito",
    author: "mara.ito",
    tags: ["motion-graphics", "generative", "animation"],
    copies: 1532,
    date: "2026-11-24T09:45:00Z",
  },
  {
    slug: "elevation-study",
    name: "contour-poster",
    width: 600,
    height: 800,
    title: "Elevation Study No. 07",
    prompt:
      "Generate a looping canvas animation styled as a two-colour risograph poster titled \"Elevation Study\" in a bold orange serif, with small blue captions and a scale bar. Build a mountain massif from fractal noise, draw orange contour lines with a heavier index line every fifth, over a blue 45° halftone hillshade, slightly misregistered. Animate only the contours: they rise and fall like a slow tide over the still relief. Warm cream paper with grain, 3:4, 4-second loop.",
    model: "Claude Sonnet 5.5",
    recommended: ["Claude Opus 5.5"],
    engineer: "ada.reyes",
    author: "ada.reyes",
    tags: ["typography", "generative", "animation"],
    copies: 917,
    date: "2026-11-15T11:30:00Z",
  },
  {
    slug: "light-trails",
    name: "particle-drift",
    width: 800,
    height: 450,
    title: "Light trails",
    prompt:
      "Write a WebGL particle system: 60,000 particles advected through a slowly evolving curl-noise flow field, drawn as additive long-exposure streaks on a deep navy background. Colour each trail from warm ivory to dusty rose and pale teal depending on speed. Keep the bands of motion horizontal and wave-like, add a soft bloom, and make the flow field loop every 4 seconds so the clip repeats without a cut. 16:9.",
    model: "Claude Opus 5.5",
    recommended: ["Claude Sonnet 5.5"],
    engineer: "noor.haddad",
    author: "noor.haddad",
    tags: ["particles", "vfx", "generative"],
    copies: 455,
    date: "2026-11-23T21:05:00Z",
  },
  {
    slug: "teal-silk",
    name: "silk-flow",
    width: 600,
    height: 800,
    title: "Teal silk, folded light",
    prompt:
      "Fragment shader: heavy teal silk folding over itself, made from domain-warped fbm used as a height field, lit with a soft top light that skims the ridges and lets the folds fall into rust-red shadow. No edges or background, macro framing, satin sheen from a cheap anisotropic highlight. The fabric should flow slowly and loop every 4 seconds. 3:4.",
    model: "Claude Fable 5.2",
    recommended: ["Claude Opus 5.5"],
    engineer: "mara.ito",
    author: "noor.haddad",
    tags: ["abstract", "shaders", "motion-graphics"],
    copies: 388,
    date: "2026-11-20T19:40:00Z",
  },  {
    slug: "ink-bloom",
    name: "ink-bloom",
    width: 450,
    height: 800,
    title: "Ink bloom, 9:16",
    prompt:
      "Write a 2D fluid simulation in WebGL (stable fluids, vorticity confinement) of blue and crimson ink pouring from two thin wobbling streams into a backlit tank of clear water. Let the ink twist into curling vortices and marbled lilac clouds that billow and sink, with a few drifting specks. Warm white background, soft backlight, vertical 9:16 for phones. Make it loop by crossfading the last second into the first.",
    model: "Claude Opus 5.5",
    recommended: ["Claude Fable 5.2"],
    engineer: "noor.haddad",
    author: "mara.ito",
    tags: ["vfx", "abstract", "shaders"],
    copies: 1093,
    date: "2026-11-16T13:00:00Z",
  },
  {
    slug: "amber-on-travertine",
    name: "amber-perfume",
    width: 640,
    height: 800,
    title: "Amber on travertine",
    prompt:
      "Raymarch a product shot in a fragment shader: a rectangular glass perfume bottle filled with amber liquid and a brushed-gold cap, standing on a travertine pedestal next to a sage ceramic sphere, on a seamless sage-green backdrop. Turn the bottle slowly like a turntable, let soft leaf shadows sway across the backdrop, and tint the bottle's shadow amber where light passes through the liquid. 4:5, 4-second loop.",
    model: "Claude Opus 5.5",
    recommended: ["Claude Sonnet 5.5"],
    engineer: "jonas.feld",
    author: "jonas.feld",
    tags: ["product", "3d", "shaders"],
    copies: 866,
    date: "2026-11-17T10:20:00Z",
  },
  {
    slug: "golden-hour-ocean",
    name: "ocean-dusk",
    width: 800,
    height: 450,
    title: "Golden hour, 2.39:1",
    prompt:
      "Shader shot list: open ocean at golden hour, low sun over a hazy horizon, a thin band of clouds, a dark headland on the left. Swells and small ripples roll toward camera and sparkle as they cross the sun path. Grade it teal-orange, add film grain, halation around highlights and a faint anamorphic streak, then letterbox to 2.39:1 inside a 16:9 frame. 4-second seamless loop.",
    model: "Claude Opus 5.5",
    recommended: ["Claude Fable 5.2", "Claude Sonnet 5.5"],
    engineer: "noor.haddad",
    author: "noor.haddad",
    tags: ["editing", "shaders"],
    copies: 731,
    date: "2026-11-24T20:15:00Z",
  },
  {
    slug: "glass-torus",
    name: "glass-torus",
    width: 800,
    height: 800,
    title: "Soap-film torus on sand",
    prompt:
      "Raymarch a chunky glass torus with thin-film iridescence standing on rippled warm sand, next to a terracotta cylinder and a cream sphere. Low sun from behind: the glass shows pastel interference colours and prismatic fringing and throws a long ring-shaped shadow with a bright caustic line. Turn the torus slowly on its vertical axis so the shadow and caustic sweep across the sand. Square, 4-second loop.",
    model: "Claude Opus 5.5",
    recommended: ["Claude Sonnet 5.5"],
    engineer: "jonas.feld",
    author: "mara.ito",
    tags: ["3d", "shaders", "abstract"],
    copies: 642,
    date: "2026-11-18T09:05:00Z",
  },
  {
    slug: "courtyard-sun",
    name: "sun-courtyard",
    width: 800,
    height: 450,
    title: "Courtyard, moving sun",
    prompt:
      "Build a minimal Mediterranean courtyard in a raymarched scene: salmon-pink stucco walls, a staircase climbing the back wall to a landing, two arched openings and a small arched window framing a clear blue sky, a round porthole in the side wall, a terracotta planter on large sandstone tiles. Hard sunlight casts one sharp diagonal shadow; sweep the sun slowly back and forth like a time-lapse. 16:9, 4-second loop.",
    model: "Claude Sonnet 5.5",
    recommended: ["Claude Opus 5.5"],
    engineer: "theo.lind",
    author: "theo.lind",
    tags: ["architecture", "3d"],
    copies: 509,
    date: "2026-11-19T16:40:00Z",
  },
  {
    slug: "phyllotaxis-pulse",
    name: "phyllotaxis",
    width: 800,
    height: 800,
    title: "Phyllotaxis pulse",
    prompt:
      "Canvas sketch: a sunflower phyllotaxis spiral of about 1,500 dots on warm cream paper (golden angle 137.5°), coloured in bands of teal, terracotta, mustard, rose and navy. Send waves of dot size rippling outward from the centre with a three-lobed twist so the spiral arms pulse and shimmer. Square, 4-second seamless loop.",
    model: "Claude Haiku 5.5",
    recommended: ["Claude Sonnet 5.5"],
    engineer: "ada.reyes",
    author: "ada.reyes",
    tags: ["generative", "motion-graphics"],
    copies: 274,
    date: "2026-11-25T08:30:00Z",
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
    mediaUrl: `/demo/${e.name}.mp4`,
    posterUrl: `/demo/${e.name}.jpg`,
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
