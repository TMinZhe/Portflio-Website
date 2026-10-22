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
  const openDisclosure = async (scope, label) => {
    const sum = scope.locator("summary", { hasText: label }).first();
    await sum.scrollIntoViewIfNeeded();
    await sum.click();
  };

  // Chapters and published media.
  const toc = (await page.locator("nav[aria-label='On this page']").innerText()).replace(/\s+/g, " ");
  for (const s of ["The project", "The problem", "Inside the platform", "How I solved it", "Behind the engineering", "Impact and reflection"])
    check(where, toc.includes(s), `chapter nav has "${s}"`);
  const body = await page.locator("main").innerText();
  check(where, !/awaiting approval|pending approval/i.test(body), "no pending-media panels on the published page");
  check(where, (await page.locator("#platform img").count()) >= 7, "all seven approved screens render in the tour");

  // 1. Guided delivery.
  const gd = page.locator("#delivery");
  const shelf = async () => Number(await gd.locator("p:has-text('Product A on the shelf') + p span").first().innerText());
  const next = gd.getByRole("button", { name: /^Next/ });
  check(where, /Step 1 of 5/.test(await gd.innerText()) && (await shelf()) === 3, "delivery step 1: store offline, shelf 3");
  await next.click();
  check(where, /Saved, waiting for Store C/.test(await gd.innerText()) && (await shelf()) === 3, "delivery step 2: saved at head office, shelf unchanged");
  await next.focus();
  await page.keyboard.press("Enter");
  check(where, (await shelf()) === 7 && /\+4 received/.test(await gd.innerText()), "delivery step 3 (keyboard): store receives 4, shelf 7");
  await next.click();
  check(where, /No confirmation, retrying/.test(await gd.innerText()), "delivery step 4: lost confirmation, retry");
  await next.click();
  const payoff = await gd.innerText();
  check(where, (await shelf()) === 7 && /received the stock only once/.test(payoff) && /would have made it 11/.test(payoff), "delivery step 5: retry skipped, shelf stays 7 (not 11)");
  await gd.locator("[data-reveal]").first().screenshot({ path: path.join(out, "demo-guided-delivery.png") });
  await gd.getByRole("button", { name: /Back/ }).click();
  check(where, /Step 4 of 5/.test(await gd.innerText()), "delivery Back works");
  await gd.getByRole("button", { name: "Step 5: The store recognises the delivery and skips it" }).click();
  await gd.getByRole("button", { name: /Restart/ }).click();
  check(where, /Step 1 of 5/.test(await gd.innerText()) && (await shelf()) === 3, "delivery Restart resets to step 1");

  // Advanced delivery mechanism (original simulator).
  await openDisclosure(gd, "Explore the technical mechanism");
  const sim = gd.locator("section[aria-label='Event sequence']").locator("xpath=ancestor::div[contains(@class,'bg-graphite')][1]");
  const btn = (name) => sim.getByRole("button", { name });
  const sw = (name) => sim.getByRole("switch", { name });
  const log = () => sim.locator("section[aria-label='Event sequence']").innerText();
  const stock = async (pos) => Number(await sim.locator(`section[aria-label='Store C'] dt:text-is("${pos}") + dd`).innerText());
  await btn(/Complete a top-up/).click();
  await btn(/Complete a top-up/).click();
  await btn(/Run delivery worker/).click();
  check(where, /retries in 5s/.test(await log()) && /1 later job waits behind it/.test(await log()), "advanced: offline is transient, later job waits");
  await sw(/Store C offline/).click();
  await sw(/Lose the next acknowledgement/).click();
  await btn(/Run delivery worker/).click();
  check(where, /acknowledgement lost/.test(await log()) && (await stock("P-12")) === 7, "advanced: lost ack, applied once (P-12 = 7)");
  await btn(/Run delivery worker/).click();
  check(where, /marker already present/.test(await log()) && (await stock("P-12")) === 7, "advanced: replay finds marker, stock untouched");
  await sw(/Idempotency marker/).click();
  await sw(/Store C offline/).click();
  await btn(/Complete a top-up/).click();
  await sw(/Lose the next acknowledgement/).click();
  await btn(/Run delivery worker/).click();
  await btn(/Run delivery worker/).click();
  check(where, (await stock("P-12")) === 11, "advanced: without the marker a replay double-applies (11)");
  await sim.screenshot({ path: path.join(out, "demo-advanced-delivery.png") });

  // 2. Forecast guide.
  const fc = page.locator("#forecast");
  const rec = () => fc.locator("p:has-text('Recommended top-up') + p span").first().innerText();
  const fcText = await fc.innerText();
  check(where, (await rec()) === "+21" && /instead of the recorded 1\.5/.test(fcText) && /recommend \+12/.test(fcText), "forecast default (stockouts): +21, vs +12 uncorrected");
  await fc.locator("[data-reveal]").first().screenshot({ path: path.join(out, "demo-forecast-guide.png") });
  await fc.getByRole("radio", { name: "Normal sales" }).click();
  check(where, (await rec()) === "+13" && !/Without the stockout correction/.test(await fc.innerText()), "forecast normal: +13, no comparison shown");
  await fc.getByRole("radio", { name: "One bulk purchase" }).click();
  check(where, (await rec()) === "+9" && /in full, it would recommend \+16/.test(await fc.innerText()), "forecast bulk: +9, vs +16 counting the basket in full");
  await fc.getByRole("radio", { name: "Often out of stock" }).click();
  await fc.getByLabel("Days the product was in stock").focus();
  await page.keyboard.press("Home");
  check(where, /caps the correction at double/.test(await fc.innerText()) && /estimates 3\.0 a day/.test(await fc.innerText()), "forecast: 20% in stock caps at 2x (3.0 a day)");
  await openDisclosure(fc, "Advanced settings");
  await fc.getByLabel("Shelf capacity").focus();
  await page.keyboard.press("Home");
  check(where, /The shelf is the limit here/.test(await fc.innerText()), "forecast: short shelf is called out");
  await openDisclosure(fc, "View calculation");
  check(where, /reorder point = ⌈μR/.test(await fc.innerText()), "forecast calculation view opens");
  await fc.screenshot({ path: path.join(out, "demo-forecast-advanced.png") });

  // 3. Shelf guard.
  const sg = page.locator("#safety");
  const nextS = sg.getByRole("button", { name: /^Next/ });
  await nextS.click();
  await nextS.click();
  const sgText = await sg.innerText();
  check(where, /Delivered\s*3/.test(sgText) && /5 units that wouldn.t fit stay in the warehouse/.test(sgText), "shelf guard: plans 8, delivers 3, 5 stay in the warehouse");
  await sg.locator("[data-reveal]").first().screenshot({ path: path.join(out, "demo-shelf-guard.png") });
  await sg.getByLabel("Units added by hand").focus();
  await page.keyboard.press("Home");
  check(where, /full plan is delivered/.test(await sg.innerText()), "shelf guard: no change, full plan delivered");
  await sg.getByRole("button", { name: /Restart/ }).click();
  check(where, /Step 1 of 3/.test(await sg.innerText()), "shelf guard Restart resets");
  await openDisclosure(sg, "Advanced placement and concurrency");
  const placeNote = sg.locator("p").filter({ hasText: /could not be placed|Every delivered unit/ });
  check(where, /1 unit could not be placed/.test(await placeNote.innerText()), "advanced placement records an unplaced unit");
  await sg.getByLabel("P-01 was filled to capacity by hand").uncheck();
  check(where, /Every delivered unit is accounted for/.test(await placeNote.innerText()), "advanced placement fits when P-01 has room");

  // Behind the engineering.
  const eng = page.locator("#engineering");
  await openDisclosure(eng, "View architecture");
  const queued = eng.getByRole("button", { name: "Queued writes" });
  await queued.click();
  check(where, (await queued.getAttribute("aria-pressed")) === "true", "architecture path can be pinned");
  await openDisclosure(eng, "Accurate financial reporting");
  check(where, /customer paid \$5\.00/.test(await eng.innerText()), "financial example leads with the $5 basket");
  await openDisclosure(eng, "Cost of goods and the technical detail");
  check(where, (await eng.getByText("Ledger coverage").count()) > 0, "COGS ledger available in the technical detail");
  for (const label of ["Engineering decisions and trade-offs", "Everything else the platform does", "Technical considerations and known limits"]) {
    await openDisclosure(eng, label);
  }
  check(where, /Durable outbox/.test(await eng.innerText()) && /Single-process queue/.test(await eng.innerText()), "decisions and limitations are still on the page");
  await ctx.close();
}

// 3. Chapter shots, beginner view (disclosures closed) and advanced view (all open).
for (const w of [375, 768, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 1000 }, isMobile: w < 800 });
  const page = await open(ctx, CASE, `chapters @${w}`);
  for (const id of ["project", "problem", "platform", "delivery", "forecast", "safety", "engineering", "impact"]) {
    const el = page.locator(`#${id}`);
    if (!(await el.count())) {
      fail(`chapters @${w}`, `#${id} missing`);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: path.join(out, `c-${w}-${id}.png`) });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`chapters @${w}`, overflow <= 0, `no horizontal overflow, disclosures closed (${overflow}px)`);
  await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => (d.open = true)));
  await page.waitForTimeout(300);
  const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`chapters @${w}`, overflow2 <= 0, `no horizontal overflow, every disclosure open (${overflow2}px)`);
  await page.locator("#engineering").screenshot({ path: path.join(out, `c-${w}-engineering-open.png`) });
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
