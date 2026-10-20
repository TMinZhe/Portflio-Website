// Motion QA: frame pacing during a scripted scroll through the opening, under CPU
// throttling, plus WebGL draw counts to verify demand rendering goes idle.
import { chromium } from "playwright";

const URL = "http://localhost:3123/";
const gpu = process.env.GPU === "1";
const browser = await chromium.launch({
  args: gpu ? ["--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const init = () => {
  window.__draws = 0;
  for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) {
    for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
      const orig = C.prototype[fn];
      if (!orig) continue;
      C.prototype[fn] = function (...a) {
        window.__draws++;
        return orig.apply(this, a);
      };
    }
  }
};

async function run({ throttle, tier, width = 1280, height = 800 }) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.addInitScript(init);
  const cdp = await ctx.newCDPSession(page);
  await page.goto(URL + (tier ? `?tier=${tier}` : ""), { waitUntil: "networkidle" });
  const renderer = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).slice(0, 40) : "n/a";
  });
  await page.waitForTimeout(3000);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });

  // Scroll through hero + transformation with wheel events (like a user), sampling rAF intervals.
  const result = await page.evaluate(async () => {
    const intervals = [];
    let last = performance.now();
    let running = true;
    const loop = (t) => {
      intervals.push(t - last);
      last = t;
      if (running) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    const end = document.getElementById("work").offsetTop;
    const startDraws = window.__draws;
    for (let y = 0; y < end; y += 60) {
      window.scrollBy(0, 60);
      await new Promise((r) => requestAnimationFrame(r));
    }
    running = false;
    const sorted = [...intervals].sort((a, b) => a - b);
    const pct = (p) => sorted[Math.floor(sorted.length * p)];
    return {
      frames: intervals.length,
      p50: +pct(0.5).toFixed(1),
      p95: +pct(0.95).toFixed(1),
      max: +sorted[sorted.length - 1].toFixed(1),
      over33ms: intervals.filter((i) => i > 33.4).length,
      drawsDuringScroll: window.__draws - startDraws,
    };
  });

  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  // Idle in view (back at hero): settled scene should stop drawing unless traces run (high tier).
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(2500);
  const d0 = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(1500);
  const idleInView = (await page.evaluate(() => window.__draws)) - d0;
  // Off-screen: scroll to contact; no draws expected.
  await page.evaluate(() => document.getElementById("contact").scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(2500);
  const d1 = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(1500);
  const idleOffscreen = (await page.evaluate(() => window.__draws)) - d1;
  await ctx.close();
  return { renderer, throttle, tier: tier ?? "auto", ...result, idleInView1500ms: idleInView, idleOffscreen1500ms: idleOffscreen };
}

const rows = [];
for (const cfg of [
  { throttle: 1, tier: "high" },
  { throttle: 4, tier: "high" },
  { throttle: 6, tier: "low" },
  { throttle: 4, tier: "low", width: 390, height: 844 },
]) rows.push(await run(cfg));
console.table(rows);
await browser.close();
