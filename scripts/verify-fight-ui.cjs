const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const appUrl = process.env.APP_URL ?? "http://localhost:8081";

(async () => {
  const output = path.resolve(".impeccable/review");
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 430, height: 932 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(appUrl, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page
      .getByLabel("Loading Nerdius", { exact: true })
      .waitFor({ state: "hidden" });
    await page.evaluate(() => document.fonts.ready);
    const button = (name) => page.getByRole("button", { name, exact: true });
    async function enter() {
      const expeditionTab = page.getByRole("tab", {
        name: "Expedition",
        exact: true,
      });
      if (await expeditionTab.count()) {
        await expeditionTab.click();
        await button("Open Biologi — Fotosintesis").click();
        await button("Open Chapter 1: Reaksi Terang").click();
      }
      await button("Start Adventure").click();
      await page.getByTestId("fight-player").waitFor();
    }
    async function state(name) {
      await page.waitForFunction(
        (value) =>
          document
            .querySelector('[data-testid="fight-state"]')
            ?.textContent.startsWith(value + " ·"),
        name,
        { timeout: 30000 },
      );
    }
    async function still() {
      const chunk = page.locator('[data-testid^="terrain-chunk-"]').first();
      const before = await chunk.boundingBox();
      await page.waitForTimeout(300);
      const after = await chunk.boundingBox();
      assert(Math.abs(before.x - after.x) < 0.1, "world must remain still");
    }
    await enter();
    const hero = await page.getByTestId("fight-player").boundingBox();
    assert(
      Math.abs((hero.y + hero.height) / 932 - 0.7) < 0.01,
      "hero feet fixed at 70%",
    );
    const first = page.getByTestId("terrain-chunk-0");
    const initial = await first.boundingBox();
    await page.waitForTimeout(350);
    assert((await first.boundingBox()).x < initial.x, "world moves leftward");
    const ground = await page.getByTestId("side-ground").evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { top: box.top, width: box.width };
    });
    assert(
      ground.width > 400 && Math.abs(ground.top / 932 - 0.7) < 0.05,
      "ground spans full width at hero feet",
    );
    await button("Debug controls").click();
    await button("Pause Scrolling").click();
    await still();
    assert.equal(
      await page.locator('[data-testid^="parallax-"]').count(),
      11,
      "all parallax layers mounted",
    );
    await button("Debug controls").click();
    await page.screenshot({
      path: path.join(output, "fight-side-view-430.png"),
    });
    await button("Debug controls").click();
    await button("Show Chunk Bounds").click();
    await button("Show Encounter Trigger").click();
    await button("Decrease Speed").click();
    assert(
      (await page.getByTestId("fight-state").textContent()).includes(
        "48 units/s",
      ),
    );
    await button("Increase Speed").click();
    await button("Resume Scrolling").click();
    await button("Trigger Encounter").click();
    await state("encounter");
    assert.equal(
      await page.locator('[data-testid^="fight-enemy-"]').count(),
      1,
    );
    await still();
    await button("Complete Encounter").click();
    await state("walking");
    await button("Exit").click();

    // Exercise the authored level, including two enemies and boss.
    await enter();
    await button("Debug controls").click();
    for (let i = 0; i < 4; i++) await button("Increase Speed").click();
    await state("encounter");
    assert.equal(
      await page.locator('[data-testid^="fight-enemy-"]').count(),
      1,
    );
    await button("Complete Encounter").click();
    await state("walking");
    await button("Pause Scrolling").click();
    await button("Debug controls").click();
    await page.screenshot({
      path: path.join(output, "fight-side-walk-430.png"),
    });
    await button("Debug controls").click();
    await button("Resume Scrolling").click();
    await state("encounter");
    assert.equal(
      await page.locator('[data-testid^="fight-enemy-"]').count(),
      2,
    );
    await button("Debug controls").click();
    await page.screenshot({
      path: path.join(output, "fight-encounter-430.png"),
    });
    await button("Debug controls").click();
    await button("Complete Encounter").click();
    await state("bossEncounter");
    await still();
    await button("Debug controls").click();
    await page.screenshot({ path: path.join(output, "fight-boss-430.png") });
    await page.setViewportSize({ width: 320, height: 800 });
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(output, "fight-boss-320.png") });
    const narrowHero = await page.getByTestId("fight-player").boundingBox();
    assert(
      Math.abs((narrowHero.y + narrowHero.height) / 800 - 0.7) < 0.01,
      "resized hero keeps anchor",
    );
    const overflow = await page
      .getByTestId("fight-page")
      .evaluate(
        (element) =>
          element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth,
      );
    assert(!overflow, "fight page must not scroll");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(150);
    await page.screenshot({
      path: path.join(output, "fight-boss-desktop.png"),
    });
    await button("Complete Encounter").click();
    await button("Continue trail").waitFor();
    await button("Continue trail").click();
    await page.waitForTimeout(400);
    assert.equal(
      await page.locator('[data-testid^="fight-enemy-"]').count(),
      0,
      "encounter actors cleaned up",
    );
    await button("Exit").click();
    await button("Back").click();
    await button("Back").click();
    await page.getByRole("tab", { name: "Expedition", exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log(
      "Fight UI: side view, leftward traversal, fixed hero, pause, debug controls, 1/2/boss encounters, result, resize and exit passed (web preview).",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
