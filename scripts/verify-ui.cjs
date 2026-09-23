const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const appUrl = process.env.APP_URL ?? "http://localhost:8081";

(async () => {
  const out = path.resolve(".impeccable/review");
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  await page.route(/parallax(%20| )backgound/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(appUrl, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.getByLabel("Loading Nerdius", { exact: true }).waitFor({
    state: "hidden",
  });
  await page.getByRole("tab", { name: "Hub", exact: true }).waitFor();
  await page.getByLabel("Claimed expedition").waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (const screen of ["Hub", "Expedition", "Bazaar", "Bag"]) {
    await page.getByRole("tab", { name: screen, exact: true }).click();
    await page.waitForFunction(() =>
      [...document.images].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(out, `web-phone-${screen.toLowerCase()}.png`),
    });
    if (screen === "Hub")
      await page
        .getByLabel("Claimed expedition")
        .screenshot({ path: path.join(out, "web-phone-claimed.png") });
    if (screen === "Bag") {
      await page
        .getByRole("button", { name: "Quill Staff", exact: true })
        .click();
      if (await page.getByText("Scholar Class", { exact: false }).count())
        throw new Error("Old Bag identity still visible");
      for (const meter of ["HP", "MP"])
        await page.getByText(meter, { exact: true }).waitFor();
      if ((await page.getByLabel("Bag items").locator("img").count()) !== 24)
        throw new Error("Equipment sprites missing");
      await page.getByText("Potions", { exact: true }).click();
      await page
        .getByRole("button", { name: "HP Elixir", exact: true })
        .waitFor();
      if ((await page.getByLabel("Bag items").locator("img").count()) !== 8)
        throw new Error("Potion sprites missing");
      await page.waitForFunction(() =>
        [...document.images].every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
      );
      await page.screenshot({
        path: path.join(out, "web-phone-bag-potions.png"),
      });
      await page.getByText("Equipment", { exact: true }).click();
      await page.getByRole("button", { name: "Expand", exact: true }).click();
      await page
        .getByText("Bag expansion preview. Kapasitas belum berubah.")
        .waitFor();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.getByText("Adventurer’s Journal").waitFor({ state: "hidden" });
      await page.waitForTimeout(250);
    }
  }
  await page.getByRole("tab", { name: "Hub", exact: true }).click();
  const cachedHubReady = await page.evaluate(() =>
    [...document.images]
      .filter((image) => image.offsetParent !== null)
      .every((image) => image.complete && image.naturalWidth > 0),
  );
  if (!cachedHubReady) throw new Error("Hub images reloaded after tab switch");
  await page.getByRole("tab", { name: "Expedition", exact: true }).click();
  await page
    .getByRole("button", { name: "Open Biologi — Fotosintesis", exact: true })
    .click();
  await page.screenshot({ path: path.join(out, "web-phone-regions.png") });
  await page
    .getByRole("button", {
      name: "Open Chapter 1: Reaksi Terang",
      exact: true,
    })
    .click();
  await page.screenshot({
    path: path.join(out, "web-phone-region-detail.png"),
  });
  await page
    .getByRole("button", { name: "Start Adventure", exact: true })
    .click();
  await page.getByLabel("Loading fight assets", { exact: true }).waitFor();
  await page.waitForTimeout(100);
  await page.screenshot({
    path: path.join(out, "web-phone-fight-loading.png"),
  });
  await page
    .getByRole("button", { name: "Debug controls", exact: true })
    .waitFor();
  await page.screenshot({ path: path.join(out, "web-phone-battle.png") });
  await page
    .getByRole("button", { name: "Debug controls", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Trigger Encounter", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Complete Encounter", exact: true })
    .click();
  await page.getByText("Path cleared!", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Exit", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("tab", { name: "Hub", exact: true }).click();
  if (
    await page
      .getByRole("button", { name: "Forge Adventure", exact: true })
      .count()
  )
    throw new Error("Forge action visible before upload");
  const fileChooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Browse study files", exact: true })
    .click();
  await (
    await fileChooser
  ).setFiles({
    name: "notes.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("preview"),
  });
  await page
    .getByRole("button", { name: "Forge Adventure", exact: true })
    .waitFor();
  await page.getByLabel("Selected PDF", { exact: true }).waitFor();
  await page.waitForFunction(() =>
    [...document.images].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({ path: path.join(out, "web-phone-small.png") });
  await page
    .getByRole("button", { name: "Forge Adventure", exact: true })
    .click();
  await page.getByLabel("Nerd eating PDF", { exact: true }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "web-phone-forging.png") });
  await page.getByText("Your Expeditions", { exact: true }).waitFor();
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole("tab", { name: "Hub", exact: true }).click();
  const narrowSection = await page
    .getByText("Active Expeditions", { exact: true })
    .evaluate((title) => {
      const titleBox = title.getBoundingClientRect();
      return {
        titleLeft: titleBox.left,
        titleRight: titleBox.right,
        viewport: window.innerWidth,
      };
    });
  if (
    narrowSection.titleLeft < 0 ||
    narrowSection.titleRight > narrowSection.viewport
  )
    throw new Error(
      `Narrow heading overflow: ${JSON.stringify(narrowSection)}`,
    );
  await page.screenshot({
    path: path.join(out, "web-phone-320-expeditions.png"),
  });
  await page.getByRole("tab", { name: "Bag", exact: true }).click();
  await page.waitForFunction(() =>
    [...document.images].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  for (const label of ["Quiz ATK", "Ward DEF", "Free Clues"]) {
    const box = await page.getByLabel(`${label} stat`).boundingBox();
    if (!box || Math.abs(box.width - box.height) > 1)
      throw new Error(`Stat not square: ${label} ${JSON.stringify(box)}`);
  }
  for (const [panelLabel, targets] of [
    [
      "Bag profile panel",
      [
        page.getByText("HP", { exact: true }),
        page.getByText("MP", { exact: true }),
        page.getByText("Character art", { exact: true }),
      ],
    ],
    [
      "Bag inventory panel",
      [
        page.getByRole("tab", { name: "Equipment", exact: true }),
        page.getByRole("tab", { name: "Potions", exact: true }),
        page.getByRole("button", { name: "Expand", exact: true }),
        page.getByRole("button", { name: "Blue Mage Robe", exact: true }),
      ],
    ],
  ]) {
    const panel = await page.getByLabel(panelLabel).boundingBox();
    if (!panel) throw new Error(`Missing ${panelLabel}`);
    for (const target of targets) {
      const box = await target.boundingBox();
      if (
        !box ||
        box.x < panel.x + 18 ||
        box.x + box.width > panel.x + panel.width - 18 ||
        box.y < panel.y + 18 ||
        box.y + box.height > panel.y + panel.height - 18
      ) {
        throw new Error(`Unsafe zone in ${panelLabel}: ${JSON.stringify(box)}`);
      }
    }
  }
  await page.screenshot({ path: path.join(out, "web-phone-320-bag.png") });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("tab", { name: "Expedition", exact: true }).click();
  await page.getByRole("tab", { name: "Hub", exact: true }).click();
  await page.screenshot({ path: path.join(out, "web-desktop.png") });
  await page.getByRole("tab", { name: "Bag", exact: true }).click();
  await page.screenshot({ path: path.join(out, "web-desktop-bag.png") });
  console.log(
    JSON.stringify(
      {
        renderer: "React Native Web preview; not native-device evidence",
        checked: [
          "4 tabs",
          "fight entry/exit and encounter completion",
          "fight asset loading gate",
          "Bag tabs and expansion",
          "warm tab images after navigation",
          "Expedition → Region → Detail → fight flow",
          "forge loading and Expedition navigation",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
