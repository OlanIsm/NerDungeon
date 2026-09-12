import { expect, test, type Page, type APIRequestContext } from "@playwright/test";
import { fixtureSession, fixtureCookie, fixtureUser } from "../fixtures/auth-server";

const fixtureURL = "http://127.0.0.1:54329/__fixture/state";

async function setFixture(request: APIRequestContext, state: Record<string, unknown>) {
  return request.post(fixtureURL, { data: state });
}

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(fixtureUser.email);
  await page.getByLabel("Password", { exact: true }).fill("fixture-password");
  await page.getByRole("button", { name: "Sign in & enter the hall" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(`Signed in as ${fixtureUser.email}`)).toBeVisible();
}

test.beforeEach(async ({ request }) => {
  await setFixture(request, { unavailable: false, signOutFailure: false, delayMs: 0, refreshes: 0, logouts: 0, loginAttempts: 0 });
});

test("anonymous visitors are redirected and the current-user API returns 401", async ({ page, request }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Enter the hall" })).toBeVisible();
  const response = await request.get("/api/me");
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: "unauthenticated" });
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("sign in, refresh, resolve identity, and sign out", async ({ page, context }) => {
  await signIn(page);
  await page.reload();
  await expect(page.getByText(`Signed in as ${fixtureUser.email}`)).toBeVisible();
  const response = await context.request.get("/api/me");
  expect(await response.json()).toEqual({ user: { id: fixtureUser.id, email: fixtureUser.email }, entitlements: null });
  expect(response.headers()["cache-control"]).toContain("private");
  const authCookie = (await context.cookies()).find((cookie) => cookie.name === "sb-127-auth-token");
  expect(authCookie?.secure).toBe(true);
  expect(authCookie?.sameSite).toBe("Lax");
  await page.goto("/login?next=https://evil.example");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await context.request.get("/api/me")).status()).toBe(401);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("invalid credentials, pending state, and service errors are recoverable", async ({ page, request }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(fixtureUser.email);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in & enter the hall" }).click();
  await expect(page.getByText(/Check your email and password/)).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveValue(fixtureUser.email);
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await setFixture(request, { unavailable: true });
  await page.getByLabel("Password", { exact: true }).fill("fixture-password");
  await page.getByRole("button", { name: "Sign in & enter the hall" }).click();
  await expect(page.getByText("Sign-in is temporarily unavailable. Please try again shortly.")).toBeVisible();
  await setFixture(request, { unavailable: false, delayMs: 300 });
  await page.getByLabel("Password", { exact: true }).fill("fixture-password");
  await page.getByRole("button", { name: "Sign in & enter the hall" }).click();
  await expect(page.getByRole("button", { name: "Signing in…" })).toBeDisabled();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("expired sessions refresh before rendering, and cookie user data is never trusted", async ({ page, context, request }) => {
  const expired = fixtureSession(true);
  expired.user = { ...expired.user, email: "forged@example.test" };
  await context.addCookies([{ name: "sb-127-auth-token", value: fixtureCookie(expired).split("=")[1], url: "http://127.0.0.1:3102" }]);
  await page.goto("/dashboard");
  await expect(page.getByText(`Signed in as ${fixtureUser.email}`)).toBeVisible();
  await expect(page.getByText("forged@example.test")).toHaveCount(0);
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard$/);
  const state = await (await request.get(fixtureURL)).json();
  expect(state.refreshes).toBe(1);
});

test("sign-out failures do not pretend to succeed", async ({ page, request }) => {
  await signIn(page);
  await setFixture(request, { signOutFailure: true });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByText("We couldn’t sign you out. Please try again.")).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard$/);
  await setFixture(request, { signOutFailure: false });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("mobile and desktop RPG surfaces have no overflow and support keyboard navigation", async ({ page }, testInfo) => {
  for (const width of [320, 375, 414, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/login"]) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${route === "/" ? "home" : "login"}-${width}.png`), fullPage: true });
    }
  }
  await page.goto("/login");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await signIn(page);
  for (const width of [320, 375, 414, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`hall-${width}.png`), fullPage: true });
  }
});
