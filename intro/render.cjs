// Renders the intro with Playwright.
//   node render.cjs beats   → one still per beat (out/beats/bNN.png) for checking the grid
//   node render.cjs loop    → frame 0 next to the frame just before the loop point
//   node render.cjs full    → 60 fps video, 4 sub-frames per frame blended for motion blur
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const { mkdirSync } = require("node:fs");
const path = require("node:path");

const mode = process.argv[2] || "beats";
const OUT = path.join(__dirname, "out");
const FPS = 60, SUB = 4;

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("file://" + path.join(__dirname, "dist/claudemotion-intro.html"));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const { T, BEAT } = await page.evaluate(() => window.TIMELINE);
  const stage = await page.$("#stage");
  const shot = async (t, opts = {}) => {
    await page.evaluate((tt) => window.seek(tt), t);
    return stage.screenshot({ type: "png", ...opts });
  };

  if (mode === "beats") {
    mkdirSync(path.join(OUT, "beats"), { recursive: true });
    for (let n = 0; n < 28; n++) {
      // Shortly after each beat, once the change has mostly landed.
      await shot(n * BEAT + 0.3, { path: path.join(OUT, "beats", `b${String(n).padStart(2, "0")}.png`) });
    }
  } else if (mode === "loop") {
    await shot(0, { path: path.join(OUT, "loop-first.png") });
    await shot(T - 1e-6, { path: path.join(OUT, "loop-last.png") });
    const diff = await page.evaluate(({ T }) => {
      const read = (t) => {
        window.seek(t);
        const c = document.getElementById("cursor").style.transform;
        const s = document.getElementById("shape");
        return [c, s.style.width, s.style.height, s.style.background, document.getElementById("world").style.transform].join(" | ");
      };
      return { start: read(0), end: read(T - 1e-6) };
    }, { T });
    console.log(diff);
  } else if (mode === "full") {
    const N = Math.round(T * FPS);
    const ff = spawn("ffmpeg", [
      "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS * SUB), "-c:v", "png", "-i", "-",
      "-vf", `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`,
      "-r", String(FPS), "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p",
      path.join(OUT, "video-only.mp4"),
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const t0 = Date.now();
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < SUB; j++) {
        // Sub-frames are centred on the frame time; wrap() inside seek keeps the loop seamless.
        const buf = await shot(i / FPS + (j - (SUB - 1) / 2) / (FPS * SUB));
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      }
      if (i % 60 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on("close", r));
    console.log(`done: ${N} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  if (errors.length) console.log("page errors:\n" + errors.join("\n"));
  await browser.close();
})();
