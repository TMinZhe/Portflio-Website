// Usage: node scripts/qa/inventory-qa.mjs <outDir>   (server on URL, default http://localhost:3123)
// Inventory case study: layout at four widths, console errors, every interactive
// demo driven end to end, and a reduced-motion pass.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "qa-out/inventory";
fs.mkdirSync(out, { recursive: true });
const BASE = (process.env.URL ?? "http://localhost:3123").replace(/\/$/, "");
const CASE = "/projects/inventory-replenishment";
const problems = [];
const passed = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
const check = (where, ok, msg) => (ok ? passed.push(`${where}: ${msg}`) : fail(where, msg));

const browser = await chromium.launch({ channel: process.env.CHANNEL ?? "chrome" });

async function open(ctx, p, where) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(where, `page error ${e}`));
  page.on("console", (m) => m.type() === "error" && fail(where, `console ${m.text()}`));
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  return page;
}

// 1. Layout at four widths.
for (const w of [375, 768, 1280, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 900 : 1000 }, isMobile: w < 800, hasTouch: w < 800 });
  for (const p of ["/", CASE]) {
    const where = `${p} @${w}`;
    const page = await open(ctx, p, where);
    // Reveal everything that animates in on scroll before measuring.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(where, overflow <= 0, `no horizontal overflow (${overflow}px)`);
    await page.screenshot({ path: path.join(out, `${p === "/" ? "home" : "case"}-${w}.png`), fullPage: true });
    await page.close();
  }
  await ctx.close();
}

// 2. Interactive demos at desktop width.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "demos";
  const page = await open(ctx, CASE, where);
  const sim = page.locator("section[aria-label='Event sequence']").locator("xpath=ancestor::div[contains(@class,'bg-graphite')][1]");
  const btn = (name) => sim.getByRole("button", { name });
  const sw = (name) => sim.getByRole("switch", { name });
  const log = () => sim.locator("section[aria-label='Event sequence']").innerText();
  const stock = async (pos) => Number(await sim.locator(`section[aria-label='Store C'] dt:text-is("${pos}") + dd`).innerText());

  await btn(/Complete a top-up/).click();
  await btn(/Complete a top-up/).click();
  await btn(/Run delivery worker/).click();
  check(where, /retries in 5s/.test(await log()), "offline attempt is transient, backs off 5s");
  check(where, /1 later job waits behind it/.test(await log()), "later job waits behind the failing one");
  await sw(/Store C offline/).click();
  await sw(/Lose the next acknowledgement/).click();
  await btn(/Run delivery worker/).click();
  check(where, /acknowledgement lost/.test(await log()), "lost acknowledgement leaves job pending");
  check(where, (await stock("P-12")) === 7, "store applied the delta once (P-12 = 7)");
  await btn(/Run delivery worker/).click();
  check(where, /marker already present/.test(await log()), "replay finds the marker");
  check(where, (await stock("P-12")) === 7, "replay leaves stock untouched (P-12 = 7)");
  check(where, (await sim.locator("section[aria-label='Stock effects'] p").nth(1).innerText()).trim() === "1×", "stock effect counter shows 1×");
  await sim.screenshot({ path: path.join(out, "demo-offline-delivery.png") });

  await sw(/Idempotency marker/).click();
  await sw(/Store C offline/).click();
  await btn(/Complete a top-up/).click();
  await sw(/Lose the next acknowledgement/).click();
  await btn(/Run delivery worker/).click();
  await btn(/Run delivery worker/).click();
  check(where, (await stock("P-12")) === 11, "without the marker, a replay double-applies (P-12 = 11)");

  // Forecast explorer: full availability removes the stockout correction.
  const avail = page.getByLabel("Days in stock");
  const demand = page.locator("dt:text-is('Daily demand') + dd");
  const before = await demand.innerText();
  await avail.focus();
  await page.keyboard.press("End");
  const after = await demand.innerText();
  check(where, before === "3.00" && after === "1.80", `stockout correction: ${before} → ${after} at 100% availability`);
  await page.getByLabel("Days in stock").locator("xpath=ancestor::div[contains(@class,'bg-graphite')][1]").screenshot({ path: path.join(out, "demo-forecast.png") });

  // Placement: default scenario spills and records one unplaced unit.
  const placeNote = page.locator("p").filter({ hasText: /could not be placed|Every delivered unit/ });
  check(where, /1 unit could not be placed/.test(await placeNote.innerText()), "placement records an unplaced unit");
  await page.getByLabel("P-01 was filled to capacity by hand").uncheck();
  check(where, /Every delivered unit is accounted for/.test(await placeNote.innerText()), "placement fits when P-01 has room");

  // Architecture: isolating a path.
  const queued = page.getByRole("button", { name: "Queued writes" });
  await queued.click();
  check(where, (await queued.getAttribute("aria-pressed")) === "true", "architecture path can be isolated");

  // Table of contents lists the new sections.
  const toc = await page.locator("nav").allInnerTexts();
  for (const s of ["Offline-safe delivery", "Forecasting", "Inventory integrity", "Financial correctness", "Platform capabilities"])
    check(where, toc.join(" ").includes(s), `TOC has "${s}"`);
  await ctx.close();
}

// 3. Section-by-section shots for visual review.
for (const w of [375, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 1000 }, isMobile: w < 800 });
  const page = await open(ctx, CASE, `sections @${w}`);
  for (const id of ["problem", "role", "offline-delivery", "forecasting", "integrity", "financials", "architecture", "decisions", "capabilities", "results", "next-steps"]) {
    const el = page.locator(`#${id}`);
    if (!(await el.count())) {
      fail(`sections @${w}`, `#${id} missing`);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: path.join(out, `s-${w}-${id}.png`) });
  }
  await ctx.close();
}

// 4. Reduced motion.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: "reduce" });
  const page = await open(ctx, CASE, "reduced-motion");
  const hidden = await page.evaluate(
    () => [...document.querySelectorAll("[data-reveal]")].filter((e) => getComputedStyle(e).opacity === "0").length,
  );
  check("reduced-motion", hidden === 0, `no content left hidden (${hidden} hidden reveals)`);
  await page.screenshot({ path: path.join(out, "case-reduced-motion.png"), fullPage: true });
  await ctx.close();
}

await browser.close();
console.log(passed.map((p) => `PASS ${p}`).join("\n"));
console.log(problems.length ? `\n${problems.length} problem(s):\n${problems.join("\n")}` : "\nAll checks passed.");
process.exit(problems.length ? 1 : 0);
