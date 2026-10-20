// Keyboard QA: tab order from page load, anchor landing, mobile sheet focus handling.
import { chromium } from "playwright";
const URL = process.env.URL ?? "http://localhost:3123/";
const b = await chromium.launch();
const out = {};

const desk = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
await desk.goto(URL, { waitUntil: "networkidle" });
const order = [];
for (let i = 0; i < 14; i++) {
  await desk.keyboard.press("Tab");
  order.push(await desk.evaluate(() => {
    const a = document.activeElement;
    const visible = a && getComputedStyle(a).outlineStyle !== "none";
    return `${a.tagName.toLowerCase()}:${(a.textContent || a.getAttribute("aria-label") || "").trim().slice(0, 24)}${visible ? "" : " (NO OUTLINE)"}`;
  }));
}
out.tabOrder = order;
// Anchors: activate each nav link with Enter and record where the section lands.
out.anchors = {};
for (const id of ["work", "experience", "about", "skills", "contact"]) {
  await desk.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await desk.focus(`nav a[href="#${id}"]`);
  await desk.keyboard.press("Enter");
  await desk.waitForTimeout(1600);
  out.anchors[id] = await desk.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top), id);
}
// Skip link
await desk.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
await desk.reload({ waitUntil: "networkidle" });
await desk.keyboard.press("Tab");
out.skipLinkVisible = await desk.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return document.activeElement.textContent.trim() + " " + (r.width > 1 ? "visible" : "hidden"); });

const mob = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
await mob.goto(URL, { waitUntil: "networkidle" });
await mob.focus('button[aria-controls="mobile-sheet"]');
await mob.keyboard.press("Enter");
await mob.waitForTimeout(200);
out.sheetFocus = await mob.evaluate(() => document.activeElement.textContent.trim());
await mob.keyboard.press("Escape");
await mob.waitForTimeout(200);
out.afterEscape = await mob.evaluate(() => ({ open: !!document.getElementById("mobile-sheet"), focus: document.activeElement.getAttribute("aria-controls") }));
// Slider by keyboard
await mob.focus('input[type="range"]');
await mob.keyboard.press("End");
out.slider = await mob.evaluate(() => document.querySelector('input[type="range"]').value);
console.log(JSON.stringify(out, null, 1));
await b.close();
