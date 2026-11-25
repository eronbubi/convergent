// Inlines the font and the clip frames so the intro is one self-contained HTML file.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const b64 = (p, mime) => `data:${mime};base64,${readFileSync(join(root, p)).toString("base64")}`;

const frames = readdirSync(join(root, "assets/frames")).filter((f) => f.endsWith(".jpg")).sort();
const assets = {
  still: b64("assets/still.jpg", "image/jpeg"),
  frames: frames.map((f) => b64(`assets/frames/${f}`, "image/jpeg")),
};

let html = readFileSync(join(root, "src/index.html"), "utf8");
html = html.replace("__FONT__", b64("assets/geist.woff2", "font/woff2"));
html = html.replace("__ASSETS__", JSON.stringify(assets));
mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist/claudemotion-intro.html"), html);
console.log(`dist/claudemotion-intro.html  ${(html.length / 1e6).toFixed(1)} MB, ${frames.length} frames`);
