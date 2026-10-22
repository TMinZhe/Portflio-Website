// Usage: node scripts/qa/scantry-qa.mjs <outDir>   (production server on URL, default http://localhost:3123)
// Scantry case study: layout at four widths, the access simulator's every
// scenario, no camera request, wording and privacy guards, the approved
// media loading, and reduced motion.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "qa-out/scantry";
fs.mkdirSync(out, { recursive: true });
const BASE = (process.env.URL ?? "http://localhost:3123").replace(/\/$/, "");
const CASE = "/projects/scantry";
const problems = [];
const passed = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
const check = (where, ok, msg) => (ok ? passed.push(`${where}: ${msg}`) : fail(where, msg));

const browser = await chromium.launch({ channel: process.env.CHANNEL ?? "chrome" });

// Any camera request is a failure: the demo must never ask for the visitor's face.
const cameraTrap = () => {
  window.__camera = 0;
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => ((window.__camera += 1), Promise.reject(new Error("blocked")));
};

async function open(ctx, p, where) {
  const page = await ctx.newPage();
  await page.addInitScript(cameraTrap);
  page.on("pageerror", (e) => fail(where, `page error ${e}`));
  page.on("console", (m) => m.type() === "error" && fail(where, `console ${m.text()}`));
  const res = await page.goto(BASE + p, { waitUntil: "networkidle" });
  return { page, status: res?.status() };
}

async function revealAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    // Scripted scrolling doesn't always fire the reveal observer; show everything for full-page captures.
    document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-in", ""));
  });
}

const CHAPTERS = ["overview", "challenge", "how", "engineering", "validation", "startup"];

// 1. Layout at four widths.
for (const w of [375, 768, 1280, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 900 : 1000 }, isMobile: w < 800, hasTouch: w < 800 });
  for (const p of ["/", CASE]) {
    const where = `${p} @${w}`;
    const { page, status } = await open(ctx, p, where);
    check(where, status === 200, `status ${status}`);
    await revealAll(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(where, overflow <= 0, `no horizontal overflow (${overflow}px)`);
    await page.screenshot({ path: path.join(out, `${p === "/" ? "home" : "case"}-${w}.png`), fullPage: true });
    if (p === CASE) {
      const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
      check(where, JSON.stringify(ids) === JSON.stringify(CHAPTERS), `six chapters in order (${ids.join(", ")})`);
      for (const id of CHAPTERS) {
        const el = page.locator(`#${id}`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        await el.screenshot({ path: path.join(out, `c-${w}-${id}.png`) });
      }
      if (w === 1280 || w === 375)
        for (const id of ["vision", "hardware", "integration", "iteration"]) {
          const el = page.locator(`#${id}`);
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          await el.screenshot({ path: path.join(out, `story-${w}-${id}.png`) });
        }
      await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => (d.open = true)));
      await page.waitForTimeout(200);
      const o2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(where, o2 <= 0, `no horizontal overflow with every disclosure open (${o2}px)`);
      // All seven approved images render (galleries in validation and startup).
      for (const img of await page.locator("#validation img, #startup img").all()) {
        await img.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
      }
      await page.waitForLoadState("networkidle");
      const imgs = await page.locator("#validation img, #startup img").evaluateAll((els) => els.map((e) => e.naturalWidth));
      check(where, imgs.length === 7 && imgs.every((n) => n > 0), `seven approved images load (${imgs.filter((n) => n > 0).length}/${imgs.length})`);
      check(where, !/awaiting approval|Not approved/i.test(await page.locator("main").innerText()), "no pending-approval panels");
    }
    await page.close();
  }
  await ctx.close();
}

// 2. Homepage placement and copy.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "home";
  const { page } = await open(ctx, "/", where);
  const titles = await page.locator('#work h3[id^="p-"]').allInnerTexts();
  check(where, titles.length === 4 && titles[3] === "Scantry", `Scantry is the fourth project in Selected work (${titles.join(" | ")})`);
  const card = page.locator("#work .work-card").nth(3);
  const text = await card.innerText();
  check(where, /WorldSkills ASEAN Singapore 2023/.test(text) && /reported S\$10,000/.test(text), "card names the event and qualifies the funding");
  check(where, /Illustration/.test(text), "card labels its visual as an illustration");
  check(where, (await card.locator('a[href="/projects/scantry"]').count()) > 0, "card links to /projects/scantry");
  await ctx.close();
}

// 3. Simulator: every scenario, end to end.
const expected = {
  "First visit": { badge: "Approved", log: "Admitted", screen: "Welcome, Priya!" },
  "Invalid pass": { badge: "Invalid code", log: "Unknown pass", screen: "Invalid code" },
  "Face mismatch": { badge: "Face mismatch", log: "Face not verified", screen: "We couldn't verify you" },
  "Second lunch": { badge: "Dining allowance expired", log: "Over time", screen: "You've had lunch today" },
};
for (const reduced of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const where = `simulator${reduced ? " (reduced motion)" : ""}`;
  const { page } = await open(ctx, CASE, where);
  const sim = page.locator("#how");
  await sim.scrollIntoViewIfNeeded();
  check(where, await sim.getByRole("radio", { name: /First visit/ }).isChecked(), "default scenario is the successful one");
  for (const [label, want] of Object.entries(expected)) {
    await sim.getByRole("radio", { name: new RegExp(`^${label}`) }).check({ force: true });
    await sim.getByRole("button", { name: /^Step 1:/ }).click();
    for (let n = 0; n < 4; n++) await sim.getByRole("button", { name: /^Next/ }).click();
    // Step 5 reached; go back to step 3 and 4 to inspect.
    await sim.getByRole("button", { name: /^Step 3:/ }).click();
    if (label === "First visit") {
      await sim.getByRole("img", { name: "5 of 5 matching frames" }).waitFor({ timeout: reduced ? 300 : 4000 });
      passed.push(`${where}: face check reaches 5 of 5${reduced ? " at once" : ""}`);
      await page.screenshot({ path: path.join(out, `sim-face${reduced ? "-reduced" : ""}.png`), clip: (await sim.boundingBox()) ?? undefined });
    }
    if (label === "Face mismatch") {
      await sim.getByText(/Not verified: time ran out/).waitFor({ timeout: reduced ? 300 : 7000 });
      passed.push(`${where}: mismatch times out`);
    }
    await sim.getByRole("button", { name: /^Step 4:/ }).click();
    const t4 = await sim.innerText();
    check(where, t4.includes(want.badge) && t4.includes(want.screen), `${label}: decision "${want.badge}" and kiosk screen`);
    await sim.getByRole("button", { name: /^Step 5:/ }).click();
    const t5 = await sim.innerText();
    check(where, t5.includes(want.log), `${label}: log row "${want.log}"`);
    if (!reduced) await page.screenshot({ path: path.join(out, `sim-${label.replace(/\s/g, "-").toLowerCase()}.png`), clip: (await sim.boundingBox()) ?? undefined });
  }
  check(where, /admits only when both agree/.test(await sim.innerText()), "takeaway shown on the last step");
  await sim.getByRole("button", { name: /Restart/ }).click();
  check(where, (await sim.getByRole("button", { name: /^Step 1:/ }).getAttribute("aria-current")) === "step", "restart returns to step 1");
  check(where, (await page.evaluate(() => window.__camera)) === 0, "camera never requested");
  await ctx.close();
}

// 4. Wording and privacy guards.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "wording";
  const { page } = await open(ctx, CASE, where);
  await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => (d.open = true)));
  const text = await page.locator("main").innerText();
  for (const [re, what] of [
    [/spoof-proof|fully secure|perfect accuracy|proprietary|zero[- ]wait|concurrent users/i, "no overclaims"],
    [/\b\d+(\.\d+)?\s?% (accuracy|accurate)|accuracy of \d/i, "no accuracy figure"],
    [/10,000\+?\s*(scans|users|guests)/i, "no 10,000-scans claim"],
    [/Andrina|Roydon|Timothy|Barnabas/, "teammates and staff not named"],
    [/TpDining|\.php\b|192\.168\.|SQL injection|plaintext/i, "no endpoints or security findings"],
    [/trained (our|my) own|we trained|custom neural/i, "no trained-model claim"],
  ])
    check(where, !re.test(text), what);
  check(where, /not liveness/i.test(text) || /isn't liveness/i.test(text) || /not a liveness/i.test(text), "five-frame check is said not to be liveness");
  check(where, /S\$9,000/.test(text) && /S\$10,000/.test(text), "deck ask and reported funding both stated");
  check(where, /not counted kiosk scans/i.test(text), "event attendance kept apart from kiosk scans");
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, "report.txt"), [...passed.map((p) => `PASS ${p}`), ...problems.map((p) => `FAIL ${p}`)].join("\n"));
console.log(`${passed.length} passed, ${problems.length} failed`);
for (const p of problems) console.log("FAIL", p);
process.exit(problems.length ? 1 : 0);
