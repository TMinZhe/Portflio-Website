// Usage: node scripts/qa/advertising-qa.mjs <outDir>   (production server on URL, default http://localhost:3123)
// Context-Aware Digital Advertising: layout at four widths, placement (off the
// homepage showcase, on /projects), the explorer's scenes and details, reduced motion, wording
// guards, and the Intel collaboration wording on related pages.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "qa-out/advertising";
fs.mkdirSync(out, { recursive: true });
const BASE = (process.env.URL ?? "http://localhost:3123").replace(/\/$/, "");
const CASE = "/projects/context-aware-advertising";
const problems = [];
const passed = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
const check = (where, ok, msg) => (ok ? passed.push(`${where}: ${msg}`) : fail(where, msg));

const browser = await chromium.launch({ channel: process.env.CHANNEL ?? "chrome" });

async function open(ctx, p, where, { errors = true } = {}) {
  const page = await ctx.newPage();
  if (errors) {
    page.on("pageerror", (e) => fail(where, `page error ${e}`));
    page.on("console", (m) => m.type() === "error" && fail(where, `console ${m.text()}`));
  }
  const res = await page.goto(BASE + p, { waitUntil: "networkidle" });
  return { page, status: res?.status() };
}

// Scripted scrolling doesn't always fire the reveal observer; show everything for full-page captures.
const revealAll = (page) => page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-in", "")));

const CHAPTERS = ["overview", "problem", "prototype", "engineering", "next"];

// 1. Layout at four widths.
for (const w of [375, 768, 1280, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 900 : 1000 }, isMobile: w < 800, hasTouch: w < 800 });
  for (const p of ["/", "/projects", CASE]) {
    const where = `${p} @${w}`;
    const { page, status } = await open(ctx, p, where);
    check(where, status === 200, `status ${status}`);
    await revealAll(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(where, overflow <= 0, `no horizontal overflow (${overflow}px)`);
    const name = p === "/" ? "home" : p === "/projects" ? "index" : "case";
    await page.screenshot({ path: path.join(out, `${name}-${w}.png`), fullPage: true });
    if (p === CASE) {
      const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
      check(where, JSON.stringify(ids) === JSON.stringify(CHAPTERS), `five chapters in order (${ids.join(", ")})`);
      for (const id of CHAPTERS) {
        const el = page.locator(`#${id}`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await el.screenshot({ path: path.join(out, `c-${w}-${id}.png`) });
      }
      await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => (d.open = true)));
      await page.getByRole("button", { name: "Explore technical details" }).click();
      await page.waitForTimeout(200);
      const o2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(where, o2 <= 0, `no horizontal overflow with every disclosure and the details open (${o2}px)`);
    }
    await page.close();
  }
  await ctx.close();
}

// 2. Placement: kept off the homepage showcase, listed on /projects; Intel only where it belongs.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "placement";
  const { page } = await open(ctx, "/", where);
  const featured = await page.locator('#work h3[id^="p-"]').allInnerTexts();
  check(where, featured.length === 4 && !featured.some((t) => /Context-Aware/.test(t)), `R&D project isn't in the flagship showcase (${featured.join(" | ")})`);
  const cards = await page.locator("#work .work-card").allInnerTexts();
  check(where, /Intel team/.test(cards[1]) && [0, 2, 3].every((i) => !/Intel/.test(cards[i])), "only the AI Operations Assistant card mentions Intel");
  check(where, (await page.locator('img[src*="intel" i], img[alt*="intel" i]').count()) === 0, "no Intel logo");
  const idx = await open(ctx, "/projects", where);
  const row = idx.page.locator(`a[href="${CASE}"]`);
  const text = await row.innerText();
  check(where, /In development/.test(text) && /Industry collaboration: Intel team/.test(text), "/projects row shows In development and the Intel team");
  await ctx.close();
}

// 3. Explorer: every scene, details, reduced motion.
const scenes = {
  "Fast-moving crowd": { ad: "Northpoint Library", tag: "Fallback advertisement", concept: false },
  "Slower traffic": { ad: "Level 2 Brunch Club", tag: "Selected from the library", concept: false },
  "Mixed crowd": { ad: "Trailhead Runners", tag: "Selected from the library", concept: true },
};
for (const reduced of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const where = `explorer${reduced ? " (reduced motion)" : ""}`;
  const { page } = await open(ctx, CASE, where);
  const ex = page.locator("#prototype");
  await ex.scrollIntoViewIfNeeded();
  check(where, await ex.getByRole("radio", { name: "Slower traffic" }).isChecked(), "default scene is slower traffic");
  for (const [label, want] of Object.entries(scenes)) {
    await ex.getByRole("radio", { name: label }).check({ force: true });
    await page.waitForTimeout(150);
    const screen = await ex.locator("figure figcaption").innerText();
    const shown = await ex.locator("figure").first().innerText();
    check(where, screen.includes(want.tag) && shown.toLowerCase().includes(want.ad.toLowerCase()), `${label}: shows ${want.ad} (${want.tag})`);
    const t = await ex.innerText();
    check(where, /illustrative decision-policy concept/.test(t) === want.concept, `${label}: concept note ${want.concept ? "shown" : "absent"}`);
    if (!reduced) await page.screenshot({ path: path.join(out, `explorer-${label.split(" ")[0].toLowerCase()}.png`), clip: (await ex.boundingBox()) ?? undefined });
  }
  const anim = await ex.locator(".ad-walker").evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
  if (reduced) check(where, anim.length === 0 || anim.every((a) => a === "none"), "pedestrians stand still");
  else check(where, anim.length > 0 && anim.every((a) => a === "ad-walk"), "pedestrians walk");
  const inBounds = await ex.locator("[data-walkway]").first().evaluate((scene) => {
    const r = scene.getBoundingClientRect();
    return [...scene.querySelectorAll(":scope > span.absolute.-translate-y-1\\/2")].every((s) => {
      const b = s.getBoundingClientRect();
      return b.left >= r.left - 20 && b.right <= r.right + 20;
    });
  });
  if (reduced) check(where, inBounds, "pedestrians rest inside the scene");
  const btn = ex.getByRole("button", { name: "Explore technical details" });
  await btn.click();
  check(where, (await ex.getByRole("button", { name: "Hide technical details" }).getAttribute("aria-expanded")) === "true", "details toggle is expanded");
  check(where, (await ex.locator("#ad-details table tbody tr").count()) === 5, "details table lists the mixed scene's five pedestrians");
  check(where, /not a walking speed/.test(await ex.locator("#ad-details").innerText()), "details say px/s isn't a physical speed");
  if (!reduced) await page.screenshot({ path: path.join(out, "explorer-details.png"), clip: (await ex.boundingBox()) ?? undefined });
  await ctx.close();
}

// 4. Wording guards on the R&D page.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "wording";
  const { page } = await open(ctx, CASE, where);
  await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => (d.open = true)));
  const text = await page.locator("main").innerText();
  // The page's own disclaimer ("isn't an Intel product") must not trip the ownership guard.
  const claims = text.replace(/isn't an Intel product/g, "");
  for (const [re, what] of [
    [/OpenVINO|YOLO|PyTorch|TensorFlow|retail-00\d\d|Jetson|Intel (GPU|NPU|Arc|hardware)/i, "no unverified technologies or Intel hardware"],
    [/\d+(\.\d+)?\s?%|uplift|increase[sd]? (sales|engagement)|accuracy of \d/i, "no metrics"],
    [/deployed (at|in)|live passengers|real passengers were|installed at/i, "no deployment claims"],
    [/\b\d+(\.\d+)?\s?m\/s\b/i, "no physical speeds"],
    [/Intel('s)? (product|project)|owned by Intel|endorsed by Intel|Intel developed/i, "no Intel ownership or endorsement"],
    [/zininngg|demographic pipeline|Mr\. R/i, "nothing from the unrelated demographic pipeline"],
  ])
    check(where, !re.test(claims), what);
  check(where, /Future concept · not yet implemented/i.test(text), "future section labelled not implemented");
  check(where, /in collaboration with the Intel team/.test(text), "collaboration wording present");
  check(where, /isn't an Intel product/.test(text), "says it isn't an Intel product");
  check(where, (await page.getByText("Implemented", { exact: true }).count()) === 0, "no stage marked implemented");
  check(where, (await page.locator("aside[aria-label='Key facts'] ul, aside[aria-label='Key facts'] [aria-label='Technologies']").count()) === 0, "no technology chips until confirmed");
  check(where, /In development · Applied AI R&D/.test(await page.locator("main header").innerText()), "hero shows the development badge");
  await ctx.close();
}

// 5. Related pages and the retired slug.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "related";
  const ai = await open(ctx, "/projects/ai-operations-assistant", where);
  const aiText = await ai.page.locator("main").innerText();
  check(where, aiText.includes("Developed at Unistop Tech in collaboration with the Intel team."), "AI page has the collaboration statement");
  check(where, /Industry collaboration\s+Intel team/.test(await ai.page.locator("main header").innerText()), "AI hero lists the industry collaboration");
  const xp = await open(ctx, "/experience/unistop-tech", where);
  const xpText = await xp.page.locator("main").innerText();
  check(where, (xpText.match(/Intel engineers/g) ?? []).length === 2, "Unistop role mentions Intel engineers on exactly two projects");
  check(where, (await xp.page.locator(`a[href="${CASE}"]`).count()) > 0, "Unistop role links to the R&D project");
  const idx = await open(ctx, "/projects", where);
  check(where, /In development/.test(await idx.page.locator("main").innerText()), "projects index shows In development");
  const probe = await ctx.newPage();
  const old = await probe.goto(BASE + "/projects/vision-advertising");
  check(where, old?.status() === 404, `old draft slug returns 404 (${old?.status()})`);
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, "report.txt"), [...passed.map((p) => `PASS ${p}`), ...problems.map((p) => `FAIL ${p}`)].join("\n"));
console.log(`${passed.length} passed, ${problems.length} failed`);
for (const p of problems) console.log("FAIL", p);
process.exit(problems.length ? 1 : 0);
