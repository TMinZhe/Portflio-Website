// Usage: node shots.mjs <outDir> [label]
// Screenshots key scroll positions at several widths, plus reduced-motion & no-WebGL.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const URL = process.env.URL ?? "http://localhost:3123/";

const sizes = [
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1280", width: 1280, height: 800 },
  { name: "1920", width: 1920, height: 1080 },
];
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;

const browser = await chromium.launch({ args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11"] });
const report = [];

async function scrollTo(page, y) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(900);
}

for (const s of sizes) {
  if (only && !only.includes(s.name)) continue;
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 1, isMobile: !!s.mobile, hasTouch: !!s.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(URL + (process.env.Q ?? ""), { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const H = s.height;
  const metrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    total: document.documentElement.scrollHeight,
    work: document.getElementById("work").getBoundingClientRect().top + scrollY,
    canvas: !!document.querySelector("canvas"),
  }));
  const points = {
    a_hero: 0,
    b_t25: H * 1.0,
    c_t50: H * 1.8,
    d_t85: H * (s.mobile ? 2.4 : 2.9),
    e_work: metrics.work - 60,
    f_stage: metrics.work + H * 0.9,
    g_stage2: metrics.work + H * 1.5,
  };
  for (const [k, y] of Object.entries(points)) {
    await scrollTo(page, y);
    await page.screenshot({ path: path.join(out, `${s.name}-${k}.png`) });
  }
  report.push({ size: s.name, ...metrics, errors });
  await ctx.close();
}

// Reduced motion + no WebGL variants at laptop width
for (const v of [
  { name: "reduced", opts: { reducedMotion: "reduce" }, q: "" },
  { name: "nowebgl", opts: {}, q: "?tier=none" },
]) {
  if (only && !only.includes(v.name)) continue;
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...v.opts });
  const page = await ctx.newPage();
  await page.goto(URL + v.q, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, `${v.name}-hero.png`) });
  await scrollTo(page, 1600);
  await page.screenshot({ path: path.join(out, `${v.name}-transform.png`) });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
