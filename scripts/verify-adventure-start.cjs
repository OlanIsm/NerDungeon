const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const state = {
  gold: 1450, gems: 320, xp: 1771, favor: 3, inventory: [],
  lastAdventure: { expeditionId: 'biology', chapter: 1 },
  expeditions: [{ id: 'biology', title: 'Biologi — Fotosintesis', file: 'Fotosintesis_Lengkap_Revisi.pdf', progress: 33,
    regions: [1, 2, 3].map(chapter => ({ chapter, title: `Server Chapter ${chapter}`, summary: 'Study', topics: ['Study'], questions: 10, enemies: chapter })) }],
};
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    for (const scenario of ['late response', 'backend starts after page']) {
      const page = await browser.newPage();
      page.setDefaultTimeout(5000);
      const actions = [], errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let reads = 0, release;
      const waiting = new Promise(resolve => { release = resolve; });
      await page.route('**/api/game', async route => {
        if (route.request().method() === 'POST') {
          actions.push(route.request().postDataJSON());
          return route.fulfill({ json: state });
        }
        reads++;
        if (reads === 1) {
          if (scenario === 'backend starts after page') return route.fulfill({ status: 503, json: { error: 'Backend booting' } });
          await waiting;
        }
        return route.fulfill({ json: state });
      });
      await page.goto(process.env.APP_URL || 'http://localhost:5173', { waitUntil: 'domcontentloaded' });
      if (scenario === 'backend starts after page') await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByRole('button', { name: 'Continue Adventure', exact: true }).click();
      await page.getByRole('button', { name: 'Start Adventure', exact: true }).waitFor();
      if (scenario === 'late response') {
        const response = page.waitForResponse(response => response.url().endsWith('/api/game'));
        release(); await response;
        await page.getByText('Server Chapter 2', { exact: false }).first().waitFor();
      }
      await page.getByRole('button', { name: 'Start Adventure', exact: true }).click();
      await page.getByTestId('fight-page').waitFor();
      assert.deepEqual(actions[0], { action: 'start', expeditionId: 'biology', chapter: 2 }, scenario);
      assert.deepEqual(errors, []);
      await page.close();
      console.log('PASS adventure start:', scenario);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
