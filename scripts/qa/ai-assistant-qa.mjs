// Usage: node scripts/qa/ai-assistant-qa.mjs <outDir>   (server on URL, default http://localhost:3123)
// AI Operations Assistant case study: layout at four widths, the chat demo's
// every path, the pipeline stepper, wording guards, and reduced motion.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "qa-out/ai";
fs.mkdirSync(out, { recursive: true });
const BASE = (process.env.URL ?? "http://localhost:3123").replace(/\/$/, "");
const CASE = "/projects/ai-operations-assistant";
const problems = [];
const passed = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
const check = (where, ok, msg) => (ok ? passed.push(`${where}: ${msg}`) : fail(where, msg));

const browser = await chromium.launch({ channel: process.env.CHANNEL ?? "chrome" });

async function open(ctx, p, where) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(where, `page error ${e}`));
  page.on("console", (m) => m.type() === "error" && fail(where, `console ${m.text()}`));
  const res = await page.goto(BASE + p, { waitUntil: "networkidle" });
  return { page, status: res?.status() };
}

async function revealAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
}

// 1. Layout at four widths, beginner and fully expanded.
for (const w of [375, 768, 1280, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 900 : 1000 }, isMobile: w < 800, hasTouch: w < 800 });
  for (const p of ["/", CASE]) {
    const where = `${p} @${w}`;
    const { page } = await open(ctx, p, where);
    await revealAll(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(where, overflow <= 0, `no horizontal overflow (${overflow}px)`);
    await page.screenshot({ path: path.join(out, `${p === "/" ? "home" : "case"}-${w}.png`), fullPage: true });
    if (p === CASE) {
      for (const id of ["overview", "problem", "try", "how", "engineering", "impact"]) {
        const el = page.locator(`#${id}`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        await el.screenshot({ path: path.join(out, `c-${w}-${id}.png`) });
      }
      await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => (d.open = true)));
      await page.waitForTimeout(200);
      const o2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(where, o2 <= 0, `no horizontal overflow with every disclosure open (${o2}px)`);
    }
    await page.close();
  }
  await ctx.close();
}

// 2. Homepage placement, old URL, wording.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "site";
  const { page } = await open(ctx, "/", where);
  const titles = await page.locator('#work h3[id^="p-"]').allInnerTexts();
  check(where, titles[0]?.includes("Inventory") && titles[1]?.includes("AI Operations Assistant"), `featured order: ${titles.join(" | ")}`);
  const card = page.locator("#work article").nth(1);
  const cardText = await card.innerText();
  check(where, /Interface recreation/i.test(cardText) && /Production-deployed and used daily/.test(cardText), "homepage card labels the recreation and states production use");
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await card.screenshot({ path: path.join(out, "home-card-1280.png") });
  // A separate page without the console listener: the 404 page logs its own 404.
  const probe = await ctx.newPage();
  const old = await probe.goto(BASE + "/projects/nl-analytics-assistant");
  check(where, old?.status() === 404, `old URL returns 404 (${old?.status()})`);
  await probe.close();
  await page.goto(BASE + CASE, { waitUntil: "networkidle" });
  const body = await page.locator("main").innerText();
  // Includes text inside closed disclosures.
  const all = (await page.locator("main").textContent()) ?? "";
  check(where, !/\bRAG\b|retrieval-augmented|text-to-SQL|fine-tun|hallucination-proof/i.test(body), "no RAG / text-to-SQL / fine-tuning / hallucination-proof claims");
  check(where, !/WhatsApp[^.]*(live|deployed and)/i.test(all) && /WhatsApp channel is built but not deployed/.test(all), "WhatsApp described as not deployed");
  check(where, /dry-run/.test(all), "automatic purchase orders described as dry-run");
  check(where, !/RAG|retrieval-augmented|text-to-SQL|fine-tun|hallucination-proof/i.test(all), "no forbidden claims even inside disclosures");
  check(where, (body.match(/Qwen3-8B/g) ?? []).length > 0 && !/runs? (on )?Qwen3-8B/i.test(body), "Qwen3-8B mentioned only as the earlier benchmarked setup");
  const toc = (await page.locator("nav[aria-label='On this page']").innerText()).replace(/\s+/g, " ");
  for (const s of ["Overview", "The problem", "Try the assistant", "How it works", "Behind the engineering", "Impact and reflection"]) check(where, toc.includes(s), `chapter nav has "${s}"`);
  check(where, /not a hardware-only comparison/.test(body), "latency caveat visible without opening anything");
  await ctx.close();
}

// 3. Chat demo, every path.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "chat";
  const { page } = await open(ctx, CASE, where);
  const chat = page.locator("#try");
  const log = chat.getByRole("log");
  const said = async (re) => {
    await page.waitForFunction((src) => new RegExp(src).test(document.querySelector("#try [role=log]").innerText), re.source, { timeout: 4000 }).catch(() => {});
    return re.test(await log.innerText());
  };
  await chat.scrollIntoViewIfNeeded();
  await chat.getByRole("button", { name: "How did Store A perform last week?" }).click();
  check(where, await said(/\$2,450\.00 in sales from 312 transactions/), "Store A weekly sales answer");
  check(where, /Understood as Sales summary · Store A · last week/.test(await log.innerText()), "shows what was understood");
  await chat.getByRole("button", { name: "What about Store B?" }).click();
  check(where, await said(/Store B recorded \$1,890\.40/), "follow-up answers for Store B");
  check(where, /intent and period carried over/.test(await log.innerText()), "follow-up explains what carried over");
  await chat.screenshot({ path: path.join(out, "demo-chat-followup.png") });
  await chat.getByRole("button", { name: "Which products need restocking?" }).click();
  check(where, await said(/products at Store B are below their reorder point/), "restocking reuses the conversation's store");
  await chat.getByRole("button", { name: "Show the stock for Harbour." }).click();
  check(where, await said(/two stores matching .Harbour.\. Which one did you mean\?/), "ambiguous store gets a question");
  await chat.screenshot({ path: path.join(out, "demo-chat-clarify.png") });
  await chat.getByRole("button", { name: "Harbour West" }).click();
  check(where, await said(/Stock at Harbour West/), "clarification choice answers");
  await chat.getByRole("button", { name: "What's the profit for Store A?" }).click();
  check(where, await said(/Gross profit\s*\$4,333\.50/), "profit answer");
  await chat.getByRole("button", { name: "Which products are bought together?" }).click();
  check(where, await said(/bought together at Store A/), "bought-together answer");
  await chat.getByRole("button", { name: "Show sales for the last 30 days." }).click();
  check(where, await said(/\$10,120\.60 in sales/), "30-day sales answer");
  await chat.getByRole("button", { name: /Reset conversation/ }).click();
  check(where, /Pick a question below/.test(await log.innerText()), "reset clears the conversation");
  // Keyboard only.
  await chat.getByRole("button", { name: "What's the profit for Store A?" }).focus();
  await page.keyboard.press("Enter");
  check(where, await said(/Gross profit/), "chat works from the keyboard");
  await ctx.close();
}

// 4. Pipeline stepper.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const where = "pipeline";
  const { page } = await open(ctx, CASE, where);
  const pl = page.locator("#how");
  const next = pl.getByRole("button", { name: /^Next/ });
  await pl.scrollIntoViewIfNeeded();
  check(where, /Step 1 of 5/.test(await pl.innerText()), "starts at step 1");
  await next.click();
  await pl.getByRole("button", { name: /Show the structured output/ }).click();
  check(where, /"intent": "sales_summary"/.test(await pl.innerText()) && /real field names differ/.test(await pl.innerText()), "structured output is optional and labelled as simplified");
  await next.click();
  check(where, /Store A is a known store/.test(await pl.innerText()), "validation step lists the checks");
  await next.click();
  check(where, /\+12\.4%/.test(await pl.innerText()), "calculation step shows the arithmetic");
  await next.focus();
  await page.keyboard.press("Enter");
  check(where, /AI understands the question\. Deterministic code calculates the answer\./.test(await pl.innerText()), "completion takeaway (keyboard)");
  await pl.locator("[data-reveal]").first().screenshot({ path: path.join(out, "demo-pipeline-done.png") });
  await pl.getByRole("button", { name: /Restart/ }).click();
  check(where, /Step 1 of 5/.test(await pl.innerText()), "restart returns to step 1");
  await ctx.close();
}

// 5. Reduced motion.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: "reduce" });
  const where = "reduced-motion";
  const { page } = await open(ctx, CASE, where);
  const hidden = await page.evaluate(() => [...document.querySelectorAll("[data-reveal]")].filter((e) => getComputedStyle(e).opacity === "0").length);
  check(where, hidden === 0, `no content left hidden (${hidden})`);
  const chat = page.locator("#try");
  await chat.getByRole("button", { name: "How did Store A perform last week?" }).click();
  await page.waitForTimeout(100);
  check(where, /\$2,450\.00/.test(await chat.getByRole("log").innerText()), "chat answers immediately with reduced motion");
  await ctx.close();
}

await browser.close();
console.log(passed.map((p) => `PASS ${p}`).join("\n"));
console.log(problems.length ? `\n${problems.length} problem(s):\n${problems.join("\n")}` : "\nAll checks passed.");
process.exit(problems.length ? 1 : 0);
