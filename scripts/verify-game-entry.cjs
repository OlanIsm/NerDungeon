const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('@playwright/test');
const state = { gold: 1450, gems: 1450, xp: 1771, favor: 3,
  inventory: ['Blue Mage Robe', 'Quill Staff', 'Spectacles', 'HP Elixir'],
  expeditions: [{ id: 'test', title: 'Walk Test', file: 'walk.pdf', progress: 0, regions: [{ chapter: 1, title: 'Forest', summary: 'Walk', topics: ['Walk'], questions: 1, enemies: 1 }] }],
  lastAdventure: { expeditionId: 'test', chapter: 1 } };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
    const errors = [], assets = [], actions = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().includes('.webp')) assets.push(response.url()); });
    await page.route('**/api/game', route => {
      if (route.request().method() === 'POST') {
        const action = route.request().postDataJSON(); actions.push(action);
        if (action.action === 'summon') { state.gems -= action.count === 10 ? 900 : 100; state.rewards = Array(action.count).fill('Quill Staff'); }
        if (action.action === 'complete') state.expeditions[0].progress = 100;
      }
      return route.fulfill({ json: state });
    });
    await page.route('**/api/game/forge', route => {
      assert(route.request().postDataBuffer().includes(Buffer.from('%PDF')), 'native File reaches multipart upload');
      state.expeditions.push({ ...state.expeditions[0], id: 'upload', title: 'Uploaded Notes', file: 'notes.pdf' });
      return route.fulfill({ json: state });
    });
    await page.goto(process.env.APP_URL || 'http://localhost:5173', { waitUntil: 'networkidle' });
    await page.getByText('The Study Forge', { exact: true }).waitFor();
    assert.equal(await page.locator('canvas').count(), 0, 'engine stays outside React shell');
    fs.mkdirSync('test-results', { recursive: true });
    await page.screenshot({ path: 'test-results/react-hub.png' });
    await page.getByRole('tab', { name: 'Bag', exact: true }).click();
    await page.getByRole('button', { name: 'Quill Staff', exact: true }).click();
    await page.getByLabel('Selected item details').getByText('Quill Staff', { exact: true }).waitFor();
    await page.getByRole('tab', { name: 'Potions', exact: true }).click();
    assert.equal(await page.getByLabel('Bag items').getByRole('button').count(), 1, 'one potion category item retained');
    await page.getByRole('tab', { name: 'Bazaar', exact: true }).click();
    await page.getByRole('button', { name: 'Summon 10x', exact: true }).click();
    await page.getByRole('dialog').getByText(/^You received:/).waitFor();
    assert.equal(actions.find(action => action.action === 'summon').count, 10, 'Summon 10x sends ten pulls');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Summon 1x', exact: true }).click();
    await page.getByRole('dialog').getByText(/^You received:/).waitFor();
    assert.deepEqual(actions.filter(action => action.action === 'summon').map(action => action.count), [10, 1]);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('tab', { name: 'Expedition', exact: true }).click();
    await page.getByRole('button', { name: 'Open Chapter 1: Forest', exact: true }).click();
    await page.getByRole('button', { name: 'View chapter', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('tab', { name: 'Hub', exact: true }).click();
    await page.getByLabel('Study file', { exact: true }).setInputFiles({ name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nnotes') });
    await page.getByRole('button', { name: 'Forge Adventure', exact: true }).click();
    await page.getByRole('button', { name: 'Select Uploaded Notes', exact: true }).waitFor();
    await page.getByRole('tab', { name: 'Hub', exact: true }).click();
    async function enter() {
      await page.getByRole('button', { name: 'Continue Adventure', exact: true }).click();
      await page.getByRole('button', { name: 'Start Adventure', exact: true }).click();
      await page.getByTestId('gate-loading').waitFor();
      const gate = await page.getByTestId('gate-loading').boundingBox();
      assert.equal(gate.y, 0, 'gate fills viewport without inherited scroll');
      assert.equal(gate.height, 932);
      await page.screenshot({ path: 'test-results/gate-closed.png' });
      await page.getByTestId('gate-loading').waitFor({ state: 'hidden' });
      const held = await page.getByTestId('fight-page').evaluate(element => performance.now() - Number(element.dataset.loadingStarted));
      assert(held >= 1500, 'closed doors hold for loading minimum');
      await page.getByTestId('gate-opening').waitFor({ state: 'hidden' });
      assert.equal(await page.locator('canvas').count(), 1, 'one Phaser instance');
    }
    await enter();
    const world = page.getByTestId('phaser-world');
    assert.equal(await world.getAttribute('data-renderer'), 'WebGL');
    const first = await world.getAttribute('data-walk-frame');
    await page.waitForTimeout(150);
    assert.notEqual(await world.getAttribute('data-walk-frame'), first, 'Phaser walk animation advances');
    const urls = JSON.parse(await world.getAttribute('data-layers'));
    assert.equal(urls.length, 11);
    assert(urls.every(url => url.includes('.webp')), 'all parallax textures are WebP');
    assert(urls.every(url => assets.includes(url)), 'all textures loaded by Phaser');
    await page.getByRole('button', { name: 'Debug controls', exact: true }).click();
    await page.getByRole('button', { name: 'Pause Scrolling', exact: true }).click();
    const stopped = await world.getAttribute('data-walk-frame');
    await page.waitForTimeout(250);
    assert.equal(await world.getAttribute('data-walk-frame'), stopped, 'paused sprite freezes');
    await page.getByRole('button', { name: 'Resume Scrolling', exact: true }).click();
    await page.getByRole('button', { name: 'Debug controls', exact: true }).click();
    await page.screenshot({ path: 'test-results/phaser-game.png' });
    for (let encounter = 0; encounter < 3; encounter++) {
      await page.getByRole('button', { name: 'Complete Encounter', exact: true }).waitFor();
      assert.equal(await world.getAttribute('data-hero-texture'), 'scholar-idle', 'encounters use the standing texture instead of a frozen walk frame');
      const idleFrame = await world.getAttribute('data-walk-frame');
      await page.waitForTimeout(150);
      assert.equal(await world.getAttribute('data-walk-frame'), idleFrame, 'idle pose stays still during encounters');
      if (encounter === 0) await page.screenshot({ path: 'test-results/phaser-idle.png' });
      await page.getByRole('button', { name: 'Complete Encounter', exact: true }).click();
      if (encounter === 0) assert.equal(await world.getAttribute('data-enemies'), '1');
      if (encounter < 2) await page.waitForFunction(() => document.querySelector('[data-testid="phaser-world"]').dataset.heroTexture === 'scholar');
    }
    await page.getByTestId('fight-status').getByText('Trail complete!', { exact: true }).waitFor();
    assert.equal(await world.getAttribute('data-hero-texture'), 'scholar-idle', 'result uses standing pose');
    assert.equal(actions.filter(action => action.action === 'complete').length, 1, 'completion submitted once');
    await page.getByRole('button', { name: 'Exit', exact: true }).click();
    assert.equal(await page.locator('canvas').count(), 0, 'engine destroyed on exit');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('tab', { name: 'Hub', exact: true }).click();
    await enter();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(150);
    const canvas = await page.locator('canvas').boundingBox();
    const app = await page.locator('.app').boundingBox();
    assert.equal(Math.round(canvas.width), Math.round(app.width - 4), 'canvas follows desktop shell resize');
    await page.screenshot({ path: 'test-results/phaser-desktop.png' });
    await page.getByRole('button', { name: 'Exit', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('tab', { name: 'Hub', exact: true }).click();
    await page.locator('.page-scroll:not([hidden])').evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
    await page.screenshot({ path: 'test-results/react-desktop.png' });
    const reduced = await browser.newPage({ viewport: { width: 430, height: 932 }, reducedMotion: 'reduce' });
    reduced.on('pageerror', error => errors.push(error.message));
    await reduced.route('**/api/game', route => route.fulfill({ json: state }));
    let failGround = true;
    await reduced.route(/_01_ground.*\.webp/, route => {
      if (failGround) return route.abort();
      return route.continue();
    });
    await reduced.goto(process.env.APP_URL || 'http://localhost:5173', { waitUntil: 'networkidle' });
    await reduced.getByRole('button', { name: 'Continue Adventure', exact: true }).click();
    await reduced.getByRole('button', { name: 'Start Adventure', exact: true }).click();
    await reduced.getByRole('alert').getByText('Some assets failed to load.', { exact: true }).waitFor();
    failGround = false;
    await reduced.getByRole('button', { name: 'Retry', exact: true }).click();
    await reduced.getByTestId('gate-ready').waitFor({ state: 'hidden' });
    await reduced.getByRole('button', { name: 'Debug controls', exact: true }).waitFor();
    const reducedWorld = reduced.getByTestId('phaser-world');
    const reducedFrame = await reducedWorld.getAttribute('data-walk-frame');
    await reduced.waitForTimeout(250);
    assert.equal(await reducedWorld.getAttribute('data-walk-frame'), reducedFrame, 'reduced motion freezes walk animation');
    assert.equal(await reduced.locator('canvas').count(), 1, 'asset retry replaces the failed engine');
    await reduced.getByRole('button', { name: 'Exit', exact: true }).click();
    assert.equal(await reduced.locator('canvas').count(), 0);
    await reduced.close();
    assert.deepEqual(errors, []);
    console.log('PASS React pages, upload/summon, Phaser WebGL/walk/pause/encounters, gate hold, resize, cleanup/re-entry, asset retry, reduced motion');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
