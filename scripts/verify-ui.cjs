const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const output = path.resolve(".impeccable/review");
const report = { checked: [], failures: [], pageErrors: [], consoleErrors: [], performance: {} };
const biology = "Biologi — Fotosintesis";

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const edge = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
  const browser = await chromium.launch({ headless: true, ...(edge ? { executablePath: edge } : { channel: "msedge" }), args: ["--enable-precise-memory-info"] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  page.setDefaultTimeout(10000);
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") report.consoleErrors.push(message.text()); });
  const button = (name) => page.getByRole("button", { name, exact: true });
  const tab = (name) => page.getByRole("tab", { name, exact: true });
  async function check(name, action) {
    try { await action(); report.checked.push(name); console.log("PASS " + name); return true; }
    catch (error) { report.failures.push({ name, message: error.message }); console.error("FAIL " + name + ": " + error.message); return false; }
  }
  async function ready() {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].filter((img) => img.getClientRects().length).every((img) => img.complete && img.naturalWidth));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  async function start() {
    await page.goto(process.env.APP_URL ?? "http://localhost:8081", { waitUntil: "networkidle", timeout: 120000 });
    await page.getByLabel("Loading Nerdius", { exact: true }).waitFor({ state: "hidden" }); await ready();
  }
  async function scroll(bottom = false) {
    await page.evaluate((end) => {
      const scroller = [...document.querySelectorAll("div")].find((el) => el.getBoundingClientRect().height && /auto|scroll/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight);
      if (scroller) scroller.scrollTop = end ? scroller.scrollHeight : 0;
    }, bottom);
    await ready();
  }
  async function go(name) { await tab(name).click(); await scroll(); assert.equal(await tab(name).getAttribute("aria-selected"), "true"); }
  async function shot(name) { await page.screenshot({ path: path.join(output, "nerdius-" + name + ".png") }); }
  async function close(text) {
    await page.getByText(text, { exact: typeof text === "string" }).waitFor();
    await button("Continue").click(); await button("Continue").waitFor({ state: "hidden" });
  }
  async function hub() {
    for (let i = 0; i < 2 && await button("Back").isVisible(); i++) await button("Back").click();
    await go("Hub");
  }
  async function workflow(name, action) {
    if (!await check(name, action)) { await shot("failure-" + name.replace(/\W+/g, "-")); await start(); }
  }
  async function layout(name, shell = true) {
    await check(name + " layout", async () => {
      const issues = await page.evaluate((hasShell) => {
        const errors = [], width = innerWidth;
        if (document.documentElement.scrollWidth > width + 1 || document.body.scrollWidth > width + 1) errors.push("Viewport horizontal overflow");
        for (const el of document.querySelectorAll('[role="button"],[role="tab"]')) {
          const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
          const label = el.getAttribute("aria-label") || el.textContent.trim().slice(0, 45);
          if (r.width < 47.5 || r.height < 47.5) errors.push(label + ": touch " + r.width.toFixed(1) + "x" + r.height.toFixed(1));
          if (!el.closest('[aria-label="Choose study material"]') && (r.left < -1 || r.right > width + 1)) errors.push(label + ": clipped horizontally");
        }
        for (const el of document.querySelectorAll("div")) {
          if (!el.getBoundingClientRect().width) continue; const style = getComputedStyle(el);
          if (/auto|scroll/.test(style.overflowY) && el.scrollWidth > el.clientWidth + 1) errors.push("Page scroller overflows horizontally");
          if (el.getAttribute("dir") === "auto" && el.scrollWidth > el.clientWidth + 2 && style.textOverflow !== "ellipsis" && style.webkitLineClamp === "none") errors.push("Clipped text: " + el.textContent.slice(0, 60));
        }
        const nav = document.querySelector('[aria-label="Main navigation"]');
        const profile = document.querySelector('[aria-label="Open player profile"]');
        if (hasShell) {
          const h = profile.parentElement.getBoundingClientRect(), n = nav.getBoundingClientRect(), p = nav.previousElementSibling.getBoundingClientRect();
          if (p.top < h.bottom - 1 || p.bottom > n.top + 1 || n.bottom > innerHeight + 1) errors.push("Header/page/navigation overlap");
          if (nav.querySelectorAll('[role="tab"]').length !== 4) errors.push("Missing navigation");
          if (width > 700 && nav.parentElement.getBoundingClientRect().width > 560) errors.push("Desktop shell too wide");
        } else if (nav || profile) errors.push("Nested route unexpectedly retains shell navigation");
        return [...new Set(errors)];
      }, shell);
      assert.deepEqual(issues, []);
    });
  }
  async function grid(count) {
    const slots = page.getByLabel("Bag items", { exact: true }).getByRole("button");
    assert.equal(await slots.count(), count);
    const boxes = await slots.evaluateAll((items) => items.map((el) => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), width: r.width, height: r.height }; }));
    const rows = new Map();
    for (const box of boxes) { assert(Math.abs(box.width - box.height) <= 1, "Inventory slots must be square"); rows.set(box.top, (rows.get(box.top) ?? 0) + 1); }
    assert([...rows.values()].every((columns) => columns === 4), "Inventory must have four columns");
  }
  async function states() {
    const nodes = page.getByLabel("Adventure path", { exact: true }).getByRole("button");
    assert.equal(await nodes.count(), 3);
    for (const [i, state] of ["Completed", "Current", "Available"].entries()) {
      assert((await nodes.nth(i).textContent()).includes(state), "Chapter " + (i + 1) + ": expected " + state);
      assert.equal(await nodes.nth(i).getAttribute("aria-selected"), i === 1 ? "true" : "false");
    }
  }
  async function perf(name) {
    report.performance[name] = await page.evaluate(() => {
      const images = [...document.images], unique = new Map(images.map((img) => [img.currentSrc || img.src, img]));
      const pixels = [...unique.values()].reduce((sum, img) => sum + img.naturalWidth * img.naturalHeight, 0);
      return { mountedImages: images.length, uniqueImages: unique.size, uniqueNaturalPixels: pixels, decodedEstimateMiB: +(pixels * 4 / 1048576).toFixed(2), devHeapMiB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(2) : null };
    });
  }
  async function observeMotion() {
    await page.evaluate(() => {
      const el = document.querySelector('[aria-label="Main navigation"]').previousElementSibling;
      window.__motion = [];
      window.__motionObserver = new MutationObserver(() => { const s = getComputedStyle(el), m = new DOMMatrixReadOnly(s.transform === "none" ? undefined : s.transform); window.__motion.push({ opacity: +s.opacity, x: m.e, scale: m.a }); });
      window.__motionObserver.observe(el, { attributes: true, attributeFilter: ["style"] });
    });
  }
  async function motion() { return page.evaluate(() => { window.__motionObserver.disconnect(); return window.__motion; }); }
  const moving = (frame) => frame.opacity < 0.999 || Math.abs(frame.x) > 0.01 || Math.abs(frame.scale - 1) > 0.001;

  try {
    await start(); await perf("startupHub");
    for (const [width, height] of [[320, 800], [375, 844], [390, 844], [414, 896], [1440, 1000]]) {
      await page.setViewportSize({ width, height });
      for (const screen of ["Hub", "Expedition", "Bazaar", "Bag"]) {
        await go(screen); await shot(width + "-" + screen); await layout(width + "px " + screen);
        if (screen === "Expedition") await check(width + "px chapter states", states);
        if (screen === "Bag") await check(width + "px inventory grid", () => grid(24));
        if (screen === "Bag" || screen === "Bazaar") { await scroll(true); await shot(width + "-" + screen + "-lower"); await layout(width + "px " + screen + " lower"); }
      }
      if (width === 320) await perf("afterAllTabs");
      await go("Expedition"); await button("Open " + biology).click(); await ready();
      await shot(width + "-Region"); await layout(width + "px Region", false); await check(width + "px Region states", states);
      await button("Open Chapter 2: Siklus Calvin").click(); await ready();
      await shot(width + "-RegionDetail"); await layout(width + "px RegionDetail", false);
      await scroll(true); await shot(width + "-RegionDetail-lower"); await layout(width + "px RegionDetail lower", false);
      await button("Back").click(); await button("Back").click();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await workflow("reduced motion route and journal", async () => {
      await hub(); assert(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches));
      await observeMotion(); await go("Expedition"); assert(!(await motion()).some(moving), "Reduced-motion route animates");
      await button("Open player profile").click(); await button("Continue").waitFor();
      const animations = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").map((a) => a.animationName));
      await shot("390-reduced-journal"); assert.deepEqual(animations, [], "Reduced-motion modal animates"); await close(/Nerd Mage.*Level 5 Scholar/);
    });
    await workflow("inventory selection tabs and expansion", async () => {
      await go("Bag"); await button("Quill Staff").click(); assert.equal(await button("Quill Staff").getAttribute("aria-selected"), "true");
      await page.getByLabel("Selected item details", { exact: true }).getByText("Quill Staff", { exact: true }).waitFor();
      await tab("Potions").click(); await grid(8); assert.equal(await page.getByLabel("Bag items", { exact: true }).locator('[aria-selected="true"]').count(), 0);
      await button("HP Elixir").click(); await go("Hub"); await go("Bag");
      assert.equal(await tab("Potions").getAttribute("aria-selected"), "true"); assert.equal(await button("HP Elixir").getAttribute("aria-selected"), "true");
      await scroll(true); await shot("390-Bag-potions"); await button("Weapon: Quill Staff").click();
      assert.equal(await tab("Equipment").getAttribute("aria-selected"), "true"); assert.equal(await button("Quill Staff").getAttribute("aria-selected"), "true"); await grid(24);
      await button("Expand").click(); await close("Bag expansion preview. Kapasitas belum berubah."); await page.getByText("24/40", { exact: true }).waitFor();
    });
    await workflow("vault tabs lore relics and both summons", async () => {
      await go("Bazaar"); await button("Inspect Lore").click(); await close("An ancient brass-bound vault filled with scholar relics.");
      await button("Inspect Quill Staff").click(); await close("Quill Staff · Relic preview.");
      for (const text of ["Common 55%", "Rare 35%", "Epic 8%", "Legendary 2%"]) await page.getByLabel("Loot probabilities", { exact: true }).getByText(text, { exact: true }).waitFor();
      await button("Summon 1").click(); await close(/Preview summon: Quill of Wisdom/);
      await button("Summon 10").click(); await close(/Summoning dan pembelian belum terhubung ke backend/);
      await page.getByLabel("1,450 Gold", { exact: true }).waitFor(); await page.getByLabel("320 Gems", { exact: true }).waitFor();
      await tab("Spell Scrolls").click(); await page.getByText("Grand Scholar Scrolls", { exact: true }).waitFor(); await go("Hub"); await go("Bazaar");
      assert.equal(await tab("Spell Scrolls").getAttribute("aria-selected"), "true"); await shot("390-Bazaar-scrolls"); await tab("Armory & Relics").click();
    });
    await workflow("PDF DOCX validation and forge", async () => {
      await go("Hub"); assert.equal(await button("Forge Adventure").count(), 0);
      async function choose(name, mimeType, buffer) { const chooser = page.waitForEvent("filechooser"); await button("Browse study files").click(); await (await chooser).setFiles({ name, mimeType, buffer }); }
      for (const [name, mime, size] of [["notes.pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation", 10], ["oversize.pdf", "application/pdf", 25 * 1024 * 1024 + 1]]) {
        await choose(name, mime, Buffer.alloc(size)); await close("Pilih PDF atau DOCX dengan ukuran maksimal 25 MB."); assert.equal(await button("Forge Adventure").count(), 0);
      }
      await choose("study.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", Buffer.from("preview"));
      await page.getByText("study.docx", { exact: true }).waitFor(); await button("Forge Adventure").waitFor();
      await choose("notes.pdf", "application/pdf", Buffer.from("preview")); await page.getByText("notes.pdf", { exact: true }).waitFor(); await shot("390-upload-selected");
      await button("Forge Adventure").click(); await page.getByLabel("Nerd eating PDF", { exact: true }).waitFor();
      const sources = await page.getByLabel("Nerd eating PDF", { exact: true }).locator("img").evaluateAll((images) => images.map((img) => img.src));
      assert(sources.length && sources.every((src) => !/\.gif(?:\?|$)/i.test(src)), "Reduced-motion forge must use static art");
      await shot("390-forging"); await page.getByText("Your Expeditions", { exact: true }).waitFor(); assert.equal(await tab("Expedition").getAttribute("aria-selected"), "true");
      await go("Hub"); await page.getByText("notes.pdf", { exact: true }).waitFor();
    });
    await workflow("continue selected chapter battle and return", async () => {
      await go("Hub"); await button("Continue Adventure").click(); await page.getByText("Chapter 2: Siklus Calvin", { exact: true }).waitFor();
      await button("Back").click(); await button("Back").click(); await button("Select SOLID Principles").click();
      assert.equal(await button("Select SOLID Principles").getAttribute("aria-selected"), "true");
      await button("Open Chapter 3: Dependency Inversion").click(); assert.equal(await button("Open Chapter 3: Dependency Inversion").getAttribute("aria-selected"), "true");
      await button("View chapter").click(); await page.getByText("Chapter 3: Dependency Inversion", { exact: true }).waitFor();
      await page.getByText("SOLID Principles", { exact: true }).waitFor();
      await page.route(/parallax(%20| )backgound/, async (route) => { await new Promise((resolve) => setTimeout(resolve, 300)); await route.continue(); });
      await button("Start Adventure").click(); await page.getByLabel("Loading fight assets", { exact: true }).waitFor(); await shot("390-fight-loading");
      await page.getByTestId("fight-player").waitFor({ timeout: 30000 }); await page.unroute(/parallax(%20| )backgound/); await shot("390-Battle");
      await button("Debug controls").click(); if (await button("Trigger Encounter").isEnabled()) await button("Trigger Encounter").click();
      await button("Complete Encounter").click(); await page.getByText("Path cleared!", { exact: true }).waitFor(); await button("Exit").click();
      await page.getByText("Chapter 3: Dependency Inversion", { exact: true }).waitFor(); await hub(); await button("Continue Adventure").click();
      await page.getByText("Chapter 3: Dependency Inversion", { exact: true }).waitFor(); await page.getByText("SOLID Principles", { exact: true }).waitFor(); await hub();
    });
    await workflow("normal motion transition", async () => {
      await hub(); await page.emulateMedia({ reducedMotion: "no-preference" }); await page.waitForTimeout(50); await observeMotion();
      await tab("Expedition").click(); await page.waitForTimeout(260); const samples = await motion();
      assert(samples.some(moving), "Normal route should animate"); assert(!moving(samples.at(-1)), "Transition must settle"); await shot("390-normal-motion-settled");
    });
    await perf("afterWorkflows"); await check("no browser runtime errors", async () => assert.deepEqual(report.pageErrors, []));
  } catch (error) { report.failures.push({ name: "suite interrupted", message: error.message }); }
  finally {
    report.renderer = "React Native Web / Edge development bundle; heap and decoded estimates are not native-device measurements.";
    fs.writeFileSync(path.join(output, "nerdius-results.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ passed: report.checked.length, failures: report.failures, performance: report.performance, pageErrors: report.pageErrors }, null, 2));
    await browser.close(); if (report.failures.length || report.pageErrors.length) process.exitCode = 1;
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
