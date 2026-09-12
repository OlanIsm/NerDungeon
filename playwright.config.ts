import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3102",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    viewport: { width: 375, height: 812 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/fixtures/start-auth-app.ts",
    url: "http://127.0.0.1:3102/login",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
