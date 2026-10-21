// Usage: node scripts/qa/detail-qa.mjs <outDir>
// Detail pages + media system: screenshots at three widths and functional checks.
// Env: URL (default http://localhost:3000), PAGES (comma list of paths).
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "qa-out/detail";
fs.mkdirSync(out, { recursive: true });
const BASE = (process.env.URL ?? "http://localhost:3000").replace(/\/$/, "");
const pages = (process.env.PAGES ?? "/projects/inventory-replenishment,/experience/unistop-tech,/").split(",");
const sizes = [
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1280", width: 1280, height: 800 },
];

const browser = await chromium.launch({ channel: process.env.CHANNEL ?? "chrome", args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11"] });
const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
const checkedLinks = new Map();

for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, isMobile: !!s.mobile, hasTouch: !!s.mobile });
  for (const p of pages) {
    const page = await ctx.newPage();
    const where = `${p} @${s.name}`;
    page.on("pageerror", (e) => fail(where, `page error ${e}`));
    page.on("console", (m) => m.type() === "error" && fail(where, `console ${m.text()}`));
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    // Walk down the page so reveals and lazy media settle, then back up.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += s.height * 0.8) {
      await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(600);
    const m = await page.evaluate(() => {
      const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => h.offsetParent !== null || h.closest("details"));
      const levels = hs.map((h) => Number(h.tagName[1]));
      let skip = null;
      for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) skip = `${hs[i - 1].tagName}→${hs[i].tagName} "${hs[i].textContent.trim().slice(0, 40)}"`;
      const hidden = [...document.querySelectorAll("[data-reveal]")].filter((el) => getComputedStyle(el).opacity !== "1").length;
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.offsetParent !== null).length;
      const links = [...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href"));
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        h1: document.querySelectorAll("h1").length,
        skip,
        hidden,
        broken,
        links,
        robots: document.querySelector('meta[name="robots"]')?.content ?? null,
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        title: document.title,
      };
    });
    if (m.overflow > 0) fail(where, `horizontal overflow ${m.overflow}px`);
    if (m.h1 !== 1) fail(where, `${m.h1} h1 elements`);
    if (m.skip) fail(where, `heading level skipped ${m.skip}`);
    if (m.hidden) fail(where, `${m.hidden} reveal elements still hidden after scrolling`);
    if (m.broken) fail(where, `${m.broken} broken images`);
    if (s.name === "1280") console.log(`${p}\n  title: ${m.title}\n  canonical: ${m.canonical}\n  robots: ${m.robots}`);
    for (const l of m.links) checkedLinks.set(l.split("#")[0] || "/", true);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    const name = p === "/" ? "home" : p.replaceAll("/", "_").replace(/^_/, "");
    await page.screenshot({ path: path.join(out, `${s.name}-${name}.png`), fullPage: p !== "/" });
    await page.close();
  }
  await ctx.close();
}

// Internal links resolve.
const req = await (await browser.newContext()).request;
for (const l of checkedLinks.keys()) {
  const r = await req.get(BASE + l);
  if (r.status() !== 200) fail("links", `${l} → ${r.status()}`);
}
console.log(`links checked: ${[...checkedLinks.keys()].join(", ")}`);

// Nav section links work from a sub-page.
{
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page.goto(BASE + pages[0], { waitUntil: "networkidle" });
  await page.click('nav[aria-label="Primary"] a:has-text("Experience")');
  await page.waitForURL(/\/#experience$/);
  await page.waitForTimeout(3000);
  const top = await page.evaluate(() => document.getElementById("experience")?.getBoundingClientRect().top ?? 9999);
  if (Math.abs(top) > 200) fail("nav", `#experience not scrolled into view from sub-page (top ${top})`);
}

// Gallery + lightbox on the lab fixture.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/lab/media-qa", { waitUntil: "networkidle" });
  // Scroll through so lazy images load (and fail) before counting fallbacks.
  for (let y = 0; y < 4000; y += 600) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(200);
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(800);
  const where = "gallery";
  const fallbacks = await page.locator("text=image unavailable").count();
  if (fallbacks < 2) fail(where, `expected ≥2 fallback panels for missing files, saw ${fallbacks}`);
  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length);
  if (broken) fail(where, `${broken} broken <img> left in the DOM`);
  const tile = page.locator("ul button").first();
  await tile.click();
  const dlg = page.locator("dialog[open]");
  await dlg.waitFor();
  await page.screenshot({ path: path.join(out, "lightbox-open.png") });
  const counter = () => dlg.locator("p.t-meta").first().innerText();
  if ((await counter()).replace(/\s/g, "") !== "1/6") fail(where, `counter ${await counter()}`);
  await page.keyboard.press("ArrowRight");
  if ((await counter()).replace(/\s/g, "") !== "2/6") fail(where, `ArrowRight → ${await counter()}`);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  if ((await counter()).replace(/\s/g, "") !== "6/6") fail(where, `ArrowLeft wrap → ${await counter()}`);
  await page.keyboard.press("ArrowRight");
  // Swipe left with a mouse-driven pointer.
  const box = await dlg.boundingBox();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  if ((await counter()).replace(/\s/g, "") !== "2/6") fail(where, `swipe → ${await counter()}`);
  await dlg.getByRole("button", { name: "Zoom in" }).click();
  await page.waitForTimeout(300);
  const zoomed = await page.evaluate(() => {
    const s = document.querySelector("dialog[open] .overflow-auto");
    return s ? s.scrollWidth > s.clientWidth : false;
  });
  if (!zoomed) fail(where, "zoom did not enlarge the image");
  await page.screenshot({ path: path.join(out, "lightbox-zoomed.png") });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  if (await page.locator("dialog[open]").count()) fail(where, "Escape did not close");
  const focusBack = await page.evaluate(() => document.activeElement?.tagName === "BUTTON" && !!document.activeElement.closest("ul"));
  if (!focusBack) fail(where, "focus not returned to the tile");
  // Keyboard only: Tab to a tile and open with Enter.
  await page.keyboard.press("Enter");
  if (!(await page.locator("dialog[open]").count())) fail(where, "Enter on focused tile did not open");
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(out, "media-qa.png"), fullPage: true });
  await ctx.close();
}

// Reduced motion: nothing held back.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + pages[0], { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const hidden = await page.evaluate(() => [...document.querySelectorAll("[data-reveal]")].filter((el) => getComputedStyle(el).opacity !== "1").length);
  if (hidden) fail("reduced-motion", `${hidden} elements hidden with reduced motion`);
  await ctx.close();
}

await browser.close();
console.log(problems.length ? `\n${problems.length} problem(s):\n- ${problems.join("\n- ")}` : "\nAll checks passed.");
process.exitCode = problems.length ? 1 : 0;
