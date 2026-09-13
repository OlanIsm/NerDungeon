const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const out = path.resolve('.impeccable/review');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByRole('tab', { name: 'Hub', exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (const screen of ['Hub','Map','Bazaar','Armory']) {
    await page.getByRole('tab', { name: screen, exact: true }).click();
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(out, `web-phone-${screen.toLowerCase()}.png`) });
    if (screen === 'Armory') {
      await page.getByRole('button', { name: 'Rune Quill', exact: true }).click();
      await page.getByRole('button', { name: 'Equip Item', exact: true }).click();
      await page.getByText('Rune Quill dipilih untuk preview loadout.').waitFor();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByText('Adventurer’s Journal').waitFor({ state: 'hidden' });
      await page.waitForTimeout(250);
    }
  }
  await page.getByRole('tab', { name: 'Map', exact: true }).click();
  await page.getByRole('button', { name: 'Start Stage 2 (Battle!)', exact: true }).click();
  await page.screenshot({ path: path.join(out, 'web-phone-battle.png') });
  await page.getByRole('button', { name: /^B\./ }).click();
  await page.getByText('SALAH! −180 HP').waitFor();
  await page.getByRole('button', { name: 'Try Again' }).click();
  await page.getByRole('button', { name: /^A\./ }).click();
  await page.getByText('KRITIKAL! +350 DMG').waitFor();
  await page.getByRole('button', { name: 'Exit', exact: true }).click();
  await page.getByRole('tab', { name: 'Hub', exact: true }).click();
  await page.getByRole('button', { name: 'Forge Adventure', exact: true }).click();
  await page.getByText('Pilih study scroll terlebih dahulu.').waitFor();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByText('Adventurer’s Journal').waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({ path: path.join(out, 'web-phone-small.png') });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole('tab', { name: 'Map', exact: true }).click();
  await page.getByRole('tab', { name: 'Hub', exact: true }).click();
  const narrowSection = await page.getByText('Active Expeditions', { exact: true }).evaluate((title) => {
    const aside = [...document.querySelectorAll('*')].find(node => node.textContent === '2 In Progress');
    const titleBox = title.getBoundingClientRect();
    const asideBox = aside?.getBoundingClientRect();
    return { titleRight: titleBox.right, asideLeft: asideBox?.left, asideRight: asideBox?.right, viewport: window.innerWidth };
  });
  if (!narrowSection.asideRight || narrowSection.asideRight > narrowSection.viewport || narrowSection.titleRight > narrowSection.asideLeft) throw new Error(`Narrow heading overflow: ${JSON.stringify(narrowSection)}`);
  await page.screenshot({ path: path.join(out, 'web-phone-320-expeditions.png') });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('tab', { name: 'Map', exact: true }).click();
  await page.getByRole('tab', { name: 'Hub', exact: true }).click();
  await page.screenshot({ path: path.join(out, 'web-desktop.png') });
  console.log(JSON.stringify({ renderer: 'React Native Web preview; not native-device evidence', checked: ['4 tabs', 'battle entry/exit', 'wrong/correct answer feedback', 'item selection/equip', 'empty forge guard'], errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
