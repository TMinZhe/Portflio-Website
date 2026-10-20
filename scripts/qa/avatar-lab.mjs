// Avatar lab QA: loads /lab/avatar, exercises cursor tracking, gestures and scroll
// cues, and screenshots each state. Usage: node scripts/qa/avatar-lab.mjs <outDir>
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "qa-out/lab";
fs.mkdirSync(out, { recursive: true });
const URL = (process.env.URL ?? "http://localhost:3123") + "/lab/avatar";
const b = await chromium.launch({ args: ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11"] });
const shot = (p, n) => p.screenshot({ path: path.join(out, `${n}.png`) });
const read = (p) => p.evaluate(() => document.querySelector('[aria-label="Prototype debug panel"]')?.innerText.replace(/\n+/g, " | "));

const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto(URL, { waitUntil: "networkidle" });
await p.mouse.move(720, 450);
await p.waitForTimeout(1500);
await shot(p, "01-greeting-wave");
console.log("greeting:", await read(p));
await p.waitForTimeout(2500);
// Cursor tracking: far left, top right
for (const [x, y, n] of [[60, 450, "02-look-left"], [1400, 80, "03-look-top-right"], [900, 860, "04-look-down"]]) {
  await p.mouse.move(x, y, { steps: 8 });
  await p.waitForTimeout(900);
  await shot(p, n);
}
console.log("tracking:", await read(p));
// Idle return
await p.waitForTimeout(3200);
await shot(p, "05-idle-return");
// Scroll through cues
const sections = await p.evaluate(() => [...document.querySelectorAll("[data-frame]")].map((s) => s.offsetTop));
const names = ["hero", "work", "stage", "about", "dense", "contact"];
for (let i = 1; i < sections.length; i++) {
  await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), sections[i] - 200);
  await p.waitForTimeout(i === 1 || i === 3 ? 900 : 1200);
  await shot(p, `1${i}-${names[i]}-a`);
  await p.waitForTimeout(1400);
  await shot(p, `1${i}-${names[i]}-b`);
  console.log(names[i], await read(p));
  await p.waitForTimeout(1500);
}
// Manual gestures
await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await p.waitForTimeout(1500);
for (const g of ["think", "present", "presentBoth"]) {
  await p.getByRole("button", { name: g, exact: true }).click();
  await p.waitForTimeout(3300);
}
await p.getByRole("button", { name: "point", exact: true }).click();
await p.waitForTimeout(900);
await shot(p, "20-point-hero");
await p.waitForTimeout(3000);
await p.getByRole("button", { name: "think", exact: true }).click();
await p.waitForTimeout(900);
await shot(p, "21-think");
await p.waitForTimeout(3000);
await p.getByRole("button", { name: "presentBoth", exact: true }).click();
await p.waitForTimeout(950);
await shot(p, "22-present-both");
await ctx.close();

// Mobile
const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
await m.goto(URL, { waitUntil: "networkidle" });
await m.waitForTimeout(2200);
await shot(m, "30-mobile-hero");
const contactY = await m.evaluate(() => document.getElementById("lab-contact").offsetTop);
await m.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), contactY);
await m.waitForTimeout(1500);
await shot(m, "31-mobile-contact");
console.log("errors:", errors);
await b.close();
