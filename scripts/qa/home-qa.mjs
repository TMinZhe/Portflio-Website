// Usage: node scripts/qa/home-qa.mjs <outDir>   (production server on URL, default http://localhost:3123)
// Homepage: the Selected work showcase in all three modes (pin, carousel, list),
// its navigation, keyboard access, reduced effects, ScrollTrigger lifecycle,
// copy budget, routes, media, and the trimmed sections around it.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "qa-out/home";
fs.mkdirSync(out, { recursive: true });
const BASE = (process.env.URL ?? "http://localhost:3123").replace(/\/$/, "");
const problems = [];
const passed = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
const check = (where, ok, msg) => (ok ? passed.push(`${where}: ${msg}`) : fail(where, msg));

const browser = await chromium.launch({ channel: process.env.CHANNEL ?? "chrome" });
const ORDER = ["inventory-replenishment", "ai-operations-assistant", "enterprise-risk-management", "scantry"];

async function open(ctx, p, where) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(where, `page error ${e}`));
  page.on("console", (m) => m.type() === "error" && fail(where, `console ${m.text()}`));
  await page.goto(BASE + p, { waitUntil: "networkidle" });
  return page;
}
const mode = (page) => page.locator("#work [data-mode]").getAttribute("data-mode");
const scrollTo = async (page, y) => {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(700);
};
const workTop = (page) => page.evaluate(() => document.querySelector("#work").getBoundingClientRect().top + scrollY);
const activeIndex = (page) => page.locator("#work .work-card").evaluateAll((els) => els.findIndex((e) => e.hasAttribute("data-active")));

// 1. Mode per viewport, layout, screenshots.
const sizes = [
  { w: 375, h: 812, mode: "carousel", mobile: true },
  { w: 768, h: 1024, mode: "carousel", mobile: true },
  { w: 1024, h: 768, mode: "carousel" },
  { w: 1280, h: 720, mode: "carousel" },
  { w: 1100, h: 760, mode: "pin" },
  { w: 1366, h: 768, mode: "pin" },
  { w: 1440, h: 900, mode: "pin" },
  { w: 1536, h: 864, mode: "pin" },
  { w: 1920, h: 1080, mode: "pin" },
  { w: 1280, h: 640, mode: "carousel" },
];
for (const s of sizes) {
  const where = `@${s.w}x${s.h}`;
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, isMobile: !!s.mobile, hasTouch: !!s.mobile });
  const page = await open(ctx, "/", where);
  check(where, (await mode(page)) === s.mode, `mode ${s.mode} (${await mode(page)})`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(where, overflow <= 0, `no horizontal page overflow (${overflow}px)`);
  const top = await workTop(page);
  if (s.mode === "pin") {
    const spacer = await page.evaluate(() => {
      const sp = document.querySelector("#work .pin-spacer");
      return sp ? sp.getBoundingClientRect().height - innerHeight : -1;
    });
    check(where, spacer > 0 && spacer <= 3.2 * s.h, `pinned stretch ${Math.round(spacer)}px (${(spacer / s.h).toFixed(1)} viewports)`);
    await scrollTo(page, top - s.h * 0.5);
    await page.screenshot({ path: path.join(out, `pin-${s.w}-entrance.png`) });
    for (const [i, name] of [[0, "first"], [1, "middle"], [3, "final"]]) {
      await page.locator("#work nav button").nth(i).click();
      await page.waitForTimeout(1400);
      const card = page.locator("#work .work-card").nth(i);
      const box = await card.boundingBox();
      check(where, box && box.x >= -1 && box.x + box.width <= s.w + 1 && box.y >= 0 && box.y + box.height <= s.h + 1, `${name} card fully in view after nav (${box && [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)].join(",")})`);
      check(where, (await activeIndex(page)) === i, `${name}: active card ${i + 1}`);
      check(where, (await page.locator("#work [data-work-controls] p").innerText()).startsWith(String(i + 1).padStart(2, "0")), `${name}: counter`);
      await page.screenshot({ path: path.join(out, `pin-${s.w}-${name}.png`) });
    }
    const end = await page.evaluate(() => { const sp = document.querySelector("#work .pin-spacer"); return sp.getBoundingClientRect().bottom + scrollY; });
    await scrollTo(page, end - s.h * 0.35);
    await page.screenshot({ path: path.join(out, `pin-${s.w}-exit.png`) });
    const expTop = await page.locator("#experience").evaluate((e) => e.getBoundingClientRect().top);
    check(where, expTop < s.h, "Experience follows directly after the showcase");
  } else {
    await scrollTo(page, top - 20);
    await page.screenshot({ path: path.join(out, `carousel-${s.w}x${s.h}.png`) });
    const peek = await page.locator("#work .work-card").nth(1).boundingBox();
    check(where, peek && peek.x < s.w, "the next card peeks in");
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(out, `full-${s.w}x${s.h}.png`), fullPage: s.mode !== "pin" });
  await ctx.close();
}

// 2. Pin mode: prev/next, skip link, keyboard focus follow, card links.
{
  const where = "pin controls";
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await open(ctx, "/", where);
  await scrollTo(page, (await workTop(page)) + 5);
  const next = page.getByRole("button", { name: "Next project" });
  const prev = page.getByRole("button", { name: "Previous project" });
  check(where, await prev.isDisabled(), "previous disabled on the first card");
  await next.click();
  await page.waitForTimeout(1300);
  check(where, (await activeIndex(page)) === 1, "next moves to card 2");
  await prev.click();
  await page.waitForTimeout(1300);
  check(where, (await activeIndex(page)) === 0, "previous returns to card 1");
  // Keyboard: focus the third card's case-study link directly; it should come into view.
  await page.locator("#work .work-card").nth(2).getByRole("link", { name: /Explore case study/ }).focus();
  await page.waitForTimeout(700);
  const box = await page.locator("#work .work-card").nth(2).boundingBox();
  check(where, box && box.x >= -1 && box.x + box.width <= 1441, "focused card is brought into view");
  // Tab order is the reading order: nav controls, then card 1's links.
  const hrefs = await page.locator("#work .work-card a:not([tabindex='-1'])").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  const order = [...new Set(hrefs)].map((h) => h.replace("/projects/", ""));
  check(where, JSON.stringify(order) === JSON.stringify(ORDER), `cards in reading order (${order.join(", ")})`);
  await page.getByRole("link", { name: /Skip to Experience/ }).click();
  await page.waitForTimeout(1500);
  const exp = await page.locator("#experience").evaluate((e) => e.getBoundingClientRect().top);
  check(where, exp < 200, `skip link lands on Experience (${Math.round(exp)}px)`);
  await ctx.close();
}

// 3. Carousel: buttons, active state, vertical scroll passes through.
{
  const where = "carousel";
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await open(ctx, "/", where);
  await scrollTo(page, (await workTop(page)) + 40);
  await page.getByRole("button", { name: "Next project" }).click();
  await page.waitForTimeout(900);
  check(where, (await activeIndex(page)) === 1, "next scrolls the track to card 2");
  await page.locator("#work nav button").nth(3).click();
  await page.waitForTimeout(900);
  check(where, (await activeIndex(page)) === 3, "project name jumps to card 4");
  const dx = await page.locator(".work-track").evaluate((t) => t.scrollWidth - t.clientWidth);
  check(where, dx > 0, "the track scrolls horizontally on its own");
  check(where, (await page.locator("#work .pin-spacer").count()) === 0, "no pin in carousel mode");
  await page.locator("#work").screenshot({ path: path.join(out, "carousel-390-card4.png") });
  await ctx.close();
  // Wheel and trackpad users (a desktop browser in carousel mode): vertical scrolling over the track still scrolls the page.
  const ctx2 = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  const p2 = await open(ctx2, "/", where);
  await scrollTo(p2, (await workTop(p2)) + 40);
  const before = await p2.evaluate(() => scrollY);
  const tb = await p2.locator(".work-track").boundingBox();
  await p2.mouse.move(tb.x + tb.width / 2, tb.y + 40);
  await p2.mouse.wheel(0, 400);
  await p2.waitForTimeout(700);
  check(where, (await p2.evaluate(() => scrollY)) > before, "a vertical wheel over the track scrolls the page");
  await ctx2.close();
}

// 4. Reduced effects: a vertical list, no pin, no controls.
for (const w of [1440, 390]) {
  const where = `reduced @${w}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  const page = await open(ctx, "/", where);
  check(where, (await mode(page)) === "list", "list mode");
  check(where, (await page.locator("#work .pin-spacer").count()) === 0, "nothing pinned");
  check(where, !(await page.locator("#work [data-work-controls]").first().isVisible()), "controls hidden");
  const xs = await page.locator("#work .work-card").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
  check(where, new Set(xs).size === 1, `cards stacked vertically (${xs.join(",")})`);
  await page.locator("#work").screenshot({ path: path.join(out, `reduced-${w}.png`) });
  await ctx.close();
}

// 5. Lifecycle: crossing the breakpoint tears down and rebuilds exactly one pin.
{
  const where = "lifecycle";
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await open(ctx, "/", where);
  for (const [w, h, want] of [[900, 900, 0], [1440, 900, 1], [1440, 650, 0], [1440, 900, 1], [1300, 900, 1]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(700);
    const n = await page.locator("#work .pin-spacer").count();
    check(where, n === want, `${w}x${h}: ${want} pin spacer (${n})`);
  }
  const transform = await page.locator(".work-track").evaluate((e) => getComputedStyle(e).transform);
  await scrollTo(page, 0);
  check(where, transform !== undefined, "track transform readable after resizes");
  await ctx.close();
}

// 6. Content, links, media, the other sections.
{
  const where = "content";
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await open(ctx, "/", where);
  const cards = page.locator("#work .work-card");
  for (let i = 0; i < 4; i++) {
    const words = await cards.nth(i).locator("[data-copy]").evaluateAll((ps) => ps.map((p) => p.innerText).join(" ").split(/\s+/).filter(Boolean).length);
    check(where, words >= 25 && words <= 55, `card ${i + 1}: ${words} words of copy`);
    check(where, (await cards.nth(i).locator('ul[aria-label="Key technologies"] li').count()) <= 3, `card ${i + 1}: at most three tags`);
    check(where, (await cards.nth(i).locator("li ul li, ul:not([aria-label]) li").count()) === 0, `card ${i + 1}: no feature bullets`);
  }
  const titles = await page.locator('#work h3[id^="p-"]').allInnerTexts();
  check(where, titles.length === 4 && titles[3] === "Scantry", `four flagships, Scantry last (${titles.join(" | ")})`);
  check(where, (await page.locator("#more-work").count()) === 0 && !(await page.locator("#work").innerText()).includes("Context-Aware"), "R&D project kept off the showcase");
  check(where, /1 more \(in development\)/.test(await page.locator("#work").innerText()), "View all projects mentions the R&D project");
  const intel = await cards.evaluateAll((els) => els.map((e) => /Intel/.test(e.innerText)));
  check(where, JSON.stringify(intel) === JSON.stringify([false, true, false, false]), "only the AI card mentions Intel");
  // Media: every card image loads once scrolled into view.
  for (let i = 0; i < 4; i++) {
    await page.locator("#work nav button").nth(i).click();
    await page.waitForTimeout(900);
  }
  await page.waitForLoadState("networkidle");
  const imgs = await page.locator("#work img").evaluateAll((els) => els.map((e) => e.naturalWidth));
  check(where, imgs.length === 2 && imgs.every((n) => n > 0), `card images load (${imgs.join(",")})`);
  const labels = await cards.locator("figcaption").allInnerTexts();
  check(where, labels.length === 4 && labels.every((l) => /screenshot|recreation|Illustration/i.test(l)), `every visual labelled (${labels.join(" | ")})`);
  const disclaimers = (await page.locator("#work").innerText()).match(/synthetic data/g) ?? [];
  check(where, disclaimers.length <= 4, `disclosures not repeated (${disclaimers.length})`);
  const text = await page.locator("main").innerText();
  check(where, !/Retrieval|RAG\b/.test(text), "no RAG claim on the homepage");
  check(where, text.includes("I build production software and applied AI systems"), "shorter hero intro");
  check(where, /Most of what I've built has had to work for people outside a classroom/.test(text), "new About opening");
  for (const slug of ORDER) {
    const r = await page.request.get(`${BASE}/projects/${slug}`);
    check(where, r.status() === 200, `/projects/${slug} ${r.status()}`);
  }
  const idx = await page.request.get(`${BASE}/projects`);
  check(where, /Context-Aware Digital Advertising/.test(await idx.text()) && /In development/.test(await idx.text()), "/projects lists the R&D project as In development");
  const xp = await (await page.request.get(`${BASE}/experience/unistop-tech`)).text();
  check(where, !/Retrieval-augmented/.test(xp), "Unistop page drops the RAG contribution");
  const llm = await page.request.get(`${BASE}/projects/llm-rag`);
  check(where, llm.status() === 404, `llm-rag hidden (${llm.status()})`);
  const nav = await page.locator("header nav a").allInnerTexts();
  check(where, ["Work", "Experience", "About", "Contact"].every((l) => nav.some((n) => n.trim() === l)), "nav keeps Work · Experience · About · Contact");
  const ad = await open(ctx, "/projects/context-aware-advertising", where);
  check(where, (await ad.locator("main header a").first().getAttribute("href")) === "/projects", "R&D page links back to /projects");
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, "report.txt"), [...passed.map((p) => `PASS ${p}`), ...problems.map((p) => `FAIL ${p}`)].join("\n"));
console.log(`${passed.length} passed, ${problems.length} failed`);
for (const p of problems) console.log("FAIL", p);
process.exit(problems.length ? 1 : 0);
