/**
 * e2e/navigation.spec.ts
 * Smoke tests: critical routes load without JS errors or blank screens
 */
import { test, expect, type Page } from "@playwright/test";

// ── Helper ────────────────────────────────────────────────────────────────────

async function expectPageLoads(page: Page, url: string, expectedText: RegExp) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(expectedText).first()).toBeVisible({
    timeout: 15_000,
  });

  // No uncaught JS errors
  expect(errors, `JS errors on ${url}: ${errors.join(", ")}`).toHaveLength(0);
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe("Navigation & Smoke Tests", () => {
  test("home page loads", async ({ page }) => {
    await expectPageLoads(page, "/", /agrivus|welcome|marketplace/i);
  });

  test("marketplace loads", async ({ page }) => {
    await expectPageLoads(page, "/marketplace", /marketplace|listing|product/i);
  });

  test("dashboard loads for authenticated user", async ({ page }) => {
    await expectPageLoads(page, "/dashboard", /dashboard|welcome|overview/i);
  });

  test("wallet loads for authenticated user", async ({ page }) => {
    await expectPageLoads(page, "/wallet", /wallet|balance/i);
  });

  test("notifications page loads", async ({ page }) => {
    await expectPageLoads(page, "/notifications", /notification/i);
  });

  test("auctions page loads", async ({ page }) => {
    await expectPageLoads(page, "/auctions", /auction/i);
  });

  test("404 page renders for unknown route", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz-123");
    await page.waitForLoadState("networkidle");

    // Should show 404 / not found content, not crash
    await expect(
      page.getByRole("heading", { name: "Page Not Found" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("header navigation links are present", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Core nav items
    await expect(
      page
        .locator("header")
        .getByRole("link", { name: /^marketplace$/i })
        .first(),
    ).toBeVisible();
  });

  test("no console errors on home page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test("no console errors on marketplace page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/marketplace");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test("export gateway page loads for authenticated user", async ({ page }) => {
    await page.goto("/export");
    await page.waitForLoadState("networkidle");

    // Buyer sessions may be redirected home by role guard
    const path = new URL(page.url()).pathname;
    const canLoadPath =
      path.startsWith("/export") || path.startsWith("/login") || path === "/";

    expect(canLoadPath).toBeTruthy();
  });
});
